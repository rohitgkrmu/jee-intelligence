# JEE Pulse by ZenithSchool.ai

AI-powered JEE trend intelligence and diagnostic testing platform. Get personalized insights and study recommendations to ace your JEE preparation.

## Features

- **JEE Pulse Intelligence**: AI-driven analysis of 5+ years of JEE Main & Advanced papers
- **Rising/Falling Concepts**: Track which topics are trending up or down
- **Chapter Weightage**: Understand the distribution of questions across subjects
- **High ROI Topics**: Identify concepts with the best return on investment
- **Diagnostic Testing**: 12-question assessment to evaluate JEE readiness
- **Personalized Reports**: Get detailed analysis with study recommendations
- **Admin Panel**: Manage questions, import data, view leads

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 with custom Zenith design system
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT for admin panel
- **Charts**: Recharts
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd jee-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

4. Start the database (using Docker):
   ```bash
   docker-compose up -d postgres
   ```

5. Run database migrations and seed:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

### Admin Access

After seeding, you can access the admin panel at `/admin/login` with:
- Email: `admin@zenithschool.ai` (or value from ADMIN_EMAIL env)
- Password: `admin123456` (or value from ADMIN_PASSWORD env)

## Project Structure

```
jee-intelligence/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed/              # Seed data
├── public/                # Static assets
├── src/
│   ├── app/
│   │   ├── (public)/      # Public pages (insights, diagnostic, report)
│   │   ├── admin/         # Admin panel pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── charts/        # Chart components
│   │   └── layout/        # Layout components
│   └── lib/
│       ├── db.ts          # Prisma client
│       ├── auth.ts        # JWT authentication
│       ├── rate-limit.ts  # Rate limiting
│       ├── validation/    # Zod schemas
│       ├── insights/      # Insights engine
│       └── diagnostic/    # Diagnostic system
├── docker-compose.yml     # Docker services
└── .env.example           # Environment template
```

## API Endpoints

### Public

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/diagnostic/start` | POST | Start a diagnostic attempt |
| `/api/diagnostic/[attemptId]` | GET | Get current question |
| `/api/diagnostic/[attemptId]/answer` | POST | Submit answer |
| `/api/report/[token]` | GET | Get report data |
| `/api/insights/trends` | GET | Get concept trends |
| `/api/insights/weightage` | GET | Get weightage data |
| `/api/insights/roi` | GET | Get ROI calculations |

### Admin (Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Admin login |
| `/api/questions` | GET/POST | List/create questions |
| `/api/questions/[id]` | GET/PUT/DELETE | Question CRUD |
| `/api/leads` | GET | List leads |
| `/api/leads/export` | GET | Export leads CSV |
| `/api/import/upload` | POST | Upload import file |
| `/api/import/commit` | POST | Commit import |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiration (e.g., "7d") | No |
| `ADMIN_EMAIL` | Default admin email | No |
| `ADMIN_PASSWORD` | Default admin password | No |
| `NEXT_PUBLIC_BASE_URL` | App base URL | Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

## Development

### Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
```

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Docker

```bash
docker-compose up -d
```

## License

Proprietary - ZenithSchool.ai

## Support

For questions or support, contact: support@zenithschool.ai
