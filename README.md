# CodeSync - Collaborative Coding Interview Workspace

A full-stack React + Spring Boot + Python gRPC application designed to simulate a distraction-free technical interview environment with real-time code synchronization, remote cursor tracking, and dedicated code execution.

## Current Features

**Workspace & Collaboration**
- Real-time syncing of code, language selection, problem descriptions, and notes via STOMP WebSockets.
- Remote cursor tracking (Interviewers can see exactly where the candidate is typing).
- Redis state caching to instantly recover room state for late-joiners or after a page refresh.

**Role-Based Access Control**
- **Interviewer Mode:** Read-only code editor, full edit access to problem statement/notes, hidden cursor.
- **Candidate Mode:** Full edit access to code editor, read-only problem statement, active cursor broadcasting.

**Dedicated Execution Service (Python gRPC)**
- Isolated microservice for executing candidate code.
- Currently supports **Python 3** and **C++ (g++)**.
- Captures `stdin` and streams `stdout`/`stderr` back to the workspace.
- Enforces strict execution timeouts to prevent infinite loops.

**Frontend (React + TypeScript + Vite)**
- Split-pane layout using `react-resizable-panels`.
- Integrated Monaco Editor for a VS Code-like coding experience.

## Tech Stack

| Layer | Tech |
|---|---|
| **Backend** | Spring Boot, WebSockets (STOMP), gRPC |
| **Cache/PubSub** | Redis |
| **Execution Engine** | Python, gRPC, Subprocess |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Monaco Editor |

## Prerequisites

- Java 17+
- Node.js 18+
- Python 3.10+
- Docker + Docker Compose (for Redis)

## Setup Instructions

### 1. Infrastructure (Redis & Database)
Run Redis (and PostgreSQL) via Docker in the background:
```bash
docker-compose up -d
```

### 2. Execution Service (Python)
Navigate to the execution service and start the gRPC server:
```bash
cd execution-service
# (Optional) Create a virtual environment
pip install grpcio grpcio-tools
python server.py
```
*(Runs on port 50051)*

### 3. Backend Setup (Spring Boot)
Build and run the Java backend:
```bash
cd backend
./mvnw clean package -DskipTests
java -Duser.timezone=UTC -jar target/codesync-0.0.1-SNAPSHOT.jar
```
*(Runs on port 8080)*

### 4. Frontend Setup (React)
Start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on port 5173)*

## Future Improvements
- Session replay using event sourcing
- Shared interview timer
- Dockerized execution sandbox for secure multitenancy
