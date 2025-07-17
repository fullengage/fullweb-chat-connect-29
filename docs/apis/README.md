# API Documentation

This directory contains documentation for all API services and integrations used in the application.

## Available APIs

### [Chatwoot Conversations API](./chatwoot-conversations.md)
Core service for managing conversation operations through the Chatwoot API proxy. Includes:
- Agent assignment and unassignment
- Conversation status updates (open, pending, resolved)
- Comprehensive error handling
- React hooks integration examples

### [Chatwoot Labels API](./chatwoot-labels.md)
Complete service for managing conversation labels through the Chatwoot API proxy. Includes:
- Label creation, updating, and deletion
- Conversation label assignment and removal
- Full CRUD operations with error handling
- React hooks integration examples

## API Structure

All API services follow a consistent pattern:

1. **Service Layer** (`src/services/`): Raw API functions with TypeScript interfaces
2. **Hook Layer** (`src/hooks/`): React Query hooks for state management
3. **Component Layer** (`src/components/`): UI components that consume the hooks

## Common Patterns

### Error Handling
All API services implement comprehensive error handling with:
- HTTP status validation
- Detailed error messages
- Console logging for debugging
- Error propagation for UI feedback

### State Management
- **TanStack Query** for server state caching and synchronization
- **Optimistic updates** for better user experience
- **Query invalidation** after mutations
- **Loading and error states** for UI feedback

### Authentication
- All API calls go through the Chatwoot proxy
- Authentication is handled at the proxy level
- No direct API keys in frontend code

## Best Practices

1. **Always use hooks**: Don't call service functions directly from components
2. **Handle loading states**: Show appropriate UI feedback during API calls
3. **Implement error boundaries**: Catch and display API errors gracefully
4. **Cache invalidation**: Invalidate relevant queries after mutations
5. **Type safety**: Use TypeScript interfaces for all API data structures

## Adding New APIs

When adding new API services:

1. Create service functions in `src/services/`
2. Define TypeScript interfaces for data structures
3. Create React hooks in `src/hooks/`
4. Add comprehensive error handling
5. Document the API in this directory
6. Update this README with the new API

## Related Documentation

- [Project Structure](../structure.md)
- [Technology Stack](../tech.md)
- [Component Documentation](../components/)