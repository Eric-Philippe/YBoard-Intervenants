# YBoard, Intervenants

YBoard is an internal web application built for Ynov Toulouse to plan and track who teaches what across every program of the school. It brings the recruitment of guest teachers, the assignment of modules, and the follow-up of teaching hours into one place, replacing the spreadsheets that were previously spread across teams.

![Dashboard overview](./img/dashboard.png)

## What problem it solves

Each academic year, program managers need to staff hundreds of modules with the right teachers. A single teacher can work across several programs, a module can be shared between promotions, and every assignment carries an hourly volume and a cost. Keeping that picture accurate by hand is slow and error prone.

YBoard gives each manager a live view of their own scope of programs: which modules are still unstaffed, which candidates are being interviewed, how much of the required teaching load is already covered, and what the projected cost is. Candidates can also apply directly through a public questionnaire, so incoming applications land in the same system that managers use to make decisions.

## Key concepts

Three ideas are worth understanding before using the app.

**Perimeters.** A perimeter is a workspace that groups a set of programs, modules, and settings. Every user belongs to one or more perimeters and works inside one active perimeter at a time, chosen from the sidebar. Teachers are shared across all perimeters (a common base), but comments about a teacher stay private to the perimeter where they were written. This lets several managers use the same instance without stepping on each other's data.

**Assignment statuses.** A teacher can be attached to a module in three states. _Ongoing_ marks a teacher who held the module in a previous year, kept for reference. _Potential_ is a candidate under evaluation, with interview date, notes, and a decision. _Selected_ is a validated assignment that counts toward the module's staffing and cost. Managers move teachers between these states on a drag and drop board.

**Coverage and cost.** For every module the app compares the required hours against the hours already assigned to selected teachers, shows the resulting coverage percentage, and computes the financial charge from each teacher's rate. Rates can be a single hourly value or split between practical work (TDP) and supervised project hours (FFP).

## Main features

### Staffing dashboard

The home screen lists every module of the active perimeter, grouped by promotion, with its workload and the teachers attached in each status. Managers filter which promotions to show and open any module directly from here.

### Assignment board

Each module has a detailed board showing its hours, coverage, projected cost, and the three status columns. Teachers are dragged between columns to update their state, with rules that prevent invalid moves.

![Module assignment board](./img/module_board.png)

### Perimeter management

A dedicated page lists every perimeter with its number of programs, modules, and members, plus a live completion bar. From here managers create perimeters, edit their name, color, and short description, manage membership, switch the active perimeter, and export a completion report as an Excel workbook.

![Perimeter management](./img/perimetres.png)

### Teacher profiles

Each teacher has a profile with contact details, diploma, hourly rate, and an optional CV (PDF upload with preview and replacement). The profile shows every assignment the teacher holds and a comment field scoped to the active perimeter.

![Teacher profile](./img/teacher_details.png)

### Module and program management

Programs (promotions) and modules are created and organized through a guided flow. Modules carry a description, period, mentor flag, and TDP/FFP hour breakdown. A module can be shared (mutualized) across several programs, and bulk data can be imported from an Excel file.

![Module management](./img/modules.png)

### Public application questionnaire

Candidates apply through a public form generated from the real programs and modules of a perimeter. They fill in their background once, then indicate for each subject whether they are willing to teach it. Submissions feed an admin dashboard with response counts, traffic sources, and per subject breakdowns.

![Public questionnaire](./img/survey_form.png)

## Tech stack

| Layer            | Technology                             |
| ---------------- | -------------------------------------- |
| Frontend         | Next.js 15 (App Router), React 19, TypeScript |
| API              | tRPC, Next.js Route Handlers           |
| Database         | PostgreSQL 15, Prisma ORM              |
| UI               | Mantine, Tailwind CSS, Tabler Icons    |
| Auth             | JWT, bcrypt                            |
| Drag and drop    | dnd-kit                                |
| Spreadsheets     | ExcelJS (import and export)            |
| Validation       | Zod                                    |
| Containerization | Docker, Docker Compose                 |

