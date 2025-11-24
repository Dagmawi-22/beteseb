# MQTT Chat Server

NestJS server application with Drizzle ORM and PostgreSQL.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database running locally or remotely

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`

3. Set up the database:
```bash
# Create the database (if it doesn't exist)
psql -U postgres -c "CREATE DATABASE mqtt_chat;"

# Generate migration files from schema
npm run db:generate

# Push schema changes to database
npm run db:push
```

## Development

Run the server in development mode:
```bash
npm run start:dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

## Database Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio (GUI for database)

## Project Structure

```
src/
├── db/
│   ├── schema.ts        # Database schema definitions
│   ├── database.ts      # Database connection setup
│   └── database.module.ts # NestJS database module
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Run linter

## NestJS Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Discord channel](https://discord.gg/G7Qnnhy)
- [Official video courses](https://courses.nestjs.com/)
