# Chatwoot Conversations API Service

## Overview

The Chatwoot Conversations service provides essential functionality for managing conversation operations through the Chatwoot API proxy. This service handles agent assignment and conversation status updates, which are core operations in customer service management workflows.

## Base Configuration

- **API Base URL**: `/api/chatwoot-proxy.php` (relative path via Vite proxy)
- **Authentication**: Handled via proxy configuration
- **Content Type**: `application/json`
- **Proxy Setup**: All requests are routed through Vite's development proxy to the actual Chatwoot API

## Available Methods

### 1. Assign Agent to Conversation

**Function**: `assignAgentToConversation(conversationId: number, agentId: number | null, accountId: string | number)`

Assigns or unassigns an agent to/from a specific conversation.

**Parameters**:
- `conversationId` (number): The conversation ID to update
- `agentId` (number | null): The agent ID to assign, or `null` to unassign
- `accountId` (string | number): The Chatwoot account ID (accepts both string and number formats)

**Returns**: `Promise<void>`

**Request Body**:
```json
{
  "assignee_id": 123
}
```

**Example Usage**:
```typescript
import { assignAgentToConversation } from '@/services/chatwootConversations';

// Assign agent to conversation
try {
  await assignAgentToConversation(456, 123, 1);
  console.log('Agent assigned successfully');
} catch (error) {
  console.error('Failed to assign agent:', error);
}

// Unassign agent from conversation
try {
  await assignAgentToConversation(456, null, 1);
  console.log('Agent unassigned successfully');
} catch (error) {
  console.error('Failed to unassign agent:', error);
}
```

**API Endpoint**: `PATCH /accounts/{accountId}/conversations/{conversationId}`

### 2. Update Conversation Status

**Function**: `updateConversationStatus(conversationId: number, status: string, accountId: string | number)`

Updates the status of a conversation (open, pending, resolved).

**Parameters**:
- `conversationId` (number): The conversation ID to update
- `status` (string): The new status (`"open"`, `"pending"`, or `"resolved"`)
- `accountId` (string | number): The Chatwoot account ID (accepts both string and number formats)

**Returns**: `Promise<void>`

**Request Body**:
```json
{
  "status": "resolved"
}
```

**Example Usage**:
```typescript
import { updateConversationStatus } from '@/services/chatwootConversations';

// Mark conversation as resolved
try {
  await updateConversationStatus(456, 'resolved', 1);
  console.log('Conversation marked as resolved');
} catch (error) {
  console.error('Failed to update status:', error);
}

// Reopen conversation
try {
  await updateConversationStatus(456, 'open', 1);
  console.log('Conversation reopened');
} catch (error) {
  console.error('Failed to reopen conversation:', error);
}
```

**API Endpoint**: `POST /accounts/{accountId}/conversations/{conversationId}/toggle_status`

## Status Values

The conversation status can be one of the following values:

| Status | Description |
|--------|-------------|
| `open` | Active conversation requiring attention |
| `pending` | Conversation waiting for customer response |
| `resolved` | Completed conversation |

## Error Handling

Both methods implement comprehensive error handling with:

- **HTTP Status Validation**: Checks `response.ok` before processing
- **Detailed Error Messages**: Includes HTTP status codes in error messages
- **Console Logging**: Provides detailed logs for debugging with emoji indicators
- **Error Propagation**: Re-throws errors for upstream handling

### Common Error Scenarios

1. **Network Errors**: Connection issues with the proxy API
2. **Authentication Errors**: Invalid or expired credentials
3. **Not Found Errors**: Attempting to access non-existent conversations or agents
4. **Validation Errors**: Invalid status values or agent IDs
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignAgentToConversation, updateConversationStatus } from '@/services/chatwootConversations';

// Agent assignment hook
export function useAssignAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, agentId, accountId }: {
      conversationId: number;
      agentId: number | null;
      accountId: number;
    }) => assignAgentToConversation(conversationId, agentId, accountId),
    onSuccess: () => {
      // Invalidate conversation queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Status update hook
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, status, accountId }: {
      conversationId: number;
      status: string;
      accountId: number;
    }) => updateConversationStatus(conversationId, status, accountId),
    onSuccess: () => {
      // Invalidate conversation queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
```

### Component Usage

```typescript
import { useAssignAgent, useUpdateConversationStatus } from '@/hooks/useConversations';
import { useToast } from '@/hooks/use-toast';

export function ConversationActions({ conversation, agents }: {
  conversation: Conversation;
  agents: Agent[];
}) {
  const assignAgent = useAssignAgent();
  const updateStatus = useUpdateConversationStatus();
  const { toast } = useToast();

  const handleAssignAgent = async (agentId: number | null) => {
    try {
      await assignAgent.mutateAsync({
        conversationId: conversation.id,
        agentId,
        accountId: conversation.account_id
      });
      
      toast({
        title: agentId ? "Agent assigned" : "Agent unassigned",
        description: agentId 
          ? `Conversation assigned to ${agents.find(a => a.id === agentId)?.name}`
          : "Conversation is now unassigned",
      });
    } catch (error) {
      toast({
        title: "Error assigning agent",
        description: "Could not assign agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        conversationId: conversation.id,
        status: newStatus,
        accountId: conversation.account_id
      });
      
      toast({
        title: "Status updated",
        description: `Conversation marked as ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Could not update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Select onValueChange={handleAssignAgent}>
        <SelectTrigger>
          <SelectValue placeholder="Assign agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>Unassigned</SelectItem>
          {agents.map(agent => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Change status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use React Query**: Leverage caching and invalidation for better UX
3. **Validate inputs**: Check required parameters before API calls
4. **Provide user feedback**: Show loading states and success/error messages
5. **Invalidate queries**: Refresh related data after mutations
6. **Log operations**: Use console logging for debugging and monitoring

## Business Logic Considerations

### Agent Assignment
- Agents can only be assigned to conversations within their account
- Setting `agentId` to `null` unassigns the conversation
- Unassigned conversations appear in the "Unassigned" column in Kanban view

### Status Updates
- Status changes trigger workflow updates in Chatwoot
- Resolved conversations may have restrictions on reopening
- Status changes affect conversation visibility in different views

## Related Documentation

- [Chatwoot Labels API](./chatwoot-labels.md)
- [React Hooks for Conversations](../hooks/useConversations.md)
- [Conversation Components](../components/conversations.md)
- [Chatwoot API Reference](https://www.chatwoot.com/developers/api/)