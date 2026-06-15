# InterviewHub — Frontend Client

A high-performance, real-time collaborative coding assessment and interview platform designed to connect candidate skills with expert hiring teams. Built with **React**, **Vite**, **Monaco Editor**, **WebRTC**, and **WebSockets**.
<img width="1710" height="958" alt="image" src="https://github.com/user-attachments/assets/10d68280-3e6d-43e0-b497-a6f0fd75368f" />

---

## Key Features

-  **Real-time Collaborative Code Editor**: 
  - Integrated with **Monaco Editor** (the engine behind VS Code).
  - Multi-language support: Python, Java, Go, C++, and C.
  - Live, debounced code synchronization between interviewers and candidates.
-  **Integrated WebRTC Video/Audio & Screen Share**:
  - Direct peer-to-peer connection for high-quality audio and video.
  - One-click screen sharing to present diagrams or other browser windows.
-  **Synchronized Workspace Panels**:
  - Shared room workspace with resizable panels (Video, Editor, Chat).
  - Websocket synchronization of workspace layouts and panel sizes across all participants.
-  **Code Execution Engine Integration**:
  - Live compilation and execution of files.
  - Instant stdout/stderr feedback with execution time diagnostics.
-  **Interactive Chat**:
  - Seamless in-room text communications, helping to convey ideas and share references.
-  **Analytics & Dashboard**:
  - Overview statistics of scheduled and completed interviews.
  - Dynamic user management and logs.
-  **Secure Auth & Role Guards**:
  - Secure JWT authentication with client interceptors for token attachment.
  - Role-based permissions (Admin, Interviewer, Candidate) to control room creation and status updating.

---

## Tech Stack

- **Core**: [React](https://react.dev/) (v19) & [Vite](https://vite.dev/) (v8)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v7)
- **Styling**: Modern, premium CSS theme with custom utility variables, full dark mode palette, and smooth animations.
- **WebRTC Calling**: Raw `RTCPeerConnection` signaling via WebSockets
- **WebSockets / STOMP**: `@stomp/stompjs` + `sockjs-client`
- **Code Editor**: `@monaco-editor/react` (v4.7.0)
- **API Client**: `axios` (with requests interceptor support)
- **Icons**: `lucide-react`

---

## Codebase Directory Structure

```text
frontend/
├── Dockerfile              # Production Docker build configuration
├── nginx.conf              # Nginx proxy and routing settings for Docker environment
├── vite.config.js          # Vite build/bundling options
├── index.html              # HTML shell loader
└── src/
    ├── App.jsx             # Main routing and provider shell
    ├── main.jsx            # React root mount point
    ├── index.css           # Global core layout, CSS design system, and dark mode configuration
    ├── App.css             # Page-specific styling rules
    ├── components/
    │   └── layout/
    │       └── MainLayout.jsx  # Main application wrapper (Sidebar and header layout)
    ├── contexts/
    │   ├── AuthContext.jsx     # User authentication, login, registration, and role verification
    │   └── ToastContext.jsx    # Toast notifications provider
    ├── hooks/
    │   ├── useResizablePanels.js # Hook to calculate and sync panel layouts
    │   ├── useRoomSocket.js      # WebSocket STOMP signaling hook
    │   └── useWebRTC.js          # WebRTC audio/video/screen sharing state manager
    ├── pages/
    │   ├── DashboardPage.jsx     # Home view showing status summaries and stats
    │   ├── InterviewsPage.jsx    # Interview scheduler and history listing
    │   ├── InterviewRoomPage.jsx # Full-screen collaborative room page (Editor, video, chat)
    │   ├── AnalyticsPage.jsx     # Platform-wide metrics and stats visualization
    │   ├── LoginPage.jsx         # Sign-in credentials panel
    │   └── RegisterPage.jsx      # New account setup form
    └── services/
        └── api.js                # Axios instance configuration and API routes definitions
```

---

## Environment Configuration

Create a `.env` file in the root directory to customize the connection endpoints:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base path of the backend REST endpoints |
| `VITE_WS_BASE_URL` | `http://localhost:8080` | URL base path of the WebSocket / SockJS server endpoint |

---

## Getting Started

### Prerequisites

Ensure you have **Node.js (v18+)** and **npm** installed on your machine.

### Local Installation

1. **Clone the repository and navigate to the frontend folder**:
   ```bash
   git clone <repo-url>
   cd frontend
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The local server will spin up, typically at `http://localhost:5173`.

### Build & Production Preview

To test a production-optimized build locally:

```bash
# Build the static asset bundle
npm run build

# Preview the built app locally
npm run preview
```

---


## Docker Deployment

## ⚡ Vercel Deployment

You can deploy this React SPA application directly to Vercel. Because client-side routing is handled by React Router (SPA), we have included a [vercel.json](file:///home/lol/Interview%20platfrom/frontend/vercel.json) file at the root to handle URL rewrites correctly (avoiding 404 errors on page reload).

### Steps to Deploy via Vercel CLI

1. **Install Vercel CLI globally**:
   ```bash
   npm install -g vercel
   ```

2. **Run Vercel link/deployment**:
   ```bash
   vercel
   ```
   Follow the prompts in your terminal. Vercel will auto-detect Vite. Ensure the build command is set to `npm run build` and output directory is set to `dist`.

3. **Configure Environment Variables**:
   In the Vercel project dashboard under **Project Settings > Environment Variables**, define:
   - `VITE_API_BASE_URL`: Your production backend REST API URL (e.g., `https://api.example.com`).
   - `VITE_WS_BASE_URL`: Your production WebSocket URL (e.g., `https://api.example.com`).

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Deploying via Git Integration (Recommended)
Alternatively, import this repository into your Vercel account via the dashboard. Vercel will automatically build and deploy the app on every commit to your main branch.

---

## 🐳 Docker Deployment
91d6d56 (Add vercel configuration)

The application features a production-ready multi-stage Docker build utilizing **Nginx Alpine** to serve static files and handle internal proxying.

### 1. Build the Docker Image
```bash
docker build -t interviewhub-frontend .
```

### 2. Run the Container
```bash
docker run -d -p 80:80 --name interviewhub-frontend-instance interviewhub-frontend
```
This serves the application on port `80`. Nginx will proxy request paths starting with `/api` and `/ws` automatically to `http://backend:8080` inside the network.

