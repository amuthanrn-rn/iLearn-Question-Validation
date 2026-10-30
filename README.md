# iLearn AI Question Quality Validator

## Overview
Internal administrative application to inspect, verify, and improve the quality of the iLearn question bank using AI validation.

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express.js, Sequelize ORM
- Database: PostgreSQL
- Background Jobs: Redis, BullMQ
- AI: DeepSeek Cloud API (primary), Ollama (optional), Mock (testing)

## Ports
- Frontend: http://localhost:5173
- Backend: http://localhost:5002

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Installation
`ash
npm run install:all
`

### Configuration
Copy server/.env.example to server/.env and configure database and API keys.

### Development
`ash
npm run dev
`

### Database
Import the sample data using the SQL file in reference-data/ or configure your own database.

## Features
- Dashboard with statistics
- Question bank browsing and filtering
- AI-powered question validation
- Background job processing
- Publication status management
- Human review workflow
- Reports and exports
