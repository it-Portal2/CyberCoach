# Overview

This is an AI-powered cybersecurity mentoring platform called "AI Cyber Mentor" designed to provide job-role-oriented training and guidance. The application positions itself as an interactive mentor named "Jit Banerjee" with 20+ years of cybersecurity experience, offering personalized learning paths for various cybersecurity roles including Red Team Operator, SOC Analyst, Incident Responder, and others. The platform focuses on practical, real-world scenarios and provides structured learning through concepts, practice scenarios, assessments, and AI-powered chat interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application is built as a single-page application (SPA) using React with TypeScript and Vite as the build tool. It follows a modern component-based architecture with:

- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: Relies on React hooks and local storage for state persistence
- **UI Components**: Built with Radix UI primitives and styled using Tailwind CSS with a custom design system
- **Styling**: Dark theme cybersecurity aesthetic with terminal-inspired design elements and matrix-style visual effects

The frontend is organized into distinct sections:
- Job role selection hub with categorized cybersecurity positions
- Interactive concept learning modules
- Practice scenarios and hands-on exercises  
- Knowledge assessment system
- Real-time AI mentor chat interface

### Backend Architecture
The backend uses Express.js with TypeScript running on Node.js. Key architectural decisions include:

- **API Design**: RESTful endpoints for mentor chat functionality
- **AI Integration**: Google Gemini AI integration through serverless API routes
- **Data Storage**: Hybrid approach using both in-memory storage and local browser storage
- **Database Layer**: Drizzle ORM configured for PostgreSQL with migration support
- **Session Management**: In-memory storage implementation with plans for database persistence

The server implements middleware for logging, error handling, and development tooling integration with Vite for hot module replacement.

### Data Storage Solutions
The application uses a multi-tiered storage approach:

- **Client-side**: Browser localStorage for user progress, preferences, and chat history
- **Server-side**: In-memory storage for user sessions and temporary data
- **Database**: PostgreSQL with Drizzle ORM for structured data persistence (configured but not fully implemented)

This approach allows the application to function as a frontend-only solution while maintaining the flexibility to scale with database backing.

### Authentication and Authorization
Currently implements a basic user management system through the storage interface with plans for expansion. The system includes:

- User creation and retrieval functionality
- Session-based identification
- No authentication middleware currently implemented (designed for MVP deployment)

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI service for mentor interactions using the free tier API
- **API Security**: Environment variable management for secure API key storage

### Database and ORM
- **Neon Database**: PostgreSQL hosting service for production data storage
- **Drizzle ORM**: Type-safe database ORM with migration support
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom cybersecurity theme
- **Lucide Icons**: Icon library for consistent visual elements
- **Font Awesome**: Additional icon support for cybersecurity-themed icons

### Development and Deployment
- **Vite**: Build tool and development server with React plugin support
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment plugins and error handling

### State Management and Data Fetching
- **TanStack Query**: Server state management and caching for API interactions
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation for API requests and responses

The application is designed to be deployable on Vercel with minimal configuration, focusing on a frontend-first architecture while maintaining the flexibility to add backend services as needed.