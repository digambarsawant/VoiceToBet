# Voice Betting Terminal

## Overview

This is a voice-controlled betting terminal application built with React and Express.js. The application allows users to place bets through voice commands, view odds, and manage their betting slip using both traditional UI interactions and voice control. The system features accessibility-first design with screen reader support and comprehensive voice feedback.

## User Preferences

Preferred communication style: Simple, everyday language.
Project setup: Server-based development (not standalone HTML)
Focus: Complete local development environment with proper server architecture

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Voice Integration**: Web Speech API for both speech recognition and text-to-speech

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints for betting operations
- **Development**: Hot reload with Vite integration

## Key Components

### Voice Interface System
- **Speech Recognition**: Browser-based voice command processing
- **Text-to-Speech**: Audio feedback for all user interactions
- **Natural Language Processing**: Custom parser for betting commands
- **Accessibility**: Full screen reader support and keyboard navigation

### Betting Management
- **Odds Display**: Real-time odds for various sports matches
- **Betting Slip**: Dynamic bet management with voice confirmation
- **Match Data**: Sports betting information with live updates
- **Voice Commands**: Natural language betting like "bet 10 pounds on Djokovic to win"

### UI Components
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Component Library**: shadcn/ui for consistent, accessible components
- **Audio Controls**: Volume and speed controls for voice feedback
- **System Status**: Real-time monitoring of voice and betting services

## Data Flow

1. **Voice Input**: User speaks commands → Speech Recognition API → Command Parser
2. **Bet Processing**: Parsed commands → Backend API → Database storage
3. **UI Updates**: Database changes → TanStack Query → React state → UI re-render
4. **Audio Feedback**: Actions → Text-to-Speech → User confirmation

### Database Schema
- **Bets**: User betting records with status tracking
- **Matches**: Sports match data with odds and timing
- **Bet Options**: Additional betting options for each match

## External Dependencies

### Core Libraries
- **React Ecosystem**: React 18, React DOM, React Query
- **UI Framework**: Radix UI primitives with shadcn/ui
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Styling**: Tailwind CSS with PostCSS

### Voice Technologies
- **Speech Recognition**: Web Speech API (browser native)
- **Text-to-Speech**: Speech Synthesis API (browser native)
- **Audio Processing**: Custom hooks for voice control

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast build tool with HMR
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: Neon Database with connection pooling
- **Build Process**: Concurrent frontend and backend development

### Production Build
- **Frontend**: Static build output to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: Drizzle migrations for schema updates
- **Deployment**: Single Node.js server serving both API and static files

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Development**: Hot reload with Replit integration
- **Production**: Optimized builds with proper error handling

The application is designed to be fully accessible, with voice commands as the primary interaction method while maintaining traditional UI fallbacks for users who prefer or need them.