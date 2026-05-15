# 🚀 MeetLoom - Quick Start Guide

## Installation & Setup

### 1. Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- Grok API key from [https://console.x.ai/](https://console.x.ai/)

### 2. Install Dependencies

```bash
# Install root dependencies (optional, for running dev scripts)
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 3. Configure Environment Variables

**Backend Setup:**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
GROK_API_KEY=sk-your-actual-grok-api-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend Setup:**
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

### 4. Run Development Servers

From the project root:

```bash
# Run both servers simultaneously (requires concurrently installed globally)
npm run dev

# OR run them separately in different terminals:

# Terminal 1 - Frontend (runs on http://localhost:5173)
cd client && npm run dev

# Terminal 2 - Backend (runs on http://localhost:5000)
cd server && npm run dev
```

### 5. Verify It's Working

1. Open http://localhost:5173 in your browser
2. You should see the MeetLoom landing page
3. Check the console for any errors
4. Try pasting a sample meeting transcript and clicking "Analyze Meeting"

## 🎯 Features

### ✅ Core Functionality
- **Paste Meeting Transcripts** - Clean, intuitive textarea input
- **AI-Powered Analysis** - Grok API integration
- **Summary Generation** - Concise meeting overview
- **Task Extraction** - Automatic action item detection
- **Priority Assignment** - High, Medium, Low classification
- **Deadline Suggestions** - Smart date recommendations
- **Copy to Clipboard** - Easy sharing of results

### ✨ UI/UX Features
- Minimal, premium design (inspired by Anthropic)
- Smooth Framer Motion animations
- Responsive mobile design
- Real-time validation
- Loading states with animations
- Error handling with user-friendly messages
- Empty states and helpful prompts

## 📚 API Endpoints

### POST /api/analyze
Analyzes a meeting transcript and returns structured insights.

**Request:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Your meeting transcript here..."}'
```

**Response:**
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
        "deadline": "YYYY-MM-DD",
        "reasoning": "..."
      }
    ]
  }
}
```

### GET /api/health
Health check endpoint.

```bash
curl http://localhost:5000/api/health
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 5 |
| Styling | TailwindCSS + Custom CSS |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| AI | Grok API |
| Database | None (stateless MVP) |

## 📁 Project Structure

```
meetloom/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── App.jsx            # Main component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles
│   │   ├── App.css            # Component styles
│   │   └── globals.css        # Tailwind imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
│
├── server/                     # Express backend
│   ├── controllers/           # Request handlers
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   ├── middleware/            # Express middleware
│   ├── prompts/               # AI prompts
│   ├── app.js                 # Express setup
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env
│
├── package.json               # Root config
├── README.md                  # This file
└── .gitignore
```

## 🎨 Design System

### Colors
- **Background:** #FAF9F5 (Soft cream)
- **Secondary:** #E8E6DC (Light neutral)
- **Text:** #141413 (Deep charcoal)
- **Accent:** #D97757 (Warm terracotta)
- **Muted:** #B0AEA5 (Muted gray)

### Typography
- **Font Family:** System fonts (SF Pro, Segoe UI, etc.)
- **Headings:** 600+ weight, -0.01em letter-spacing
- **Body:** 400 weight, 1.6 line-height

### Components
- **Cards:** 1rem border-radius, soft shadows
- **Buttons:** 0.5rem border-radius, smooth transitions
- **Inputs:** Focus states with accent color

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Upload dist/ to Vercel
# Set environment variable: VITE_API_URL=<backend-url>
```

### Backend (Render)
```bash
cd server
npm run build
# Deploy to Render
# Set environment variables:
# - GROK_API_KEY
# - CORS_ORIGIN=<frontend-url>
# - NODE_ENV=production
```

## 🧪 Testing

Sample meeting transcript to test with:

```
John: Good morning everyone. Today we need to finalize the Q3 roadmap and discuss timeline concerns.

Sarah: I agree. The design system work is almost complete. I estimate 2 weeks to finish all mockups.

Mike: From development perspective, we're ready to start after we get the designs. I'll need the assets by May 20th.

John: Perfect. Sarah, can you commit to having mockups done by May 18th?

Sarah: Yes, absolutely. That gives Mike a 2-day buffer.

John: Excellent. Mike, once you start development, can you do weekly status updates?

Mike: Sure. I'll also schedule the stakeholder review meeting for early June.

John: Great. Let's also create a risk register. Sarah, can you lead that?

Sarah: I'll draft it by next Friday and share with everyone.
```

## ❓ Troubleshooting

### "Backend server is not responding"
- Ensure backend is running on port 5000
- Check server logs for errors
- Verify GROK_API_KEY is set in server/.env

### "Failed to analyze transcript"
- Check if GROK_API_KEY is valid
- Verify internet connection
- Check backend logs for AI API errors
- Try a different or longer transcript

### "CORS error"
- Ensure CORS_ORIGIN in server/.env matches frontend URL
- Restart backend server after changing .env

### Port Already in Use
```bash
# Kill process using port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# Or use a different port:
PORT=5001 npm run dev:server
```

## 📖 Code Structure

### Key Files

**Backend:**
- `server/server.js` - Server startup with health checks
- `server/app.js` - Express configuration and middleware
- `server/controllers/analyzeController.js` - Request handlers
- `server/services/grokService.js` - AI integration
- `server/prompts/analysisPrompt.js` - AI prompt templates

**Frontend:**
- `client/src/App.jsx` - Main application logic
- `client/src/components/` - Reusable UI components
- `client/src/services/api.js` - HTTP client
- `client/tailwind.config.js` - Design system tokens

### Design Patterns

**Backend:**
- MVC architecture (Models, Views, Controllers)
- Service layer for business logic
- Error handling middleware
- CORS configuration

**Frontend:**
- React Hooks for state management
- Component composition
- Framer Motion for animations
- Axios for API calls

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vite.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Express.js Guide](https://expressjs.com)

## 📝 Beginner Notes

This project is structured to be beginner-friendly with:
- Clear file organization
- Inline comments explaining key concepts
- Simple state management (React hooks)
- Modular component structure
- Error handling examples
- Responsive design patterns

## 🔄 Next Steps

After getting the MVP running:
1. Add user authentication
2. Implement meeting history/storage
3. Add export to PDF/Google Docs
4. Create mobile app
5. Add real-time collaboration features
6. Implement multiple AI providers

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs: check terminal output
3. Check browser console: F12 → Console tab
4. Review the main README.md for architecture details

## ✨ Tips for Success

1. **Start the backend first** - It needs to be running before frontend can connect
2. **Check environment variables** - Most issues stem from missing GROK_API_KEY
3. **Use longer transcripts** - Minimum 50 characters, ideally 500+
4. **Monitor console logs** - Both browser and terminal have helpful error messages
5. **Test with sample transcripts** - Helps identify if issue is with your data

---

Happy meeting analyzing! 🎯✨
