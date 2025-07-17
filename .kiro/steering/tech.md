# Technology Stack

## Frontend Framework
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **React Router DOM** for client-side routing
- **TanStack Query** for server state management

## UI Framework
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming
- **Lucide React** for icons
- **Dark mode** support with next-themes

## Key Libraries
- **@dnd-kit** for drag-and-drop functionality (Kanban board)
- **React Hook Form** with Zod validation for forms
- **date-fns** for date manipulation
- **Recharts** for analytics visualizations
- **Sonner** for toast notifications

## Backend Integration
- **Supabase** for authentication and database
- **Chatwoot API** integration via proxy for conversation management
- Custom proxy configuration in Vite for API routing

## Development Tools
- **ESLint** with TypeScript support
- **PostCSS** with Autoprefixer
- **Lovable** integration for collaborative development

## Common Commands

```bash
# Development
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Package Management
npm i                # Install dependencies
```

## Build Configuration
- Vite configured with SWC for fast compilation
- Path aliases: `@/` maps to `src/`
- Proxy setup for Chatwoot API at `/api/chatwoot-proxy.php`
- Component tagging enabled in development mode