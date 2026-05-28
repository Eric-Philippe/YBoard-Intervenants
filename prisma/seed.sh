node -e "
const XLSX = require('xlsx');
const wb = XLSX.readFile('dataset.xlsx');
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log('=== SHEET:', name, '===');
  data.slice(0, 5).forEach((row, i) => console.log(i, JSON.stringify(row)));
  console.log('Total rows:', data.length);
  console.log();
});
"

node -e "
const XLSX = require('xlsx');
const wb = XLSX.readFile('dataset.xlsx');
const result = {};
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  // Filter empty rows, skip header row
  const rows = data.slice(1).filter(r => r[1] && r[1].toString().trim());
  result[name] = rows.map(r => ({
    niveau: r[0] ? r[0].toString().trim() : '',
    matiere: r[1] ? r[1].toString().trim() : '',
    objectifs: r[2] ? r[2].toString().trim() : '',
    vh: r[3] ? parseInt(r[3]) || 0 : 0,
    mentor: r[4] ? r[4].toString().trim().toUpperCase() === 'OUI' : false,
    periode: r[5] ? r[5].toString().trim() : '',
  }));
});
console.log(JSON.stringify(result, null, 2));
" > /tmp/dataset_parsed.json
echo "Done, size: $(wc -c < /tmp/dataset_parsed.json) bytes"

node -e "
const data = require('/tmp/dataset_parsed.json');
Object.entries(data).forEach(([sheet, rows]) => {
  console.log(sheet + ': ' + rows.length + ' matières');
  rows.forEach((r,i) => console.log('  ' + (i+1) + '. ' + r.matiere + ' | VH:' + r.vh + ' | mentor:' + r.mentor + ' | periode:' + r.periode));
});
"

node -e "
const data = require('/tmp/dataset_parsed.json');

// Fix the Excel date serial number issue (46538 = Juin)
Object.values(data).forEach(rows => {
  rows.forEach(r => {
    if (typeof r.periode === 'number' || /^\d{5}$/.test(r.periode)) {
      r.periode = 'Juin';
    }
  });
});

