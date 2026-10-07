# TaskForge

TaskForge is a full-stack project and issue management application built with Angular, ASP.NET Core, SQL Server, Entity Framework Core, Docker, JWT authentication, and Google Gemini AI.

It allows users to manage projects, create and track issues, collaborate through comments, view activities, and use an AI assistant to improve software issues.


## Features

- User registration and login
- JWT authentication
- Role-based access control
- Project management
- Project member management
- Issue creation and management
- Issue assignment
- Comments
- Project and issue activity tracking
- AI-powered issue assistant

## User Roles

TaskForge uses role-based access control with three roles:

| Role | Responsibilities |
|---|---|
| **Admin** | Manage projects, users, project members, issues and overall system access |
| **Project Manager** | Create and manage projects, manage project members and manage issues |
| **Developer** | View projects, work with issues, update issues and collaborate through comments |

## Tech Stack

### Frontend

- Angular 18
- TypeScript
- HTML
- CSS
- RxJS

### Backend

- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- JWT Authentication
- BCrypt

### Database

- Microsoft SQL Server
- Entity Framework Core Migrations

### AI

- Google Gemini API

### Tools

- Git
- GitHub
- Docker
- Swagger
- Postman
- VS Code

## Project Structure

```text
TaskForge/
├── backend/
│   └── TaskForge.API/
├── frontend/
│   └── taskforge-client/
├── docs/
├── .gitignore
└── README.md
```

## How to Run

### Prerequisites

Make sure these are installed:

- .NET 10 SDK
- Node.js
- Angular CLI
- Docker Desktop
- Git

### 1. Start SQL Server

Make sure Docker Desktop is running.

```bash
docker start taskforge-sql
```

If the container does not exist yet, create it using:

```bash
docker run \
  --name taskforge-sql \
  -e ACCEPT_EULA=Y \
  -e MSSQL_SA_PASSWORD='YOUR_DATABASE_PASSWORD' \
  -p 1433:1433 \
  -d \
  mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Set Up the Database

Open a terminal and go to the backend:

```bash
cd backend/TaskForge.API
```

Restore the required packages:

```bash
dotnet restore
```

Apply the Entity Framework Core migrations:

```bash
dotnet ef database update
```

This creates and updates the TaskForge database schema in SQL Server.

### 3. Configure Application Secrets

TaskForge uses .NET User Secrets for sensitive configuration.

Set the required values:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
dotnet user-secrets set "Jwt:Key" "YOUR_JWT_SECRET"
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
```


### 4. Run the Backend

Open a terminal and run:

```bash
cd backend/TaskForge.API
dotnet run
```

The backend will run at:

```text
http://localhost:5149
```

Swagger will be available at:

```text
http://localhost:5149/swagger
```

### 5. Run the Frontend

Open another terminal and run:

```bash
cd frontend/taskforge-client
npm install
ng serve
```

The frontend will run at:

```text
http://localhost:4200
```

## AI Issue Assistant

TaskForge includes an AI assistant powered by Google Gemini.

It can:

- Improve issue titles
- Improve issue descriptions
- Suggest issue type
- Suggest priority
- Generate acceptance criteria
- Provide implementation suggestions

AI suggestions are reviewed by the user before they are applied to an issue.

## Security

Sensitive information such as:

- Database passwords
- JWT secrets
- Gemini API keys

is stored using .NET User Secrets and is not committed to the repository.