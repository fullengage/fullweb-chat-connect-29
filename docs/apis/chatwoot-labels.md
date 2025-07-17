# Chatwoot Labels API Service

## Overview

The Chatwoot Labels service provides a comprehensive interface for managing conversation labels through the Chatwoot API proxy. This service handles all label-related operations including creating, updating, deleting labels, and managing label assignments to conversations.

## Base Configuration

- **API Base URL**: `/api/chatwoot-proxy.php` (relative path via Vite proxy)
- **Authentication**: Handled via proxy configuration
- **Content Type**: `application/json`
- **Proxy Setup**: All requests are routed through Vite's development proxy to the actual Chatwoot API

## Data Types

### ChatwootLabel
```typescript
interface ChatwootLabel {
  id: number;
  title: string;
  color: string;
  description?: string;
  show_on_sidebar: boolean;
}
```

### ChatwootConversationLabel
```typescript
interface ChatwootConversationLabel {
  id: number;
  title: string;
  color: string;
  description?: string;
  show_on_sidebar: boolean;
}
```

## Available Methods

### 1. Fetch All Labels

**Function**: `fetchChatwootLabels(accountId: number)`

Retrieves all labels for a specific account.

**Parameters**:
- `accountId` (number): The Chatwoot account ID

**Returns**: `Promise<ChatwootLabel[]>`

**Example Usage**:
```typescript
import { fetchChatwootLabels } from '@/services/chatwootLabels';

try {
  const labels = await fetchChatwootLabels(1);
  console.log('Available labels:', labels);
} catch (error) {
  console.error('Failed to fetch labels:', error);
}
```

**API Endpoint**: `GET /accounts/{accountId}/labels`

### 2. Fetch Conversation Labels

**Function**: `fetchConversationLabels(conversationId: number, accountId: number)`

Retrieves all labels assigned to a specific conversation.

**Parameters**:
- `conversationId` (number): The conversation ID
- `accountId` (number): The Chatwoot account ID

**Returns**: `Promise<ChatwootConversationLabel[]>`

**Example Usage**:
```typescript
import { fetchConversationLabels } from '@/services/chatwootLabels';

try {
  const conversationLabels = await fetchConversationLabels(123, 1);
  console.log('Conversation labels:', conversationLabels);
} catch (error) {
  console.error('Failed to fetch conversation labels:', error);
}
```

**API Endpoint**: `GET /accounts/{accountId}/conversations/{conversationId}/labels`

### 3. Add Label to Conversation

**Function**: `addLabelToConversation(conversationId: number, labelId: number, accountId: number)`

Assigns a label to a conversation.

**Parameters**:
- `conversationId` (number): The conversation ID
- `labelId` (number): The label ID to assign
- `accountId` (number): The Chatwoot account ID

**Returns**: `Promise<void>`

**Request Body**:
```json
{
  "labels": [labelId]
}
```

**Example Usage**:
```typescript
import { addLabelToConversation } from '@/services/chatwootLabels';

try {
  await addLabelToConversation(123, 456, 1);
  console.log('Label added successfully');
} catch (error) {
  console.error('Failed to add label:', error);
}
```

**API Endpoint**: `POST /accounts/{accountId}/conversations/{conversationId}/labels`

### 4. Remove Label from Conversation

**Function**: `removeLabelFromConversation(conversationId: number, labelId: number, accountId: number)`

Removes a label from a conversation.

**Parameters**:
- `conversationId` (number): The conversation ID
- `labelId` (number): The label ID to remove
- `accountId` (number): The Chatwoot account ID

**Returns**: `Promise<void>`

**Example Usage**:
```typescript
import { removeLabelFromConversation } from '@/services/chatwootLabels';

try {
  await removeLabelFromConversation(123, 456, 1);
  console.log('Label removed successfully');
} catch (error) {
  console.error('Failed to remove label:', error);
}
```

**API Endpoint**: `DELETE /accounts/{accountId}/conversations/{conversationId}/labels/{labelId}`

### 5. Create New Label

**Function**: `createChatwootLabel(accountId: number, title: string, color: string, description?: string)`

Creates a new label in the Chatwoot account.

**Parameters**:
- `accountId` (number): The Chatwoot account ID
- `title` (string): The label title
- `color` (string): The label color (hex format)
- `description` (string, optional): Label description

**Returns**: `Promise<ChatwootLabel>`

**Request Body**:
```json
{
  "title": "Priority",
  "color": "#FF5733",
  "description": "High priority conversations",
  "show_on_sidebar": true
}
```