## Getting started

### Prerequisites

- Node.js 22 or later
- npm 10 or later
- PostgreSQL 15 or later (or Docker, see below)

### Installation

```bash
git clone https://github.com/Eric-Philippe/YBoard-Intervenants.git
cd YBoard-Intervenants
npm install
```

### Environment

Create a `.env` file at the project root. A template is provided in `.env.example`.

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/yboard"
JWT_SECRET="change-this-in-production"
NEXT_PUBLIC_ENABLE_SONDAGE="true"
```

`NEXT_PUBLIC_ENABLE_SONDAGE` toggles the public questionnaire and its admin dashboard. Set it to `false` to hide them entirely.

### Database setup

```bash
npm run db:generate    # Generate the Prisma client and run dev migrations
npm run db:migrate     # Apply migrations (production)
npm run db:seed        # Optional: seed an initial admin and sample data
```

The seed creates an administrator account with email `admin@yboard.fr` and password `admin123`. Change these before any real use.

### Development

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

## Available scripts

```bash
# Development
npm run dev              # Start the dev server (Turbopack)
npm run build            # Production build
npm run start            # Start the production build
npm run preview          # Build then start

# Database
npm run db:generate      # Generate Prisma client and run dev migrations
npm run db:migrate       # Apply migrations without generating
npm run db:push          # Push the schema without a migration (dev only)
npm run db:studio        # Open Prisma Studio

# Code quality
npm run check            # Lint and type check
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto fix
npm run typecheck        # TypeScript check only
npm run format:write     # Format with Prettier
```

## Docker

### Docker Compose (recommended)

```bash
docker-compose up -d       # Start the app and its database
docker-compose logs -f     # Follow the logs
docker-compose down        # Stop the containers
docker-compose down -v     # Stop and remove all volumes (this deletes data)
```

Two persistent volumes are created automatically:

- `postgres_data` holds the PostgreSQL data.
- `cv_storage` holds uploaded CV files (`/app/uploads/cv`).

### Backing up CV files

```bash
# Backup
docker cp $(docker-compose ps -q app):/app/uploads/cv ./cv_backup

# Restore
docker cp ./cv_backup/. $(docker-compose ps -q app):/app/uploads/cv/
```

### Manual Docker

```bash
docker build -t yboard-app .

docker run -p 3000:3000 \
  -v yboard_cv_storage:/app/uploads/cv \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/yboard" \
  -e JWT_SECRET="your-secret-key" \
  yboard-app
```

## Project structure

```
src/
  app/
    api/
      cv/                  Upload, view, and delete CVs
      promos/import/       Excel import of modules
      perimeters/          Completion report export
      sondage/export/      Questionnaire export
      trpc/                tRPC handler
    modules/               Module management and assignment board
    teachers/              Teacher list and profiles
    promos/                Program management
    perimetres/            Perimeter management and overview
    sondage/               Public questionnaire and admin
    users/                 User management
  components/              Layout, sidebar, shared modals
  server/api/routers/      tRPC routers (auth, teachers, modules, perimeters, survey, ...)
  contexts/                Auth and modal state
prisma/
  schema.prisma            Database schema
  migrations/              Ordered SQL migrations
uploads/
  cv/                      Stored CV files (not tracked in git)
