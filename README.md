# MeetLoom - AI Meeting & Task Summarizer

MeetLoom is a minimal AI-powered productivity tool that converts meeting transcripts into:
- A concise summary
- Actionable task items
- Priority levels
- Suggested deadlines
- Reasoning per task

It is designed to reduce post-meeting confusion and improve execution clarity for teams.

## Assignment Fit
This project addresses the technical assignment goals:
- Accepts pasted meeting notes/transcripts
- Generates AI-powered summary
- Extracts action tasks
- Suggests priority and tentative deadlines
- Displays structured output in clean UI
- Integrates external AI API (Groq)
- Includes validation, loading states, and error handling
- Responsive client interface

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- AI Integration: Groq Chat Completions API
- HTTP Client: Axios
- Styling: CSS (responsive layout)

## High-Level Architecture
1. User pastes transcript in frontend.
2. Frontend sends `POST /api/analyze` to backend.
3. Backend validates payload and builds analysis prompt.
4. Backend calls Groq API with strict JSON output instructions.
5. Backend parses and validates AI response.
6. Frontend renders summary + structured tasks.

## Repository Structure
```txt
meetloom/
  client/                 # React frontend
    src/
      components/         # UI components (input, loading, errors, task cards)
      services/api.js     # API client
  server/                 # Express backend
    controllers/          # Request handlers
    routes/               # API routes
    services/grokService.js
    prompts/analysisPrompt.js
    middleware/
  docs/
    RAILWAY_SETUP.md      # Railway setup + CI/CD hook guide
  render.yaml             # Render blueprint (backend + frontend)
  .github/workflows/
    ci-cd.yml             # CI/CD pipeline
    keepalive.yml         # Scheduled health pings
  README.md
```

## API Endpoints
- `GET /api/health`
  - Health check endpoint
  - Response includes status and timestamp

- `POST /api/analyze`
  - Request body:
    ```json
    {
      "transcript": "string"
    }
    ```
  - Response body:
    ```json
    {
      "success": true,
      "data": {
        "summary": "...",
        "tasks": [
          {
            "task": "...",
            "assignee": "...",
            "priority": "High|Medium|Low",
            "deadline": "YYYY-MM-DD or Not specified",
            "reasoning": "..."
          }
        ]
      }
    }
    ```

## AI Integration Details
- Provider: Groq
- Model: `llama-3.3-70b-versatile`
- File: `server/services/grokService.js`
- Prompting logic: `server/prompts/analysisPrompt.js`

## Environment Variables

### Backend (`server` / deployment env)
```env
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key
CORS_ORIGIN=https://your-frontend-domain
PORT=5001
```

### Frontend (`client` build env)
```env
VITE_API_URL=https://your-backend-domain
```

## Local Setup and Run
```bash
npm install
cd server && npm install
cd ../client && npm install
```

Start backend:
```bash
cd server
PORT=5001 npm start
```

Start frontend:
```bash
cd client
npm run dev
```

## Deployment

### Render (Configured)
Use `render.yaml` as blueprint.

Services:
- `meetloom-backend` (Node web service)
- `meetloom-frontend` (static site)

Set env vars:
- Backend: `GROQ_API_KEY`, `CORS_ORIGIN`
- Frontend: `VITE_API_URL`

### Railway (Guide Included)
See `docs/RAILWAY_SETUP.md`.

## Keep It Always Active
This repo includes `.github/workflows/keepalive.yml` to ping backend every 10 minutes.

Required GitHub secret:
- `BACKEND_HEALTHCHECK_URL=https://your-backend-domain/api/health`

Important:
- Free tiers may still sleep/scale down depending provider policy.
- For strict always-on availability, use a paid/non-sleep plan and keep at least 1 running instance.

## CI/CD Pipeline
Workflow: `.github/workflows/ci-cd.yml`

Includes:
- Frontend lint + build
- Backend build check
- Optional deploy hooks on `main`

Optional secrets:
- `RENDER_DEPLOY_HOOK_BACKEND`
- `RENDER_DEPLOY_HOOK_FRONTEND`
- `RAILWAY_DEPLOY_HOOK_URL`

## Demo / Submission Links
- Live Demo Link: `ADD_LINK_HERE`
- Backend URL: `ADD_LINK_HERE`
- Walkthrough Video (5-10 min): `ADD_LINK_HERE`
- Video Script: `PRESENTATION_VIDEO_SCRIPT.md`