// Category metadata mapping
const categoryMeta = {
  B1: { slug: 'bachelor-1', label: 'Bachelor 1', level: 'bachelor', year: 1, specialization: null, sortOrder: 1,
    title: 'Bachelor 1 - Première année',
    intro: \"Bienvenue dans le questionnaire pour les interventions en Bachelor 1. Cette promotion est composée d'étudiants débutant leur parcours en informatique. Les modules couvrent les fondamentaux du développement web, de l'algorithmie, des réseaux et de la programmation.\" },
  B2_INFORMATIQUE: { slug: 'bachelor-2-informatique', label: 'Bachelor 2 - Informatique', level: 'bachelor', year: 2, specialization: 'informatique', sortOrder: 2,
    title: 'Bachelor 2 - Spécialisation Informatique',
    intro: \"Cette promotion approfondit le développement web, les bases de données, la cybersécurité et le DevOps. Les étudiants ont déjà des bases en algorithmique et développement web.\" },
  'B2_IA & DATA': { slug: 'bachelor-2-ia-data', label: 'Bachelor 2 - IA & Data', level: 'bachelor', year: 2, specialization: 'ia_data', sortOrder: 3,
    title: 'Bachelor 2 - Spécialisation IA & Data',
    intro: \"Cette promo aborde la data engineering, la business intelligence et l'analyse de données. Les étudiants maîtrisent Python et souhaitent se spécialiser dans la data science.\" },
  B3_DEVELOPPEMENT: { slug: 'bachelor-3-developpement', label: 'Bachelor 3 - Développement', level: 'bachelor', year: 3, specialization: 'developpement', sortOrder: 4,
    title: 'Bachelor 3 - Spécialisation Développement',
    intro: \"En troisième année, les étudiants approfondissent l'architecture logicielle, le développement fullstack moderne et les pratiques DevOps avancées.\" },
  'B3_IA & DATA': { slug: 'bachelor-3-ia-data', label: 'Bachelor 3 - IA & Data', level: 'bachelor', year: 3, specialization: 'ia_data', sortOrder: 5,
    title: 'Bachelor 3 - Spécialisation IA & Data',
    intro: \"Cette promotion s'oriente vers le machine learning appliqué, les pipelines de données et la BI avancée. Les étudiants ont une bonne maîtrise de Python et du SQL.\" },
  M1_DEVFULLSTACK: { slug: 'mastere-1-dev-fullstack', label: 'Mastère 1 - Développement Fullstack', level: 'mastere', year: 1, specialization: 'dev_fullstack', sortOrder: 6,
    title: 'Mastère 1 - Expert Développement Logiciel Fullstack',
    intro: \"Ce programme forme des développeurs fullstack experts capables de concevoir, développer et déployer des applications web complexes en utilisant les derniers outils et méthodologies du secteur.\" },
  M2_DEVFULLSTACK: { slug: 'mastere-2-dev-fullstack', label: 'Mastère 2 - Développement Fullstack', level: 'mastere', year: 2, specialization: 'dev_fullstack', sortOrder: 7,
    title: 'Mastère 2 - Expert Développement Logiciel Fullstack',
    intro: \"La deuxième année du mastère approfondit les sujets avancés de web services, développement cloud, coordination frontend/backend et conteneurisation.\" },
  M1_DEVLMI: { slug: 'mastere-1-dev-mobile-iot', label: 'Mastère 1 - Développement Mobile & IoT', level: 'mastere', year: 1, specialization: 'dev_mobile_iot', sortOrder: 8,
    title: 'Mastère 1 - Expert Développement Logiciel Mobile et IoT',
    intro: \"Ce programme forme des experts en développement mobile (Android, Flutter, React Native) et en solutions IoT connectées. Les étudiants apprennent à concevoir des applications performantes et des architectures embarquées.\" },
  M2_DEVLMI: { slug: 'mastere-2-dev-mobile-iot', label: 'Mastère 2 - Développement Mobile & IoT', level: 'mastere', year: 2, specialization: 'dev_mobile_iot', sortOrder: 9,
    title: 'Mastère 2 - Expert Développement Logiciel Mobile et IoT',
    intro: \"La deuxième année approfondit le développement mobile natif, les web services et le développement cloud pour des applications embarquées de grande envergure.\" },
  M1_INTEGRATIONIA: { slug: 'mastere-1-integration-ia-dev', label: 'Mastère 1 - Intégration IA & Développement', level: 'mastere', year: 1, specialization: 'integration_ia_dev', sortOrder: 10,
    title: 'Mastère 1 - Expert en Intégration d\\'IA et Développement Logiciel',
    intro: \"Ce programme unique forme des développeurs capables d'intégrer les technologies d'intelligence artificielle (LLMs, deep learning) dans des applications logicielles robustes et scalables.\" },
  M1_EIA: { slug: 'mastere-1-expert-ia', label: 'Mastère 1 - Expert IA', level: 'mastere', year: 1, specialization: 'expert_ia', sortOrder: 11,
    title: 'Mastère 1 - Expert en Intelligence Artificielle',
    intro: \"Ce programme avancé couvre les fondements théoriques et pratiques de l'IA moderne, du machine learning au deep learning, en passant par le NLP et la visualisation data.\" },
  M2_EIA: { slug: 'mastere-2-expert-ia', label: 'Mastère 2 - Expert IA', level: 'mastere', year: 2, specialization: 'expert_ia', sortOrder: 12,
    title: 'Mastère 2 - Expert en Intelligence Artificielle',
    intro: \"La deuxième année explore les frontières de l'IA : deep learning avancé, NLP, LLMs, MLOps et industrialisation de l'IA dans le cloud.\" },
  M1_DATAENG: { slug: 'mastere-1-data-engineer', label: 'Mastère 1 - Data Engineering', level: 'mastere', year: 1, specialization: 'data_engineer', sortOrder: 13,
    title: 'Mastère 1 - Expert Data Engineering',
    intro: \"Ce programme forme des Data Engineers capables de concevoir, construire et maintenir des architectures de données robustes et scalables pour des besoins analytiques et opérationnels.\" },
  M1_SYSEMB: { slug: 'mastere-1-systemes-embarques', label: 'Mastère 1 - Systèmes Embarqués', level: 'mastere', year: 1, specialization: 'systemes_embarques', sortOrder: 14,
    title: 'Mastère 1 - Expert Systèmes Embarqués et Objets Connectés',
    intro: \"Ce programme forme des experts en programmation embarquée, systèmes temps réel et architecture firmware, pour des applications dans l'industrie et l'IoT.\" },
  M2_SYSEMB: { slug: 'mastere-2-systemes-embarques', label: 'Mastère 2 - Systèmes Embarqués', level: 'mastere', year: 2, specialization: 'systemes_embarques', sortOrder: 15,
    title: 'Mastère 2 - Expert Systèmes Embarqués et Objets Connectés',
    intro: \"La deuxième année s'oriente vers les systèmes critiques, l'IA embarquée, la physique mécanique et la certification de systèmes embarqués industriels.\" },
};

// Output count
Object.entries(categoryMeta).forEach(([sheet, meta]) => {
  const rows = data[sheet] || [];
  console.log(sheet + ': ' + rows.length + ' subjects');
});
"

node << 'SCRIPT'
const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('dataset.xlsx');
const result = {};
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const rows = data.slice(1).filter(r => r[1] && r[1].toString().trim());
  result[name] = rows.map(r => ({
    matiere: r[1] ? r[1].toString().trim() : '',
    objectifs: r[2] ? r[2].toString().trim() : '',
    vh: r[3] ? (parseInt(r[3]) || 0) : 0,
    mentor: r[4] ? r[4].toString().trim().toUpperCase() === 'OUI' : false,
    periode: r[5] ? (typeof r[5] === 'number' ? 'Juin' : r[5].toString().trim()) : '',
  }));
});

const categoryMeta = [
  { sheet: 'B1', slug: 'bachelor-1', label: 'Bachelor 1', level: 'bachelor', year: 1, specialization: null, sortOrder: 1,
    title: 'Bachelor 1 - Première année',
    intro: "Bienvenue dans le questionnaire pour les interventions en Bachelor 1. Cette promotion est composée d'étudiants débutant leur parcours en informatique. Les modules couvrent les fondamentaux du développement web, de l'algorithmie, des réseaux et de la programmation." },
  { sheet: 'B2_INFORMATIQUE', slug: 'bachelor-2-informatique', label: 'Bachelor 2 - Informatique', level: 'bachelor', year: 2, specialization: 'informatique', sortOrder: 2,
    title: 'Bachelor 2 - Spécialisation Informatique',
    intro: "Cette promotion approfondit le développement web, les bases de données, la cybersécurité et le DevOps. Les étudiants ont déjà des bases en algorithmique et développement web." },
  { sheet: 'B2_IA & DATA', slug: 'bachelor-2-ia-data', label: 'Bachelor 2 - IA & Data', level: 'bachelor', year: 2, specialization: 'ia_data', sortOrder: 3,
    title: 'Bachelor 2 - Spécialisation IA & Data',
    intro: "Cette promo aborde la data engineering, la business intelligence et l'analyse de données. Les étudiants maîtrisent Python et souhaitent se spécialiser dans la data science." },
  { sheet: 'B3_DEVELOPPEMENT', slug: 'bachelor-3-developpement', label: 'Bachelor 3 - Développement', level: 'bachelor', year: 3, specialization: 'developpement', sortOrder: 4,
    title: 'Bachelor 3 - Spécialisation Développement',
    intro: "En troisième année, les étudiants approfondissent l'architecture logicielle, le développement fullstack moderne et les pratiques DevOps avancées." },
  { sheet: 'B3_IA & DATA', slug: 'bachelor-3-ia-data', label: 'Bachelor 3 - IA & Data', level: 'bachelor', year: 3, specialization: 'ia_data', sortOrder: 5,
    title: 'Bachelor 3 - Spécialisation IA & Data',
    intro: "Cette promotion s'oriente vers le machine learning appliqué, les pipelines de données et la BI avancée. Les étudiants ont une bonne maîtrise de Python et du SQL." },
  { sheet: 'M1_DEVFULLSTACK', slug: 'mastere-1-dev-fullstack', label: 'Mastère 1 - Développement Fullstack', level: 'mastere', year: 1, specialization: 'dev_fullstack', sortOrder: 6,
    title: 'Mastère 1 - Expert Développement Logiciel Fullstack',
    intro: "Ce programme forme des développeurs fullstack experts capables de concevoir, développer et déployer des applications web complexes en utilisant les derniers outils et méthodologies du secteur." },
  { sheet: 'M2_DEVFULLSTACK', slug: 'mastere-2-dev-fullstack', label: 'Mastère 2 - Développement Fullstack', level: 'mastere', year: 2, specialization: 'dev_fullstack', sortOrder: 7,
    title: 'Mastère 2 - Expert Développement Logiciel Fullstack',
    intro: "La deuxième année du mastère approfondit les sujets avancés de web services, développement cloud, coordination frontend/backend et conteneurisation." },
  { sheet: 'M1_DEVLMI', slug: 'mastere-1-dev-mobile-iot', label: 'Mastère 1 - Développement Mobile & IoT', level: 'mastere', year: 1, specialization: 'dev_mobile_iot', sortOrder: 8,
    title: 'Mastère 1 - Expert Développement Logiciel Mobile et IoT',
    intro: "Ce programme forme des experts en développement mobile (Android, Flutter, React Native) et en solutions IoT connectées. Les étudiants apprennent à concevoir des applications performantes et des architectures embarquées." },
  { sheet: 'M2_DEVLMI', slug: 'mastere-2-dev-mobile-iot', label: 'Mastère 2 - Développement Mobile & IoT', level: 'mastere', year: 2, specialization: 'dev_mobile_iot', sortOrder: 9,
    title: 'Mastère 2 - Expert Développement Logiciel Mobile et IoT',
    intro: "La deuxième année approfondit le développement mobile natif, les web services et le développement cloud pour des applications embarquées de grande envergure." },
  { sheet: 'M1_INTEGRATIONIA', slug: 'mastere-1-integration-ia-dev', label: "Mastère 1 - Intégration IA & Développement", level: 'mastere', year: 1, specialization: 'integration_ia_dev', sortOrder: 10,
    title: "Mastère 1 - Expert en Intégration d'IA et Développement Logiciel",
    intro: "Ce programme unique forme des développeurs capables d'intégrer les technologies d'intelligence artificielle (LLMs, deep learning) dans des applications logicielles robustes et scalables." },
  { sheet: 'M1_EIA', slug: 'mastere-1-expert-ia', label: 'Mastère 1 - Expert IA', level: 'mastere', year: 1, specialization: 'expert_ia', sortOrder: 11,
    title: 'Mastère 1 - Expert en Intelligence Artificielle',
    intro: "Ce programme avancé couvre les fondements théoriques et pratiques de l'IA moderne, du machine learning au deep learning, en passant par le NLP et la visualisation data." },
  { sheet: 'M2_EIA', slug: 'mastere-2-expert-ia', label: 'Mastère 2 - Expert IA', level: 'mastere', year: 2, specialization: 'expert_ia', sortOrder: 12,
    title: 'Mastère 2 - Expert en Intelligence Artificielle',
    intro: "La deuxième année explore les frontières de l'IA : deep learning avancé, NLP, LLMs, MLOps et industrialisation de l'IA dans le cloud." },
  { sheet: 'M1_DATAENG', slug: 'mastere-1-data-engineer', label: 'Mastère 1 - Data Engineering', level: 'mastere', year: 1, specialization: 'data_engineer', sortOrder: 13,
    title: 'Mastère 1 - Expert Data Engineering',
    intro: "Ce programme forme des Data Engineers capables de concevoir, construire et maintenir des architectures de données robustes et scalables pour des besoins analytiques et opérationnels." },
  { sheet: 'M1_SYSEMB', slug: 'mastere-1-systemes-embarques', label: 'Mastère 1 - Systèmes Embarqués', level: 'mastere', year: 1, specialization: 'systemes_embarques', sortOrder: 14,
    title: 'Mastère 1 - Expert Systèmes Embarqués et Objets Connectés',
    intro: "Ce programme forme des experts en programmation embarquée, systèmes temps réel et architecture firmware, pour des applications dans l'industrie et l'IoT." },
  { sheet: 'M2_SYSEMB', slug: 'mastere-2-systemes-embarques', label: 'Mastère 2 - Systèmes Embarqués', level: 'mastere', year: 2, specialization: 'systemes_embarques', sortOrder: 15,
    title: 'Mastère 2 - Expert Systèmes Embarqués et Objets Connectés',
    intro: "La deuxième année s'oriente vers les systèmes critiques, l'IA embarquée, la physique mécanique et la certification de systèmes embarqués industriels." },
];

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

let lines = [];
lines.push('import { PrismaClient } from "@prisma/client";');
lines.push('import bcrypt from "bcrypt";');
lines.push('');
lines.push('const prisma = new PrismaClient();');
lines.push('');
lines.push('type SubjectData = {');
lines.push('  title: string;');
lines.push('  volumeHoraire: number;');
lines.push('  periode: string;');
lines.push('  avecMentor: boolean;');
lines.push('  contenu: string;');
lines.push('  sortOrder: number;');
lines.push('};');
lines.push('');
lines.push('type CategoryData = {');
lines.push('  slug: string;');
lines.push('  label: string;');
lines.push('  level: string;');
lines.push('  year: number;');
lines.push('  specialization?: string;');
lines.push('  sortOrder: number;');
lines.push('  title: string;');
lines.push('  introduction: string;');
lines.push('  subjects: SubjectData[];');
lines.push('};');
lines.push('');
lines.push('const categorySeedData: CategoryData[] = [');

categoryMeta.forEach(meta => {
  const subjects = result[meta.sheet] || [];
  const specProp = meta.specialization ? `specialization: "${meta.specialization}", ` : '';
  lines.push(`  {`);
  lines.push(`    slug: "${meta.slug}", label: "${meta.label}",`);
  lines.push(`    level: "${meta.level}", year: ${meta.year}, ${specProp}sortOrder: ${meta.sortOrder},`);
  lines.push(`    title: "${meta.title.replace(/"/g, '\\"')}",`);
  lines.push(`    introduction: "${meta.intro.replace(/"/g, '\\"')}",`);
  lines.push(`    subjects: [`);
  subjects.forEach((s, i) => {
    const contenu = esc(s.objectifs);
    const titre = s.matiere.replace(/"/g, '\\"');
    const periode = s.periode.replace(/"/g, '\\"');
    lines.push(`      { title: "${titre}", volumeHoraire: ${s.vh}, periode: "${periode}", avecMentor: ${s.mentor}, contenu: \`${contenu}\`, sortOrder: ${i+1} },`);
  });
  lines.push(`    ],`);
  lines.push(`  },`);
});

lines.push('];');
lines.push('');
lines.push('async function seedSurvey() {');
lines.push('  const count = await prisma.surveyCategory.count();');
lines.push('  if (count > 0) {');
lines.push('    console.log("Survey data already seeded, skipping.");');
lines.push('    return;');
lines.push('  }');
lines.push('');
lines.push('  console.log("Seeding survey categories and subjects...");');
lines.push('  for (const cat of categorySeedData) {');
lines.push('    await prisma.surveyCategory.create({');
lines.push('      data: {');
lines.push('        slug: cat.slug,');
lines.push('        label: cat.label,');
lines.push('        level: cat.level,');
lines.push('        year: cat.year,');
lines.push('        specialization: cat.specialization ?? null,');
lines.push('        sortOrder: cat.sortOrder,');
lines.push('        title: cat.title,');
lines.push('        introduction: cat.introduction,');
lines.push('        subjects: {');
lines.push('          create: cat.subjects.map((s) => ({');
lines.push('            title: s.title,');
lines.push('            volumeHoraire: s.volumeHoraire,');
lines.push('            periode: s.periode,');
lines.push('            avecMentor: s.avecMentor,');
lines.push('            contenu: s.contenu,');
lines.push('            sortOrder: s.sortOrder,');
lines.push('          })),');
lines.push('        },');
lines.push('      },');
lines.push('    });');
lines.push('  }');
lines.push('  console.log("Survey data seeded successfully.");');
lines.push('}');
lines.push('');
lines.push('async function seedDefaultUser() {');
lines.push('  const email = "admin@ylab.fr";');
lines.push('  const existing = await prisma.users.findFirst({ where: { email } });');
lines.push('  if (existing) {');
lines.push('    console.log("Default user already exists, skipping.");');
lines.push('    return;');
lines.push('  }');
lines.push('  const password = await bcrypt.hash("admin123", 10);');
lines.push('  await prisma.users.create({');
lines.push('    data: {');
lines.push('      firstname: "Admin",');
lines.push('      lastname: "YLab",');
lines.push('      email,');
lines.push('      password,');
lines.push('    },');
lines.push('  });');
lines.push('  console.log(`Default user created: ${email} / admin123`);');
lines.push('}');
lines.push('');
lines.push('async function main() {');
lines.push('  await seedDefaultUser();');
lines.push('  await seedSurvey();');
lines.push('}');
lines.push('');
lines.push('main()');
lines.push('  .catch((e) => {');
lines.push('    console.error(e);');
lines.push('    process.exit(1);');
lines.push('  })');
lines.push('  .finally(() => void prisma.$disconnect());');

fs.writeFileSync('prisma/seed.ts', lines.join('\n'));
console.log('Done! Lines:', lines.length);
SCRIPT