# E-Commerce-Web-Application

This file provides context about the project for AI assistants.

## Project Overview

- **Ecosystem**: Typescript

## Tech Stack

- **Runtime**: node
- **Package Manager**: npm

### Frontend

- Framework: react-vite
- CSS: tailwind
- UI Library: shadcn-ui

### Backend

- Framework: express
- API: ts-rest
- Validation: zod

### Database

- Database: mongodb
- ORM: mongoose

### Authentication

- Provider: better-auth

### Additional Features

- Payments: stripe

## Project Structure

```
E-Commerce-Web-Application/
├── apps/
│   ├── web/         # Frontend application
│   └── server/      # Backend API
├── packages/
│   ├── api/         # API layer
│   ├── auth/        # Authentication
│   └── db/          # Database schema
```

## Common Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open database UI

## Maintenance

Keep CLAUDE.md updated when:

- Adding/removing dependencies
- Changing project structure
- Adding new features or services
- Modifying build/dev workflows

AI assistants should suggest updates to this file when they notice relevant changes.
