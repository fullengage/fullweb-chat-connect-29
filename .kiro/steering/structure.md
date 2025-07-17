# Project Structure

## Root Directory
```
├── src/                    # Source code
├── public/                 # Static assets
├── supabase/              # Supabase configuration and migrations
├── .kiro/                 # Kiro AI assistant configuration
├── docs/                  # Documentation
└── node_modules/          # Dependencies
```

## Source Code Organization (`src/`)
```
src/
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   └── [feature]/        # Feature-specific components
├── pages/                # Route components (page-level)
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
├── services/             # API service functions
├── integrations/         # Third-party integrations
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Key Conventions

### Component Organization
- **UI Components**: Base components in `src/components/ui/`
- **Feature Components**: Grouped by feature (e.g., `ConversationCard`, `KanbanBoard`)
- **Page Components**: Route-level components in `src/pages/`

### File Naming
- **Components**: PascalCase (e.g., `ConversationCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useChatwootMessages.ts`)
- **Types**: PascalCase interfaces/types (e.g., `ChatwootMessage`)
- **Services**: camelCase (e.g., `chatwootService.ts`)

### Import Aliases
- `@/` maps to `src/` directory
- Use absolute imports: `import { Button } from "@/components/ui/button"`

### Authentication & Routing
- Protected routes wrapped with `ProtectedRoute` component
- Authentication context provides user state globally
- Route-based code splitting for performance

### State Management
- **Server State**: TanStack Query for API data
- **Client State**: React hooks and context
- **Form State**: React Hook Form with Zod validation

### Styling Approach
- Tailwind CSS utility classes
- CSS variables for theming
- Component variants using `class-variance-authority`
- Dark mode support throughout