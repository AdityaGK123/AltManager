# HiPo AI Coach

## Overview

HiPo AI Coach is a professional coaching platform designed specifically for Indian professionals navigating career growth, leadership development, and workplace challenges. The application provides 6 specialized AI coaches covering different aspects of professional development, from leadership and performance to work-life balance and career strategy. Built as a mobile-first React application, it offers personalized coaching experiences through focused 5-minute conversations, cultural sensitivity, and industry-specific guidance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React TypeScript SPA**: Single-page application built with React 18, TypeScript, and Vite for fast development and modern tooling
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility and Tailwind CSS for styling
- **State Management**: React hooks for local state with TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **Mobile-First Design**: Responsive design optimized for mobile devices with touch-friendly interactions

### Backend Architecture
- **Express.js Server**: Node.js backend with Express framework serving both API routes and static assets
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations and schema management
- **Session Management**: PostgreSQL-based session storage for user authentication and state persistence
- **API Design**: RESTful API structure with `/api` prefix for clear separation between frontend and backend routes

### Authentication & User Management
- **User Profiles**: Comprehensive user profiling system capturing career stage, industry, goals, and challenges
- **Onboarding Flow**: Multi-step onboarding process to personalize coaching recommendations
- **Session Persistence**: Server-side session management using PostgreSQL session store

### AI Coaching System
- **Coach Personas**: 6 distinct AI coaches (Leadership, Performance, Career, HiPo, Life, EmpathEAR) with specialized knowledge domains
- **Recommendation Engine**: Algorithm to match users with appropriate coaches based on their profile and stated challenges
- **Chat Interface**: WhatsApp-inspired messaging interface for natural conversation flow
- **Context Awareness**: Coaches maintain conversation context and provide culturally sensitive advice

### Design System
- **Component Library**: Modular component architecture with reusable UI components
- **Theming**: CSS custom properties with light/dark mode support and professional color palette
- **Typography**: Inter and Poppins fonts for clean, professional readability
- **Responsive Design**: Mobile-first approach with consistent spacing and layout patterns

## External Dependencies

### Core Technologies
- **React 18**: Frontend framework with hooks and modern React patterns
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Build tool and development server for fast hot module replacement
- **Express.js**: Backend web framework for Node.js
- **Node.js**: JavaScript runtime environment

### Database & ORM
- **PostgreSQL**: Primary database via Neon serverless platform
- **Drizzle ORM**: Type-safe database toolkit with schema migrations
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon database

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn/ui**: Pre-built component library based on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI primitives for React
- **Lucide React**: Icon library for consistent iconography

### State Management & Data Fetching
- **TanStack React Query**: Server state management with caching, synchronization, and background updates
- **React Hook Form**: Form state management with validation support
- **Zod**: Schema validation for TypeScript

### AI Integration
- **Google Generative AI**: AI model integration for coaching conversations and responses

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **Class Variance Authority**: Utility for creating variant-based component APIs

### Session & Authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session middleware for user authentication state

### Assets & Media
- **Custom Generated Images**: AI-generated coach avatars stored in attached_assets directory
- **Google Fonts**: Inter and Poppins fonts loaded via CDN for typography