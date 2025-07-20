import { 
  Bot, 
  BrainCircuit, 
  Database, 
  Memory, 
  Search, 
  FileText, 
  MessageSquare, 
  Zap,
  Eye,
  Users,
  Settings,
  Code,
  Webhook,
  Cpu,
  Network,
  HardDrive,
  Lock,
  AlertTriangle,
  GitBranch,
  RefreshCw,
  Filter,
  BarChart3,
  Layers,
  Target,
  Compass,
  Microscope,
  Wand2,
  Sparkles,
  Workflow
} from 'lucide-react';
import type { AvailableNodeType } from '@/types/workflow';

// Enhanced AI Agent Nodes with Memory, RAG, and Tool Usage
export const ENHANCED_AI_AGENT_NODES: AvailableNodeType[] = [
  // AI Agent Memory Nodes
  {
    type: 'aiAgentMemory',
    name: 'AI Agent Memory',
    icon: Memory,
    description: 'Persistent memory for AI agents with context retention across conversations and sessions',
    category: 'ai-agents',
    defaultConfig: {
      memoryType: 'conversational', // conversational, semantic, episodic, procedural
      maxTokens: 4000,
      retentionDays: 30,
      compressionStrategy: 'summarization',
      keywordExtraction: true,
      emotionalContext: true,
      userPreferences: true
    },
    configSchema: {
      memoryType: {
        label: 'Memory Type',
        type: 'select',
        options: [
          { value: 'conversational', label: 'Conversational Memory' },
          { value: 'semantic', label: 'Semantic Knowledge' },
          { value: 'episodic', label: 'Episodic Events' },
          { value: 'procedural', label: 'Procedural Skills' }
        ],
        defaultValue: 'conversational',
        helperText: 'Type of memory to maintain for the AI agent'
      },
      maxTokens: {
        label: 'Max Memory Tokens',
        type: 'number',
        defaultValue: 4000,
        min: 1000,
        max: 32000,
        helperText: 'Maximum tokens to store in memory'
      },
      retentionDays: {
        label: 'Retention Period (Days)',
        type: 'number',
        defaultValue: 30,
        min: 1,
        max: 365,
        helperText: 'How long to retain memory data'
      },
      compressionStrategy: {
        label: 'Compression Strategy',
        type: 'select',
        options: [
          { value: 'summarization', label: 'AI Summarization' },
          { value: 'keypoints', label: 'Key Points Extraction' },
          { value: 'embedding', label: 'Embedding Compression' }
        ],
        defaultValue: 'summarization'
      }
    },
    inputHandles: ['context', 'userInput', 'sessionData'],
    outputHandles: ['enhancedContext', 'memoryData', 'insights']
  },
  
  // RAG (Retrieval-Augmented Generation) Node
  {
    type: 'ragRetriever',
    name: 'RAG Knowledge Retriever',
    icon: Search,
    description: 'Retrieval-augmented generation from knowledge bases, documents, and vector stores',
    category: 'ai-agents',
    defaultConfig: {
      vectorStore: 'pinecone',
      embeddingModel: 'text-embedding-ada-002',
      topK: 5,
      similarityThreshold: 0.8,
      rerankingEnabled: true,
      contextWindow: 8000,
      sources: ['documents', 'web', 'database'],
      citationFormat: 'academic'
    },
    configSchema: {
      vectorStore: {
        label: 'Vector Store',
        type: 'select',
        options: [
          { value: 'pinecone', label: 'Pinecone' },
          { value: 'chroma', label: 'Chroma DB' },
          { value: 'faiss', label: 'FAISS' },
          { value: 'weaviate', label: 'Weaviate' }
        ],
        defaultValue: 'pinecone',
        helperText: 'Vector database for similarity search'
      },
      embeddingModel: {
        label: 'Embedding Model',
        type: 'select',
        options: [
          { value: 'text-embedding-ada-002', label: 'OpenAI Ada-002' },
          { value: 'text-embedding-3-small', label: 'OpenAI Text-3-Small' },
          { value: 'sentence-transformers', label: 'Sentence Transformers' }
        ],
        defaultValue: 'text-embedding-ada-002'
      },
      topK: {
        label: 'Top K Results',
        type: 'number',
        defaultValue: 5,
        min: 1,
        max: 20,
        helperText: 'Number of most similar documents to retrieve'
      },
      similarityThreshold: {
        label: 'Similarity Threshold',
        type: 'number',
        defaultValue: 0.8,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        helperText: 'Minimum similarity score for relevance'
      }
    },
    inputHandles: ['query', 'filters', 'context'],
    outputHandles: ['retrievedDocs', 'citations', 'confidence']
  },

  // Multi-Tool Agent Node
  {
    type: 'toolAgent',
    name: 'Multi-Tool AI Agent',
    icon: Wand2,
    description: 'AI agent that can dynamically use multiple tools and APIs based on the task requirements',
    category: 'ai-agents',
    defaultConfig: {
      availableTools: ['web_search', 'calculator', 'code_executor', 'api_caller', 'file_reader'],
      maxToolCalls: 10,
      reasoningStrategy: 'chain-of-thought',
      selfCorrection: true,
      toolTimeout: 30000,
      parallelExecution: false,
      errorRecovery: 'retry-with-alternative'
    },
    configSchema: {
      availableTools: {
        label: 'Available Tools',
        type: 'multiselect',
        options: [
          { value: 'web_search', label: 'Web Search' },
          { value: 'calculator', label: 'Calculator' },
          { value: 'code_executor', label: 'Code Executor' },
          { value: 'api_caller', label: 'API Caller' },
          { value: 'file_reader', label: 'File Reader' },
          { value: 'email_sender', label: 'Email Sender' },
          { value: 'database_query', label: 'Database Query' },
          { value: 'image_generator', label: 'Image Generator' }
        ],
        defaultValue: ['web_search', 'calculator', 'code_executor'],
        helperText: 'Tools available for the agent to use'
      },
      maxToolCalls: {
        label: 'Max Tool Calls',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 50,
        helperText: 'Maximum number of tool calls per execution'
      },
      reasoningStrategy: {
        label: 'Reasoning Strategy',
        type: 'select',
        options: [
          { value: 'chain-of-thought', label: 'Chain of Thought' },
          { value: 'react', label: 'ReAct (Reason + Act)' },
          { value: 'plan-and-solve', label: 'Plan and Solve' },
          { value: 'tree-of-thoughts', label: 'Tree of Thoughts' }
        ],
        defaultValue: 'chain-of-thought'
      }
    },
    inputHandles: ['task', 'context', 'constraints'],
    outputHandles: ['result', 'toolsUsed', 'reasoning', 'error']
  },

  // Conversation Agent with Context
  {
    type: 'conversationAgent',
    name: 'Conversation AI Agent',
    icon: MessageSquare,
    description: 'Stateful conversation agent with personality, context awareness, and multi-turn dialogue',
    category: 'ai-agents',
    defaultConfig: {
      personality: 'helpful-professional',
      conversationStyle: 'adaptive',
      contextWindow: 16000,
      memoryIntegration: true,
      emotionalIntelligence: true,
      multiLanguage: true,
      responseFormat: 'natural'
    },
    configSchema: {
      personality: {
        label: 'Agent Personality',
        type: 'select',
        options: [
          { value: 'helpful-professional', label: 'Helpful & Professional' },
          { value: 'friendly-casual', label: 'Friendly & Casual' },
          { value: 'expert-technical', label: 'Expert & Technical' },
          { value: 'creative-inspiring', label: 'Creative & Inspiring' },
          { value: 'custom', label: 'Custom Personality' }
        ],
        defaultValue: 'helpful-professional'
      },
      conversationStyle: {
        label: 'Conversation Style',
        type: 'select',
        options: [
          { value: 'adaptive', label: 'Adaptive to User' },
          { value: 'consistent', label: 'Consistent Style' },
          { value: 'formal', label: 'Formal' },
          { value: 'casual', label: 'Casual' }
        ],
        defaultValue: 'adaptive'
      },
      contextWindow: {
        label: 'Context Window (tokens)',
        type: 'number',
        defaultValue: 16000,
        min: 4000,
        max: 128000,
        helperText: 'Token limit for conversation context'
      }
    },
    inputHandles: ['userMessage', 'conversationHistory', 'context'],
    outputHandles: ['response', 'updatedHistory', 'sentiment', 'intent']
  },

  // Workflow Intelligence Agent
  {
    type: 'workflowIntelligence',
    name: 'Workflow Intelligence Agent',
    icon: BrainCircuit,
    description: 'AI agent that analyzes, optimizes, and suggests improvements for workflow performance',
    category: 'ai-agents',
    defaultConfig: {
      analysisDepth: 'comprehensive',
      optimizationGoals: ['performance', 'cost', 'reliability'],
      benchmarkData: true,
      predictiveAnalysis: true,
      alertThresholds: {
        performance: 0.8,
        errorRate: 0.05,
        costIncrease: 0.2
      }
    },
    configSchema: {
      analysisDepth: {
        label: 'Analysis Depth',
        type: 'select',
        options: [
          { value: 'basic', label: 'Basic Analysis' },
          { value: 'detailed', label: 'Detailed Analysis' },
          { value: 'comprehensive', label: 'Comprehensive Analysis' }
        ],
        defaultValue: 'comprehensive'
      },
      optimizationGoals: {
        label: 'Optimization Goals',
        type: 'multiselect',
        options: [
          { value: 'performance', label: 'Performance' },
          { value: 'cost', label: 'Cost Efficiency' },
          { value: 'reliability', label: 'Reliability' },
          { value: 'security', label: 'Security' },
          { value: 'scalability', label: 'Scalability' }
        ],
        defaultValue: ['performance', 'cost', 'reliability']
      }
    },
    inputHandles: ['workflowData', 'performanceMetrics', 'historicalData'],
    outputHandles: ['analysis', 'recommendations', 'predictions', 'alerts']
  }
];

