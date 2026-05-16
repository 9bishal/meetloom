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

### Output Control Strategy
The prompt enforces a strict JSON schema to reduce format drift.
Backend then re-validates fields and normalizes priority values (`High`, `Medium`, `Low`) before returning results.

## Validation and Error Handling
### Frontend
- Empty transcript checks
- Minimum length checks
- Loading state while processing
- User-friendly error alert
- Backend health check polling

### Backend
- Missing/empty transcript validation
- Transcript max-length guard
- AI API timeout handling
- API auth / rate limit handling
- JSON parse and structure validation

## Environment Variables

### Root `.env` (current local setup)
```env
GROQ_API_KEY=your_groq_api_key
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend `client/.env`
```env
VITE_API_URL=http://localhost:5001
```

## Local Setup and Run
### 1. Install dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
- Add Groq API key to root `.env` as `GROQ_API_KEY`
- Ensure frontend points to backend via `client/.env`

### 3. Start backend (port 5001)
```bash
cd server
PORT=5001 npm start
```

### 4. Start frontend
```bash
cd client
npm run dev
```

### 5. Open app
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/api/health`

## Product Workflow
1. Paste meeting transcript.
2. Click **Analyze Meeting**.
3. Receive generated summary.
4. Review extracted tasks with assignee, priority, deadline, and reasoning.
5. Copy/use tasks in team execution tools.

## Design and Usability Notes
- Clean single-page flow
- Readable cards for summary and tasks
- Color-coded priority labels
- Responsive behavior for smaller screens

## Practical Assumptions
- Transcript contains enough context to infer tasks.
- AI-suggested deadlines are tentative and should be reviewed by humans.
- Priority classification is heuristic and based on transcript intent.

## Known Limitations
- No authentication or multi-user persistence
- No transcript file upload (paste-only input)
- No direct integrations with PM tools (Jira/Linear/Trello)
- AI output quality depends on transcript quality

## Suggested Next Improvements
- Export tasks to CSV / Notion / Jira
- Meeting source integrations (Zoom/Meet transcript ingestion)
- Team workspace + history
- Confidence scoring for extracted tasks

## Demo / Deployment
- Live Demo Link: `ADD_LINK_HERE`
- Backend URL: `ADD_LINK_HERE`

## Walkthrough Video (5-10 min)
- Video Link: `ADD_LINK_HERE`
- Script reference: `PRESENTATION_VIDEO_SCRIPT.md`

## Submission Checklist
- [x] Functional source code in repository
- [x] AI integration for summarization and task extraction
- [x] Validation/loading/error handling
- [x] Responsive UI
- [ ] Public deployment link added
- [ ] Walkthrough video link added

## Team
Prepared for technical assignment submission (Team Involynk).