**Example Usage**:
```typescript
import { createChatwootLabel } from '@/services/chatwootLabels';

try {
  const newLabel = await createChatwootLabel(
    1, 
    'Priority', 
    '#FF5733', 
    'High priority conversations'
  );
  console.log('Label created:', newLabel);
} catch (error) {
  console.error('Failed to create label:', error);
}
```

**API Endpoint**: `POST /accounts/{accountId}/labels`

### 6. Update Existing Label

**Function**: `updateChatwootLabel(accountId: number, labelId: number, title: string, color: string, description?: string)`

Updates an existing label's properties.

**Parameters**:
- `accountId` (number): The Chatwoot account ID
- `labelId` (number): The label ID to update
- `title` (string): The new label title
- `color` (string): The new label color (hex format)
- `description` (string, optional): New label description

**Returns**: `Promise<ChatwootLabel>`

**Request Body**:
```json
{
  "title": "Updated Priority",
  "color": "#33FF57",
  "description": "Updated description",
  "show_on_sidebar": true
}
```

**Example Usage**:
```typescript
import { updateChatwootLabel } from '@/services/chatwootLabels';

try {
  const updatedLabel = await updateChatwootLabel(
    1, 
    456, 
    'Updated Priority', 
    '#33FF57', 
    'Updated description'
  );
  console.log('Label updated:', updatedLabel);
} catch (error) {
  console.error('Failed to update label:', error);
}
```

**API Endpoint**: `PATCH /accounts/{accountId}/labels/{labelId}`

### 7. Delete Label

**Function**: `deleteChatwootLabel(accountId: number, labelId: number)`

Permanently deletes a label from the Chatwoot account.

**Parameters**:
- `accountId` (number): The Chatwoot account ID
- `labelId` (number): The label ID to delete

**Returns**: `Promise<void>`

**Example Usage**:
```typescript
import { deleteChatwootLabel } from '@/services/chatwootLabels';

try {
  await deleteChatwootLabel(1, 456);
  console.log('Label deleted successfully');
} catch (error) {
  console.error('Failed to delete label:', error);
}
```

**API Endpoint**: `DELETE /accounts/{accountId}/labels/{labelId}`

## Error Handling

All methods implement comprehensive error handling with:

- **HTTP Status Validation**: Checks response.ok before processing
- **Detailed Error Messages**: Includes HTTP status codes in error messages
- **Console Logging**: Provides detailed logs for debugging
- **Error Propagation**: Re-throws errors for upstream handling

### Common Error Scenarios

1. **Network Errors**: Connection issues with the proxy API
2. **Authentication Errors**: Invalid or expired credentials
3. **Not Found Errors**: Attempting to access non-existent labels or conversations
4. **Validation Errors**: Invalid data format or missing required fields
5. **Permission Errors**: Insufficient permissions for the requested operation

### Error Response Format

```typescript
// Typical error structure
{
  message: string;
  status?: number;
  details?: any;
}
```

## Integration Examples

### React Hook Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChatwootLabels, createChatwootLabel } from '@/services/chatwootLabels';

// Fetch labels hook
export function useChatwootLabels(accountId: number) {
  return useQuery({
    queryKey: ['chatwoot-labels', accountId],
    queryFn: () => fetchChatwootLabels(accountId),
    enabled: !!accountId,
  });
}

// Create label mutation
export function useCreateChatwootLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ accountId, title, color, description }: {
      accountId: number;
      title: string;
      color: string;
      description?: string;
    }) => createChatwootLabel(accountId, title, color, description),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-labels', variables.accountId] 
      });
    },
  });
}
```

### Component Usage

```typescript
import { useChatwootLabels, useCreateChatwootLabel } from '@/hooks/useChatwootLabels';

export function LabelManager({ accountId }: { accountId: number }) {
  const { data: labels, isLoading } = useChatwootLabels(accountId);
  const createLabel = useCreateChatwootLabel();

  const handleCreateLabel = async (title: string, color: string) => {
    try {
      await createLabel.mutateAsync({
        accountId,
        title,
        color,
        description: 'Created from UI'
      });
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  if (isLoading) return <div>Loading labels...</div>;

  return (
    <div>
      {labels?.map(label => (
        <div key={label.id} style={{ color: label.color }}>
          {label.title}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use React Query**: Leverage caching and invalidation for better UX
3. **Validate inputs**: Check required parameters before API calls
4. **Provide user feedback**: Show loading states and error messages
5. **Optimize requests**: Batch operations when possible
6. **Cache management**: Invalidate relevant queries after mutations

## Related Documentation

- [React Hooks for Labels](../hooks/useLabels.md)
- [Label Components](../components/labels.md)
- [Chatwoot API Reference](https://www.chatwoot.com/developers/api/)