// Enhanced Logic and Control Nodes
export const ENHANCED_LOGIC_NODES: AvailableNodeType[] = [
  // Advanced Conditional Logic with AI-powered decisions
  {
    type: 'aiConditionalBranch',
    name: 'AI-Powered Conditional Branch',
    icon: GitBranch,
    description: 'Intelligent conditional branching using AI to evaluate complex conditions and context',
    category: 'logic',
    defaultConfig: {
      evaluationMethod: 'ai-reasoning',
      model: 'mistral-large',
      confidenceThreshold: 0.8,
      fallbackCondition: 'default',
      explainDecision: true,
      contextAware: true
    },
    configSchema: {
      evaluationMethod: {
        label: 'Evaluation Method',
        type: 'select',
        options: [
          { value: 'ai-reasoning', label: 'AI Reasoning' },
          { value: 'rule-based', label: 'Rule-based Logic' },
          { value: 'hybrid', label: 'Hybrid (AI + Rules)' }
        ],
        defaultValue: 'ai-reasoning'
      },
      conditions: {
        label: 'AI Decision Context',
        type: 'textarea',
        placeholder: 'Describe the conditions and decision logic in natural language...',
        required: true,
        helperText: 'The AI will evaluate based on this context'
      },
      confidenceThreshold: {
        label: 'Confidence Threshold',
        type: 'number',
        defaultValue: 0.8,
        min: 0.1,
        max: 1.0,
        step: 0.1
      }
    },
    inputHandles: ['input', 'context', 'data'],
    outputHandles: ['branch1', 'branch2', 'branch3', 'default', 'confidence']
  },

  // Dynamic Loop with AI-driven exit conditions
  {
    type: 'aiDynamicLoop',
    name: 'AI-Controlled Dynamic Loop',
    icon: RefreshCw,
    description: 'Intelligent loop that uses AI to determine iteration and exit conditions dynamically',
    category: 'logic',
    defaultConfig: {
      maxIterations: 100,
      exitStrategy: 'ai-determined',
      progressTracking: true,
      adaptiveDelay: true,
      errorHandling: 'continue-with-logging'
    },
    configSchema: {
      exitCondition: {
        label: 'AI Exit Condition',
        type: 'textarea',
        placeholder: 'Describe when the loop should exit in natural language...',
        required: true,
        helperText: 'AI will evaluate this condition each iteration'
      },
      maxIterations: {
        label: 'Max Iterations',
        type: 'number',
        defaultValue: 100,
        min: 1,
        max: 10000
      },
      adaptiveDelay: {
        label: 'Adaptive Delay',
        type: 'boolean',
        defaultValue: true,
        helperText: 'AI adjusts delay between iterations based on performance'
      }
    },
    inputHandles: ['initialData', 'loopContext'],
    outputHandles: ['iterationOutput', 'finalResult', 'loopStats']
  }
];