```

## Access control

Authentication uses a JWT stored client side and mirrored in a cookie so that the Next.js middleware can protect pages. Every route requires a valid session except the login page and the public questionnaire (`/sondage` and `/sondage/[slug]`). The questionnaire admin pages (`/sondage/[slug]/admin`) require a session like the rest of the app.

## CV storage

Uploaded CVs are stored under `uploads/cv/` using the naming convention `[uuid]_[timestamp].pdf`.

- Accepted format: PDF only
- Maximum size: 5 MB
- Endpoints: `POST /api/cv/upload`, `GET /api/cv/[filename]`, `DELETE /api/cv/[filename]`

In Docker, this directory is mapped to a persistent volume so files survive container restarts.

## Database schema

```mermaid
erDiagram
    Users {
        uuid id PK
        varchar firstname
        varchar lastname
        varchar email
        varchar password
        timestamp last_connected
        uuid active_perimeter_id FK
    }

    Perimeter {
        uuid id PK
        varchar title
        varchar slug
        varchar origin
        varchar color
        varchar short_desc
        timestamp created_at
    }

    PerimeterMember {
        uuid id PK
        uuid perimeter_id FK
        uuid user_id FK
        timestamp joined_at
    }

    Promos {
        uuid id PK
        varchar level
        varchar specialty
        varchar icon
        uuid perimeter_id FK
        varchar survey_title
        text survey_introduction
    }

    Modules {
        uuid id PK
        varchar name
        text description
        varchar periode
        boolean avec_mentor
        int nombre_heure_tdp
        int nombre_heure_ffp
        uuid perimeter_id FK
    }

    Teacher {
        uuid id PK
        varchar lastname
        varchar firstname
        varchar status
        varchar diploma
        decimal rate
        varchar email_perso
        varchar email_ynov
        varchar phone_number
        varchar cv_filename
        timestamp cv_uploaded_at
    }

    TeacherComment {
        uuid id PK
        uuid teacher_id FK
        uuid perimeter_id FK
        text comment
        timestamp updated_at
    }

    PromoModules {
        uuid id PK
        uuid module_id FK
        uuid promo_id FK
        int workload
    }

    ongoing {
        uuid teacher_id FK
        uuid promo_modules_id FK
        int workload
        decimal rate
        decimal rateTDP
        decimal rateFFP
    }

    potential {
        uuid teacher_id FK
        uuid promo_modules_id FK
        int workload
        decimal rate
        decimal rateTDP
        decimal rateFFP
        date interview_date
        text interview_comments
        boolean decision
    }

    selected {
        uuid teacher_id FK
        uuid promo_modules_id FK
        int workload
        decimal rate
        decimal rateTDP
        decimal rateFFP
    }

    SurveySubmission {
        uuid id PK
        uuid perimeter_id FK
        varchar nom
        varchar prenom
        varchar email
        varchar telephone
        varchar niveau_academique
        text intitule_diplome
        varchar annees_experience
        text domaines_exercice
        varchar final_choice
        timestamp created_at
    }

    SurveyResponse {
        uuid id PK
        uuid submission_id FK
        uuid promo_modules_id FK
        varchar module_label_snapshot
        varchar response
        text condition_text
    }

    SurveySubmissionTeacher {
        uuid id PK
        uuid submission_id FK
        uuid teacher_id FK
        timestamp linked_at
    }

    Perimeter ||--o{ PerimeterMember : "has members"
    Perimeter ||--o{ Promos : "contains"
    Perimeter ||--o{ Modules : "contains"
    Perimeter ||--o{ TeacherComment : "scopes"
    Perimeter ||--o{ SurveySubmission : "receives"
    Perimeter ||--o{ Users : "active for"
    Users ||--o{ PerimeterMember : "belongs to"
    Promos ||--o{ PromoModules : "has"
    Modules ||--o{ PromoModules : "linked via"
    Teacher ||--o{ ongoing : "assigned"
    Teacher ||--o{ potential : "candidate"
    Teacher ||--o{ selected : "selected"
    Teacher ||--o{ TeacherComment : "has"
    PromoModules ||--o{ ongoing : "contains"
    PromoModules ||--o{ potential : "contains"
    PromoModules ||--o{ selected : "contains"
    PromoModules ||--o{ SurveyResponse : "referenced in"
    SurveySubmission ||--o{ SurveyResponse : "has"
    SurveySubmission ||--o{ SurveySubmissionTeacher : "linked to"
```

## Author and license

Developed by Eric PHILIPPE. Proprietary software, all rights reserved, 2026. The source is made public for consultation only: reading is permitted, any reuse is not. See the [LICENSE](./LICENSE) file for the exact terms. All content is intended for the school and its internal use only.
