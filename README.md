# MeetLoom - Full Stack (React + Node.js)

AI-powered meeting intelligence and analysis platform.

## About This Branch

This is the **backend** branch optimized for deploying the Node.js/Express server to **Azure App Service**. It contains the complete full-stack application (both client and server code).

For frontend-only deployment to Azure Static Web Apps, see the **frontend** branch.
For the full monorepo with all documentation, see the **master** branch.

## Project Structure

```
.
├── client/                     # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js/Express API server
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   └── services/
├── web.config                  # Azure App Service configuration
├── startup.sh                  # Azure startup script
└── README.md
```

## Quick Start - Backend Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Grok API key (XAI API)

### Installation & Development

```bash
# Install backend dependencies
cd server
npm install

# Create .env file with your API key
cp .env.example .env
# Edit .env with your XAI_API_KEY

# Start development server
npm run dev
```

The API server will run at `http://localhost:8080`

### Production

```bash
cd server
npm start
```

## Quick Start - Frontend Development

### Installation & Development

```bash
# Install frontend dependencies
cd client
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build for Production

```bash
cd client
npm run build
```

## Deployment to Azure App Service

This branch is configured for automatic deployment:

1. Push changes to the `backend` branch
2. GitHub Actions automatically builds and deploys the Node.js app to Azure App Service
3. Configuration defined in `web.config` and `startup.sh`
4. Server listens on `0.0.0.0:8080` for Azure compatibility

## API Endpoints

### Health Check
```
GET /api/health
```

### Analyze Meeting
```
POST /api/analyze
Content-Type: application/json

{
  "transcript": "meeting transcript text here"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment (development/production) | development |
| `XAI_API_KEY` | Grok API key from xai.com | Required |

## Technologies

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Grok API (XAI)
- **Hosting:** Azure Static Web Apps (frontend) + Azure App Service (backend)

## License

MeetLoom - AI Meeting Intelligence

---

**For independent deployments:**
- `frontend` branch: Optimized for Azure Static Web Apps (React)
- `backend` branch: Optimized for Azure App Service (Node.js)
- `master` branch: Complete monorepo with all documentation