// Enhanced Integration Nodes with AI capabilities
export const ENHANCED_INTEGRATION_NODES: AvailableNodeType[] = [
  // AI-Powered API Handler
  {
    type: 'aiApiHandler',
    name: 'AI API Handler',
    icon: Network,
    description: 'Intelligent API integration that adapts to different API responses and handles errors with AI',
    category: 'integrations',
    defaultConfig: {
      adaptiveRetry: true,
      responseAnalysis: true,
      errorPrediction: true,
      dynamicMapping: true,
      apiDocumentation: '',
      learningMode: true
    },
    configSchema: {
      apiEndpoint: {
        label: 'API Endpoint',
        type: 'string',
        required: true,
        placeholder: 'https://api.example.com/endpoint'
      },
      apiDocumentation: {
        label: 'API Documentation (Optional)',
        type: 'textarea',
        placeholder: 'Paste API documentation here for better AI understanding...',
        helperText: 'AI will use this to better understand the API'
      },
      adaptiveRetry: {
        label: 'AI Adaptive Retry',
        type: 'boolean',
        defaultValue: true,
        helperText: 'AI adjusts retry strategy based on error patterns'
      },
      responseAnalysis: {
        label: 'AI Response Analysis',
        type: 'boolean',
        defaultValue: true,
        helperText: 'AI analyzes and validates API responses'
      }
    },
    inputHandles: ['requestData', 'headers', 'context'],
    outputHandles: ['response', 'metadata', 'confidence', 'error']
  }
];

// Combine all enhanced nodes
export const ENHANCED_AI_NODES = [
  ...ENHANCED_AI_AGENT_NODES,
  ...ENHANCED_LOGIC_NODES,
  ...ENHANCED_INTEGRATION_NODES
];

// Categories for the enhanced nodes
export const ENHANCED_NODE_CATEGORIES = [
  {
    id: 'ai-agents',
    name: 'AI Agents',
    description: 'Advanced AI agents with memory, tools, and reasoning capabilities',
    icon: Bot,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'logic',
    name: 'Smart Logic',
    description: 'AI-powered logic and control flow nodes',
    icon: BrainCircuit,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'integrations',
    name: 'Smart Integrations',
    description: 'AI-enhanced integration and API handling nodes',
    icon: Network,
    color: 'from-green-500 to-teal-500'
  }
];