# 🎨 MeetLoom Visual Guide

## Application Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              MeetLoom Landing Page                    │ │
│  │  "AI Meeting Intelligence"                           │ │
│  │  "Turn messy discussions into structured action"    │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Paste Meeting Transcript                   │ │
│  │  [Textarea for input...]                             │ │
│  │  [✨ Analyze Meeting] [Clear]                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓ Click Analyze                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Loading Animation (Framer Motion)           │ │
│  │  [Spinner] "Analyzing your meeting..."              │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓ API Response                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📋 Meeting Summary        [📋 Copy]                 │ │
│  │  ────────────────────────────────────────────        │ │
│  │  "The team discussed Q3 roadmap, design system      │ │
│  │   prioritization, and development timeline..."     │ │
│  │                                                     │ │
│  │  ✅ Action Items (3)                               │ │
│  │  ────────────────────────────────────────────      │ │
│  │  │  Complete design mockups        [HIGH] [📋]   │ │
│  │  │  Assignee: Sarah | Deadline: 2025-05-18   │ │
│  │  │  💡 Blocks development phase              │ │
│  │  │                                            │ │
│  │  │  Schedule stakeholder meeting [MED]  [📋] │ │
│  │  │  Assignee: John | Deadline: 2025-05-15    │ │
│  │  │  💡 Early feedback needed                 │ │
│  │  │                                            │ │
│  │  │  Set up health check             [LOW]  [📋]│ │
│  │  │  Assignee: Unassigned | ...              │ │
│  │  └────────────────────────────────────────────   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↑
                    HTTPS Request
                         ↑
┌──────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Route: POST /api/analyze                                  │
│         ↓                                                  │
│  Validate Input (>50 chars, <50k chars)                   │
│         ↓                                                  │
│  Controller: analyzeController.analyzeTranscript()        │
│         ↓                                                  │
│  Service: grokService.analyzeMeeting()                    │
│         ↓                                                  │
│  Build Prompt from Template                              │
│         ↓                                                  │
│  Call Grok API (x.ai)                                   │
│         ↓                                                  │
│  Parse JSON Response                                      │
│         ↓                                                  │
│  Validate Structure                                       │
│         ↓                                                  │
│  Return Formatted Response                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↑
                    HTTPS Request
                         ↑
                  ┌───────────────┐
                  │   Grok API    │
                  │   (x.ai)      │
                  └───────────────┘
```

## Component Hierarchy

```
App
│
├─ Navbar
│  └─ Logo + Branding
│
├─ main.main-content
│  │
│  ├─ Hero
│  │  ├─ Title: "AI Meeting Intelligence"
│  │  └─ Subtitle: "Turn messy discussions into structured action"
│  │
│  └─ Main Input Section
│     ├─ ErrorState (conditional)
│     ├─ TranscriptInput
│     │  ├─ Label
│     │  ├─ Textarea
│     │  └─ Character Counter
│     │
│     ├─ Action Buttons
│     │  ├─ AnalyzeButton
│     │  │  └─ (with loading spinner)
│     │  └─ ClearButton
│     │
│     └─ Results (conditional)
│        ├─ LoadingState (during analysis)
│        │
│        └─ Results Display (after analysis)
│           ├─ SummaryCard
│           │  ├─ Summary Text
│           │  └─ Copy Button
│           │
│           ├─ TaskList
│           │  ├─ TaskCard[] (with Framer Motion)
│           │  │  ├─ Task Title
│           │  │  ├─ Priority Badge
│           │  │  ├─ Assignee
│           │  │  ├─ Deadline
│           │  │  ├─ Reasoning
│           │  │  └─ Copy Button
│           │  │
│           │  └─ Empty State (if no tasks)
│           │
│           └─ Tips & Hints
│
└─ Footer
   └─ Version + Links
```

## Data Flow Diagram

```
┌─────────────────────┐
│  USER INTERACTION   │
│  (Type + Click)     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  FRONTEND STATE                     │
│  ┌─────────────────────────────┐   │
│  │ transcript: string          │   │
│  │ isLoading: boolean          │   │
│  │ analysis: object | null     │   │
│  │ error: string | null        │   │
│  └─────────────────────────────┘   │
└──────────┬──────────────────────────┘
           │
           ├─ Listen: TranscriptInput
           │  └─> setTranscript()
           │
           ├─ Listen: AnalyzeButton
           │  └─> handleAnalyze()
           │       ├─ Validate transcript
           │       ├─ setIsLoading(true)
           │       ├─ Call API
           │       ├─ setAnalysis()
           │       └─ setIsLoading(false)
           │
           └─ Render Components
              ├─ If isLoading → LoadingState
              ├─ If error → ErrorState
              ├─ If analysis → SummaryCard + TaskList
              └─ Else → EmptyState
