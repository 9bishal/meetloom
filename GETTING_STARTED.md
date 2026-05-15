# 🚀 MeetLoom - Getting Started

Welcome to **MeetLoom**! This guide will help you get the application up and running in minutes.

## ⚡ Quick Start (5 minutes)

### Prerequisites
- **Node.js** 16+ ([download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- **Grok API Key** ([get one here](https://console.groq.com))

### 1. Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd meetloom

# Install dependencies for both frontend and backend
npm install
```

### 2. Configure Environment Variables

#### Backend Setup
```bash
# Edit server/.env
cd server
cp .env.example .env
# Edit .env and add your Grok API key:
# GROQ_API_KEY=your_api_key_here
cd ..
```

#### Frontend Setup
```bash
# Edit client/.env (usually no changes needed for local development)
cd client
cp .env.example .env
cd ..
```

### 3. Start Development Servers

**Option A: Using npm (Recommended)**
```bash
npm run dev
# This starts both frontend and backend concurrently
```

**Option B: In Separate Terminals**
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

**Option C: Using VS Code Tasks**
- Press `Cmd+Shift+P` (or `Ctrl+Shift+P` on Windows/Linux)
- Select "Tasks: Run Task"
- Choose "Start Full Dev Environment"

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

The frontend will be running on `5173` and backend on `5000`.

---

## 🛠️ Available Commands

### Root Level
```bash
npm run dev              # Start both servers
npm run dev:client      # Start frontend only
npm run dev:server      # Start backend only
npm run build           # Build both frontend and backend
npm run build:client    # Build frontend for production
npm run build:server    # Build backend
npm run start:server    # Run backend in production mode
```

### Frontend (`client/` directory)
```bash
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run preview         # Preview production build
npm run type-check      # Check TypeScript types
```

### Backend (`server/` directory)
```bash
npm run dev             # Start with hot reload
npm run start           # Start in production
npm run build           # No-op (Node.js doesn't need build)
npm run test            # Run tests (placeholder)
```

---

## 🔑 Environment Variables

### Backend (`.env` / `.env.example`)
```properties
# Required: Your Grok API key
GROQ_API_KEY=your_api_key_here

# Backend port (default: 5000)
PORT=5000

# Environment
NODE_ENV=development

# CORS origin for frontend (default: http://localhost:5173)
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env` / `.env.example`)
```properties
# Backend API URL (default: http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
meetloom/
├── server/                 # Backend (Node.js + Express)
│   ├── app.js             # Express app setup
│   ├── server.js          # Server entry point
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── services/          # Business logic (Grok integration)
│   ├── middleware/        # CORS, logging, error handling
│   ├── prompts/           # AI prompt templates
│   └── utils/             # Utility functions
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   ├── assets/        # Images and icons
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # React entry point
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # TailwindCSS config
│   └── index.html         # HTML entry point
│
└── README.md              # Full documentation
```

---

## 🎨 Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 5** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **Grok API** - AI model for analysis
- **CORS** - Cross-origin request handling
- **dotenv** - Environment configuration

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is already in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process and try again
# Or change PORT in .env to a different port
```

### Frontend won't connect to backend
1. Ensure backend is running on port 5000
2. Check that `CORS_ORIGIN` in `server/.env` matches your frontend URL
3. Verify `VITE_API_URL` in `client/.env` points to correct backend

### Grok API errors
1. Verify your API key is correct in `server/.env`
2. Check your Grok account has sufficient quota
3. Review server logs for specific error messages

### Port already in use
```bash
# Change frontend port in client/vite.config.js
# Change backend port in server/.env
```

---

## 📚 Next Steps

1. **Read the full documentation**: See [README.md](./README.md)
2. **Understand the architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **View deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Check the visual guide**: See [VISUAL_GUIDE.md](./VISUAL_GUIDE.md)

---

## 💡 Tips for Development

- **Hot Reload**: Both servers support hot reload. Just save your files!
- **Debug Backend**: Use `console.log()` or add breakpoints with VS Code debugger
- **Debug Frontend**: Use React DevTools browser extension
- **API Testing**: Use Postman or VS Code REST Client to test endpoints
- **Database**: Currently uses in-memory storage. For production, consider adding a database

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check server logs for error messages
4. Inspect browser console for frontend errors

---

Happy analyzing! 🎉

**Built with ❤️ using MeetLoom**
