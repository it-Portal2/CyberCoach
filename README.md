AI Cyber Mentor Platform

A comprehensive AI-powered cybersecurity mentoring platform providing personalized guidance, practice scenarios, and assessments through an interactive chat interface with "Jit Banerjee", an experienced AI mentor specializing in cybersecurity education and training.

🎯 Overview

The platform helps cybersecurity professionals and students enhance their skills with:

Personalized Mentoring – Guidance tailored to your career goals and skill level

Role-Specific Training – For Red Team Operators, SOC Analysts, Penetration Testers, Incident Responders, etc.

Interactive Learning – Real-time conversations with actionable insights

Hands-On Practice – Custom scenarios inspired by real-world cyber challenges

Knowledge Assessment – Dynamic quizzes to validate learning

Progress Tracking – Persistent learning data stored locally in the browser

🚀 Features
Core

AI-powered mentoring with Google Gemini AI

Multi-role support for various cybersecurity career paths

Custom practice scenario generation

Dynamic assessment creation

Progressive hints & confidence scoring

Local progress tracking with localStorage

Technical

Responsive UI with dark terminal-inspired theme

Real-time structured chat interface

Works offline after initial load (frontend only)

Hot reload for local development

🛠 Tech Stack

Frontend

React 18, TypeScript, Vite, Tailwind CSS, Radix UI

Wouter (routing), React Query (server state), Framer Motion

Backend

Node.js, Express.js, TypeScript

Google Gemini AI (Generative AI API)

Zod for validation

Development Tools

TSX, Concurrently, Cross-env, ESBuild


🔑 Environment Variables

Create a .env file in the root directory:

NODE_ENV=development   # development | production
PORT=3000              # server port
GEMINI_API_KEY=your_google_ai_api_key_here
DATABASE_URL=optional  # only if using external DB (default: localStorage)


⚡ Progress tracking uses localStorage by default. A database can be added for production.

📦 Installation
# Clone repository
git clone <your-repository-url>
cd ai-cyber-mentor

# Install dependencies
npm install

🏃 Running Locally

Start both frontend & backend:

npm run dev


Frontend → http://localhost:5173

Backend → http://localhost:3000

Run separately if needed:

npm run dev:server   # backend only
npm run dev:client   # frontend only

🏗 Production Deployment
# Build frontend & backend
npm run build

# Start production server
NODE_ENV=production npm start


Frontend served from /dist

Backend runs on configured PORT