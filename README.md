# MeetLoom - AI Meeting & Task Summarizer

MeetLoom is an AI-powered productivity tool that converts unstructured meeting transcripts into:
- concise meeting summaries
- actionable tasks
- assignees
- priority levels
- suggested deadlines with reasoning

## Live Links
- Frontend (Vercel): https://meetloom-alpha.vercel.app/
- Backend (Render): https://meetloom.onrender.com/
- Health Check: https://meetloom.onrender.com/api/health

## Problem It Solves
Teams often lose critical decisions and follow-ups in long meetings. MeetLoom provides a practical post-meeting workflow by turning raw transcript text into structured, actionable output.

## Features
- Paste meeting notes/transcripts into a clean UI
- Generate AI-powered meeting summary
- Extract 3-7 actionable tasks
- Suggest priority (`High`, `Medium`, `Low`)
- Suggest tentative deadlines
- Show structured results in readable cards
- Loading, validation, and error handling
- Responsive frontend experience

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- AI Provider: Groq API (`llama-3.3-70b-versatile`)
- HTTP Client: Axios

## Architecture
1. User submits transcript from frontend.
2. Frontend calls `POST /api/analyze`.
3. Backend validates input and builds an analysis prompt.
4. Backend calls Groq API.
5. Backend parses/validates JSON response.
6. Frontend renders summary and task list.

## API Endpoints
- `GET /`
  - Basic API status
- `GET /api/health`
  - Backend health response
- `POST /api/analyze`
  - Request:
    ```json
    {
      "transcript": "Meeting transcript text"
    }
    ```
  - Response:
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
            "deadline": "YYYY-MM-DD | Not specified",
            "reasoning": "..."
          }
        ]
      }
    }
    ```

## Environment Variables
### Backend
```env
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key
CORS_ORIGIN=https://meetloom-alpha.vercel.app
PORT=5001
```

### Frontend
```env
VITE_API_URL=https://meetloom.onrender.com
```

## Local Development
```bash
# root
npm install

# backend
cd server && npm install
PORT=5001 npm start

# frontend (new terminal)
cd client && npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend Health: `http://localhost:5001/api/health`



## Known Limitations
- No authentication/user accounts
- No transcript file upload (paste input only)
- No persistent history/database
- AI quality depends on transcript quality
