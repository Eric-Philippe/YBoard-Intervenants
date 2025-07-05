# YBoard - Teacher Management Platform

## 🎯 About the Project

**YBoard** is a comprehensive management platform specifically developed for **Ynov Toulouse** to handle in-depth candidate management and teacher assignment across all modules and programs of the school.

This application enables centralized and efficient management of teachers/instructors, their assignment to various educational modules, and workload tracking across all Ynov programs.

### 🌟 Key Features

- **Teacher Management**: Create, modify, and delete instructor profiles
- **Module Management**: Organize educational modules by program
- **Program Management**: Administer different programs and specialties
- **Relationship System**: Assign teachers to modules with 3 statuses:
  - 🟢 **Ongoing**: Currently assigned teachers
  - 🟡 **Potential**: Potential teachers (under evaluation)
  - 🔵 **Selected**: Selected teachers (validated for assignment)
- **Workload Management**: Precise tracking of each instructor's hourly volume
- **Drag & Drop Interface**: Intuitive assignment management through drag-and-drop
- **Secure Authentication**: Login system with JWT
- **Interactive Dashboards**: Overview of assignments and statistics

### 🎓 Ynov Context

This platform addresses the specific needs of Ynov Toulouse school to:

- Optimize pedagogical human resource management
- Facilitate instructor assignment to different modules
- Ensure precise workload tracking
- Improve visibility on assignments by program
- Simplify the candidate application and selection process

---

## 🛠️ Technical Architecture

### Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: tRPC + Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **UI/UX**: Mantine UI + Tailwind CSS
- **Authentication**: JWT + bcrypt
- **Drag & Drop**: @dnd-kit
- **Validation**: Zod
- **Containerization**: Docker + Docker Compose

### 📊 Database Schema

```mermaid
erDiagram
    Users {
        uuid Id_Users PK
        varchar_50 firstname "NOT NULL"
        varchar_50 lastname "NOT NULL"
        varchar_50 email "NOT NULL"
        varchar_255 password "NULL"
        timestamp last_connected "NULL"
    }

    Promos {
        uuid Id_Promo PK
        varchar_50 level "NOT NULL"
        varchar_50 specialty "NOT NULL"
    }

    Modules {
        uuid Id_Module PK
        varchar_50 name "NOT NULL"
    }

    Teacher {
        uuid Id_Teacher PK
        varchar_50 lastname "NOT NULL"
        varchar_50 firstname "NOT NULL"
        varchar_50 status "NULL"
        varchar_50 diploma "NULL"
        text comments "NULL"
        decimal_5_2 rate "NULL"
        varchar_50 email_perso "NULL"
        varchar_50 email_ynov "NULL"
        varchar_10 phone_number "NULL"
    }

    PromoModules {
        uuid Id_PromoModules PK
        uuid Id_Module FK "NOT NULL"
        uuid Id_Promo FK "NOT NULL"
        int workload "NOT NULL"
    }

    ongoing {
        uuid Id_Teacher FK "NOT NULL"
        uuid Id_PromoModules FK "NOT NULL"
        int workload "NOT NULL"
    }

    potential {
        uuid Id_Teacher FK "NOT NULL"
        uuid Id_PromoModules FK "NOT NULL"
        int workload "NOT NULL"
        date interview_date "NULL"
        text interview_comments "NULL"
        boolean decision "NULL"
    }

    selected {
        uuid Id_Teacher FK "NOT NULL"
        uuid Id_PromoModules FK "NOT NULL"
        int workload "NOT NULL"
    }

    Promos ||--o{ PromoModules : "has"
    Modules ||--o{ PromoModules : "belongs to"
    Teacher ||--o{ ongoing : "assigned to"
    Teacher ||--o{ potential : "candidate for"
    Teacher ||--o{ selected : "selected for"
    PromoModules ||--o{ ongoing : "contains"
    PromoModules ||--o{ potential : "contains"
    PromoModules ||--o{ selected : "contains"
```

### 🗂️ Project Structure

```
src/
├── app/                      # App Router (Next.js 13+)
│   ├── api/trpc/            # tRPC API routes
│   ├── login/               # Login page
│   ├── modules/             # Module management
│   │   ├── details/         # Module details and assignments
│   │   └── delete/          # Module deletion
│   ├── teachers/            # Teacher management
│   │   ├── details/         # Profile and assignments
│   │   └── delete/          # Teacher deletion
│   ├── promos/              # Program management
│   └── users/               # User management
├── components/              # Reusable components
│   ├── AppLayout.tsx        # Main layout
│   ├── Sidebar.tsx          # Side navigation
│   └── modals/              # Creation modals
├── contexts/                # React contexts
│   ├── AuthContext.tsx      # Authentication
│   └── ModalContext.tsx     # Modal management
├── server/                  # tRPC backend
│   ├── api/                 # API route definitions
│   └── db.ts                # Prisma configuration
├── trpc/                    # tRPC client configuration
└── types/                   # TypeScript types
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** 22+
- **npm** 10+
- **PostgreSQL** 15+
- **Docker** (optional)

### 🔧 Installation and Setup

#### 1. Clone the project

```bash
git clone <repository-url>
cd SourcingIntervenantsYnov
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Environment configuration

Create a `.env` file at the root:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sourcing_intervenants_ynov"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Environment
NODE_ENV="development"
```

#### 4. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 🏃‍♂️ Development

#### Start in development mode

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000)

#### Available scripts

```bash
# Development
npm run dev              # Start with Turbo
npm run build            # Production build
npm run start            # Production start
npm run preview          # Build + Start

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Apply migrations
npm run db:push          # Push schema (dev)
npm run db:studio        # Prisma Studio interface

# Code quality
npm run check            # Lint + TypeScript
npm run lint             # ESLint
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # TypeScript check
npm run format:check     # Prettier check
npm run format:write     # Prettier format
```

### 🐳 Docker Deployment

#### Docker Compose (Recommended)

```bash
# Complete startup (app + database)
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Manual Docker

```bash
# Build image
docker build -t yboard-app .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/sourcing_intervenants_ynov" \
  -e JWT_SECRET="your-secret-key" \
  yboard-app
```

### 🌐 Production

#### Production environment variables

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-production-secret-key"
NODE_ENV="production"
```

#### Build and deployment

```bash
# Production build
npm run build

# Production start
npm run start
```

### 🔐 First Login

1. Create an admin user directly in the database
2. Login at `/login`
3. Access the main dashboard

### 📚 Useful Resources

- **Prisma Documentation**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **tRPC Documentation**: [https://trpc.io/docs](https://trpc.io/docs)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Mantine Documentation**: [https://mantine.dev/](https://mantine.dev/)

---

## 🤝 Contributing

This project was specifically developed for Ynov Toulouse. For any modifications or improvements, please contact me.

## 📝 License

Proprietary project - Eric PHILIPPE © 2025
