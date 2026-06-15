# PS-29 Content Publishing and Draft Management UI

This project implements the required stack:

- React frontend with `App.jsx`, pages, and reusable components
- FastAPI gateway for middleware, controller routing, and proxying
- Spring Boot backend for JWT generation, JWT validation, business logic, and SQL data access
- PostgreSQL database named `content_db`
- No MongoDB and no vector database, as requested

## Ports

- Frontend: `http://localhost:5173`
- FastAPI gateway: `http://localhost:8000`
- Spring Boot backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432/content_db`

## Database

Create the database in pgAdmin:

```sql
CREATE DATABASE content_db;
```

The Spring Boot app uses:

```properties
spring.datasource.username=postgres
spring.datasource.password=itachi@0209
```

Spring JPA is configured with `ddl-auto=update`, so it creates the tables automatically from the entity classes when the backend starts.

## Run Spring Boot Backend

Open `springboot-backend` in Spring Tool Suite, then run:

```text
ContentPublishingApplication.java
```

Or from terminal:

```bash
cd springboot-backend
mvn spring-boot:run
```

## Run FastAPI Gateway

```bash
cd fastapi-gateway
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

FastAPI structure:

- `run.py` starts the gateway on the configured port
- `main.py` contains middleware setup and router registration
- `controllers/auth_controller.py` contains auth gateway routes
- `controllers/content_controller.py` contains content gateway routes

## Run React Frontend

```bash
cd frontend
npm install
npm run dev
```

## Main Features

- Sign up and sign in
- JWT token generation in Spring Boot
- JWT validation in Spring Boot before content routes are proxied
- Create and edit content
- Save drafts
- Publish content
- Track published versions
- View published content
- Search by title, body, summary, status, and topics

## Example Search Queries

The project does not use vectors, but supports intelligent keyword/topic discovery through PostgreSQL-backed search:

- `Articles on cloud computing`
- `Drafts related to AI topics`
- `backend`
- `cloud`