```

## Color System

```
┌──────────────────────────────────────────────────────────┐
│           MEETLOOM COLOR PALETTE                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Background: #FAF9F5 (Soft Cream)                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                          │
│  Accent: #E8E6DC (Light Neutral)                       │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                          │
│  Text: #141413 (Deep Charcoal)                         │
│  ███████████████████████████████████████████████████   │
│                                                          │
│  Primary: #D97757 (Warm Terracotta) ← Interactive     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                          │
│  Muted: #B0AEA5 (Muted Gray) ← Secondary             │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  PRIORITY COLORS                                        │
│  High:   #D97757 (Terracotta Red)                     │
│  Medium: #D4A574 (Warm Tan)                          │
│  Low:    #B0AEA5 (Muted Gray)                        │
└──────────────────────────────────────────────────────────┘
```

## API Request/Response Flow

```
REQUEST:
┌─────────────────────────────────────┐
│  POST /api/analyze                  │
│  Content-Type: application/json     │
│  ─────────────────────────────────  │
│  {                                  │
│    "transcript": "Long meeting..."  │
│  }                                  │
└──────────────┬──────────────────────┘
               │
               ↓
        ┌─────────────────┐
        │  Server Route   │
        │  validates &    │
        │  delegates      │
        └────────┬────────┘
                 │
                 ↓
         ┌──────────────────┐
         │  Controller      │
         │  validates input │
         │  calls service   │
         └────────┬─────────┘
                  │
                  ↓
          ┌───────────────────┐
          │  GrokService      │
          │  - build prompt   │
          │  - call Grok API  │
          │  - parse response │
          │  - validate data  │
          └────────┬──────────┘
                   │
                   ↓
RESPONSE:
┌─────────────────────────────────────┐
│  200 OK                             │
│  Content-Type: application/json     │
│  ─────────────────────────────────  │
│  {                                  │
│    "success": true,                 │
│    "data": {                        │
│      "summary": "Key points...",    │
│      "tasks": [                     │
│        {                            │
│          "task": "...",             │
│          "assignee": "...",         │
│          "priority": "High",        │
│          "deadline": "2025-05-20",  │
│          "reasoning": "..."         │
│        }                            │
│      ]                              │
│    }                                │
│  }                                  │
└─────────────────────────────────────┘
```

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🎯 MeetLoom       AI Meeting Intelligence                │
│  ═════════════════════════════════════════════════════════ │
│                                                             │
│           AI Meeting Intelligence                         │
│                                                             │
│           Turn messy discussions into                      │
│           structured action.                              │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  📝 Meeting Transcript                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Paste your meeting transcript here...               │ │
│  │                                                       │ │
│  │ John: Good morning everyone...                       │ │
│  │                                                       │ │
│  │ Sarah: I agree. The design system work...           │ │
│  │                                                       │ │
│  │ [1,234 characters]                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [✨ Analyze Meeting]  [Clear]                           │
│                                                             │
│  ⚠️  Backend server is running                          │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  📋 Meeting Summary                              [📋 Copy] │
│  ───────────────────────────────────────────────────────── │
│  The team discussed Q3 roadmap finalization, design      │
│  system prioritization, and development timeline...      │
│                                                             │
│  ✅ Action Items (3)                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Complete design mockups                 [HIGH][📋]  │  │
│  │ Assignee: Sarah | Deadline: 2025-05-18            │  │
│  │ 💡 Blocks development phase                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Schedule stakeholder meeting            [MED] [📋] │  │
│  │ Assignee: John | Deadline: 2025-05-15             │  │
│  │ 💡 Early feedback needed                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Set up health check                     [LOW] [📋]  │  │
│  │ Assignee: Mike | Deadline: Not specified           │  │
│  │ 💡 Non-blocking, can be done later                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  💡 Tip: Click the copy button on any card to copy      │
│     the content to your clipboard.                        │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  MeetLoom v1.0 • Powered by AI                           │
│  https://github.com/bishalkumarshah/meetloom             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
┌────────────────────────────────────────────────────┐
│         Mobile        │     Tablet      │ Desktop │
│        < 768px        │  768px - 1024px │ > 1024px│
├────────────────────────────────────────────────────┤
│                                                    │
│ Hero:                                             │
│ Text: clamp(2.5rem, 8vw, 3.5rem)                │
│ Padding: 4rem 1rem                              │
│                                                   │
│ Input:                                            │
│ Min-height: 150px                               │
│                                                   │
│ Cards:                                            │
│ Full width with gutter                          │
│                                                   │
│ Layout:                                           │
│ Column (stack)                                    │
│                                                   │
└────────────────────────────────────────────────────┘
```

## Animation Effects

```
Fade In:
  From: opacity 0
  To:   opacity 1
  Duration: 300ms

Slide Up:
  From: opacity 0, translateY(10px)
  To:   opacity 1, translateY(0)
  Duration: 400ms

Pulse:
  0%:   opacity 1
  50%:  opacity 0.5
  100%: opacity 1
  Duration: 2s (infinite)

Loading Spinner:
  Rotation: 360deg
  Duration: 800ms (infinite)
```

## Deployment Architecture

```
Development:
Frontend: http://localhost:5173
Backend:  http://localhost:5000
AI:       https://api.x.ai

Production:
┌────────────────────────────┐
│   GitHub Repository        │
├────────────────────────────┤
│  ↓ (push)                  │
├────────────────────────────┤
│  Frontend (Vercel)         │
│  ├─ Build: npm run build   │
│  ├─ Deploy: dist/ → CDN    │
│  └─ URL: meetloom.vercel.app
│                            │
│  Backend (Render)          │
│  ├─ Build: npm install     │
│  ├─ Start: npm start       │
│  └─ URL: meetloom-api.onrender.com
│                            │
│  AI (Grok)                 │
│  └─ API: https://api.x.ai │
└────────────────────────────┘
```

---

**Visual Guide Complete!**

For detailed information, see:
- [QUICKSTART.md](./QUICKSTART.md) - Getting started
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
- [README.md](./README.md) - Full documentation
