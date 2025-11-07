# Relio AI Package

Enhanced AI system for CRM data analysis and automation, inspired by chat-zeron architecture.

## 🚀 Features

- **Multi-Model Support**: OpenAI and Anthropic models with intelligent selection
- **Streaming Responses**: Real-time text generation for better UX
- **CRM-Specific Tools**: Pre-built functions for contacts, tasks, analytics, and more
- **Type Safety**: Full TypeScript support with Zod validation
- **Smart Prompting**: Context-aware prompts with business intelligence focus
- **Chat Management**: Persistent chat history with time-based organization

## 📦 Installation

This package is already configured in your monorepo. Dependencies include:

```json
{
  "@ai-sdk/openai": "^1.1.14",
  "@ai-sdk/anthropic": "^1.1.10", 
  "ai": "^4.1.46",
  "zod": "^3.22.4"
}
```

## 🎯 Usage

### 1. Basic Model Usage

```typescript
import { getModel, selectOptimalModel } from "@repo/ai";

// Use default model
const model = getModel(); // gpt-4o-mini

// Select optimal model based on requirements
const smartModel = selectOptimalModel({
  complexity: "high",
  speed: "balanced", 
  costSensitive: false
});
```

### 2. CRM Tools Integration

```typescript
import { createCRMTools, type ToolContext } from "@repo/ai";

const toolContext: ToolContext = {
  organizationId: "org-123",
  userId: "user-456", 
  userRole: "admin",
  db: prismaClient
};

const tools = createCRMTools(toolContext);

// Use in streamText
const result = await streamText({
  model: getModel("gpt-4o"),
  tools,
  messages: [/* your messages */]
});
```

### 3. System Prompts

```typescript
import { getSystemPrompt, type PromptContext } from "@repo/ai";

const prompt = getSystemPrompt({
  organizationId: "org-123",
  organizationName: "Acme Corp",
  userRole: "admin",
  userName: "John Doe",
  currentDate: new Date().toLocaleDateString()
});
```

### 4. Frontend Integration

```typescript
import { useChat } from 'ai/react';

const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/ai-chat/chat',
  body: {
    organizationId: currentOrg.id,
    modelKey: 'gpt-4o-mini'
  }
});
```

## 🛠 Available Tools

### Core CRM Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `searchContacts` | Search contacts by name, email, company | `query`, `limit`, `status` |
| `searchCompanies` | Search companies by name, industry | `query`, `limit`, `industry` |
| `getTaskSummary` | Get task analytics and summaries | `assigneeId`, `status`, `priority`, `days` |
| `getAnalytics` | Business metrics and KPIs | `period`, `metrics` |
| `getRecentActivity` | Recent activity timeline | `limit`, `type`, `userId` |
| `createTask` | Create new tasks | `title`, `description`, `priority`, `assigneeId`, `dueDate` |

### Example Tool Usage

```typescript
// The AI can automatically use these tools when users ask:
// "Show me all contacts from Google"
// "What tasks are overdue?" 
// "Create a high priority task to follow up with John"
// "What are our metrics for this month?"
```

## 🏗 Architecture

```
packages/ai/
├── lib/
│   ├── provider.ts     # Model management and selection
│   ├── schema.ts       # Tool schemas and validation  
│   ├── tools.ts        # CRM-specific tool implementations
│   ├── prompts.ts      # System and helper prompts
│   └── index.ts        # Re-exports for easy importing
├── index.ts            # Main package exports
└── package.json        # Dependencies and scripts
```

## 🎨 Model Options

### OpenAI Models
- **gpt-4o**: Most capable, premium tier
- **gpt-4o-mini**: Balanced performance, standard tier  
- **gpt-4-turbo**: Advanced reasoning, premium tier

### Anthropic Models
- **claude-3-5-sonnet**: Most capable, premium tier
- **claude-3-haiku**: Fast and efficient, standard tier

### Smart Selection

```typescript
// Automatic selection based on needs
const model = selectOptimalModel({
  complexity: "high",      // low | medium | high
  speed: "fast",          // fast | balanced | thorough  
  costSensitive: true,    // boolean
  needsVision: false      // boolean
});
```

## 🔧 API Integration

Your API routes can use the enhanced system:

```typescript
// packages/api/src/routes/ai-chat.ts
const result = await streamText({
  model: getModel(selectedModel),
  messages,
  tools: createCRMTools(toolContext),
  system: getSystemPrompt(promptContext)
});

return new Response(result.toDataStreamResponse().body);
```

## 📊 Chat Management

The system includes full chat management:

- **Create/Update**: Automatic chat persistence
- **History**: Time-grouped chat organization (Today, Yesterday, Last 30 Days, Older)
- **Search**: Content-based chat search
- **Delete**: Secure chat deletion

## 🔒 Security & Access Control

- Organization-based data isolation
- Role-based tool access
- User permission validation
- Secure data handling

## 🚀 Migration from Previous System

The new system is backward compatible:

```typescript
// Old way (still works)
import { textModel } from "@repo/ai";

// New way (recommended)  
import { getModel } from "@repo/ai";
const model = getModel("gpt-4o-mini");
```

## 📈 Performance

- **Streaming**: Real-time response generation
- **Caching**: Database query optimization with TTL
- **Parallel**: Efficient tool execution
- **Smart**: Context-aware model selection

## 🤝 Contributing

When adding new CRM tools:

1. Add schema to `lib/schema.ts`
2. Implement tool in `lib/tools.ts` 
3. Export from `index.ts`
4. Update documentation

Example:

```typescript
// lib/schema.ts
export const TOOL_SCHEMAS = {
  newTool: {
    name: "newTool",
    description: "Description of new tool",
    parameters: { /* zod schema */ }
  }
}

// lib/tools.ts  
newTool: tool({
  description: TOOL_SCHEMAS.newTool.description,
  parameters: z.object({ /* validation */ }),
  execute: async (params) => { /* implementation */ }
})
```

This enhanced AI system provides a robust foundation for intelligent CRM automation while maintaining the flexibility to add new capabilities as your business grows. 