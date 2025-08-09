import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Brain, MessageSquare, FileText, Code, Search, Wand2, BookOpen, Languages, Cpu } from 'lucide-react';

// GROQ AI Integration Nodes using Llama models
export const GROQ_AI_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'groqChatCompletion',
    name: 'GROQ: Chat Completion',
    icon: Bot,
    description: 'Generates text completions using GROQ API with Llama models',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'llama-3.1-70b-versatile',
      messages: '[{"role": "user", "content": "{{input.prompt}}"}]',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 1.0,
      simulatedOutput: 'This is a simulated GROQ response using Llama 3.1 70B model.'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: [
          'llama-3.1-70b-versatile',
          'llama-3.1-8b-instant',
          'llama-3.2-90b-text-preview',
          'llama-3.2-11b-text-preview',
          'mixtral-8x7b-32768'
        ],
        defaultValue: 'llama-3.1-70b-versatile',
        required: true,
        helperText: 'Select the GROQ model to use'
      },
      messages: {
        label: 'Messages (JSON Array)',
        type: 'json',
        placeholder: '[{"role": "user", "content": "{{input.prompt}}"}]',
        helperText: 'Array of message objects with role (system, user, assistant) and content',
        required: true
      },
      maxTokens: {
        label: 'Max Tokens',
        type: 'number',
        defaultValue: 1000,
        placeholder: '1000',
        helperText: 'Maximum number of tokens to generate'
      },
      temperature: {
        label: 'Temperature',
        type: 'number',
        defaultValue: 0.7,
        placeholder: '0.7',
        helperText: 'Controls randomness (0.0 to 1.0)'
      },
      topP: {
        label: 'Top P',
        type: 'number',
        defaultValue: 1.0,
        placeholder: '1.0',
        helperText: 'Nucleus sampling parameter (0.0 to 1.0)'
      },
      simulatedOutput: {
        label: 'Simulated Output (String)',
        type: 'string',
        placeholder: 'This is a simulated GROQ response.',
        helperText: 'Mock response for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'usage', 'error'],
    aiExplanation: 'Uses GROQ API with Llama models for fast and efficient text generation. Requires GROQ API key for production use.'
  },
  {
    type: 'groqCodeGeneration',
    name: 'GROQ: Code Generation',
    icon: Code,
    description: 'Generates code using GROQ API with Llama models optimized for programming tasks',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'llama-3.1-70b-versatile',
      prompt: '{{input.codePrompt}}',
      language: 'javascript',
      context: '',
      maxTokens: 2000,
      temperature: 0.1,
      simulatedOutput: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultValue: 'llama-3.1-70b-versatile',
        required: true,
        helperText: 'Llama 3.1 70B is recommended for complex code generation'
      },
      prompt: {
        label: 'Code Prompt',
        type: 'textarea',
        placeholder: 'Generate a function to calculate fibonacci numbers',
        required: true
      },
      language: {
        label: 'Programming Language',
        type: 'select',
        options: ['javascript', 'python', 'java', 'typescript', 'go', 'rust', 'cpp', 'c', 'php', 'ruby', 'swift', 'kotlin'],
        defaultValue: 'javascript',
        helperText: 'Target programming language'
      },
      context: {
        label: 'Additional Context',
        type: 'textarea',
        placeholder: 'Additional context or requirements',
        helperText: 'Optional context to improve code generation'
      },
      maxTokens: {
        label: 'Max Tokens',
        type: 'number',
        defaultValue: 2000,
        placeholder: '2000'
      },
      temperature: {
        label: 'Temperature',
        type: 'number',
        defaultValue: 0.1,
        placeholder: '0.1',
        helperText: 'Lower temperature for more deterministic code'
      },
      simulatedOutput: {
        label: 'Simulated Output (String)',
        type: 'string',
        placeholder: 'function example() { return "Hello World"; }',
        helperText: 'Mock code output for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['generatedCode', 'explanation', 'error'],
    aiExplanation: 'Specialized for code generation using GROQ API with Llama models. Supports multiple programming languages with fast inference.'
  },
  {
    type: 'groqTextAnalysis',
    name: 'GROQ: Text Analysis',
    icon: Search,
    description: 'Analyzes text for sentiment, entities, key topics using GROQ API with Llama models',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'llama-3.1-70b-versatile',
      text: '{{input.text}}',
      analysisType: 'sentiment',
      customPrompt: '',
      simulatedOutput: '{"sentiment": "positive", "confidence": 0.85, "key_topics": ["technology", "innovation"]}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultValue: 'llama-3.1-70b-versatile',
        required: true
      },
      text: {
        label: 'Text to Analyze',
        type: 'textarea',
        placeholder: '{{input.text}}',
        required: true
      },
      analysisType: {
        label: 'Analysis Type',
        type: 'select',
        options: ['sentiment', 'entities', 'topics', 'summary', 'classification', 'custom'],
        defaultValue: 'sentiment',
        helperText: 'Type of analysis to perform'
      },
      customPrompt: {
        label: 'Custom Analysis Prompt',
        type: 'textarea',
        placeholder: 'Analyze the following text for...',
        helperText: 'Custom prompt for analysis (used when type is "custom")'
      },
      simulatedOutput: {
        label: 'Simulated Output (JSON)',
        type: 'json',
        placeholder: '{"analysis": "positive sentiment", "score": 0.8}',
        helperText: 'Mock analysis result for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['analysis', 'metadata', 'error'],
    aiExplanation: 'Performs various text analysis tasks including sentiment analysis, entity extraction, topic identification using GROQ API with Llama models.'
  },
  {
    type: 'groqDocumentSummary',
    name: 'GROQ: Document Summary',
    icon: FileText,
    description: 'Summarizes long documents using GROQ API with Llama models',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'llama-3.1-70b-versatile',
      document: '{{input.document}}',
      summaryType: 'concise',
      keyPoints: true,
      maxLength: 500,
      simulatedOutput: '{"summary": "This document discusses...", "key_points": ["Point 1", "Point 2"]}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultValue: 'llama-3.1-70b-versatile',
        required: true
      },
      document: {
        label: 'Document Content',
        type: 'textarea',
        placeholder: '{{input.document}}',
        required: true
      },
      summaryType: {
        label: 'Summary Type',
        type: 'select',
        options: ['concise', 'detailed', 'bullet_points', 'executive'],
        defaultValue: 'concise',
        helperText: 'Style of summary to generate'
      },
      keyPoints: {
        label: 'Extract Key Points',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Whether to extract key points separately'
      },
      maxLength: {
        label: 'Max Summary Length (words)',
        type: 'number',
        defaultValue: 500,
        placeholder: '500'
      },
      simulatedOutput: {
        label: 'Simulated Output (JSON)',
        type: 'json',
        placeholder: '{"summary": "Document summary", "key_points": ["Point 1"]}',
        helperText: 'Mock summary result for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['summary', 'keyPoints', 'metadata', 'error'],
    aiExplanation: 'Generates comprehensive summaries of long documents using GROQ API with Llama models and different summary styles.'
  },
  {
    type: 'groqTranslation',
    name: 'GROQ: Translation',
    icon: Languages,
    description: 'Translates text between languages using GROQ API with Llama models',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'llama-3.1-70b-versatile',
      text: '{{input.text}}',
      sourceLanguage: 'auto',
      targetLanguage: 'english',
      context: '',
      preserveFormatting: true,
      simulatedOutput: '{"translated_text": "Hello, how are you?", "detected_language": "spanish"}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultValue: 'llama-3.1-70b-versatile',
        required: true
      },
      text: {
        label: 'Text to Translate',
        type: 'textarea',
        placeholder: '{{input.text}}',
        required: true
      },
      sourceLanguage: {
        label: 'Source Language',
        type: 'select',
        options: ['auto', 'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'chinese', 'japanese', 'korean', 'arabic'],
        defaultValue: 'auto',
        helperText: 'Source language (auto-detect if "auto")'
      },
      targetLanguage: {
        label: 'Target Language',
        type: 'select',
        options: ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'chinese', 'japanese', 'korean', 'arabic'],
        defaultValue: 'english',
        required: true
      },
      context: {
        label: 'Context',
        type: 'textarea',
        placeholder: 'Additional context for better translation',
        helperText: 'Optional context to improve translation quality'
      },
      preserveFormatting: {
        label: 'Preserve Formatting',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Maintain original text formatting'
      },
      simulatedOutput: {
        label: 'Simulated Output (JSON)',
        type: 'json',
        placeholder: '{"translated_text": "Translated text", "detected_language": "detected"}',
        helperText: 'Mock translation result for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['translatedText', 'detectedLanguage', 'error'],
    aiExplanation: 'Provides high-quality translations with context awareness using GROQ API with Llama models. Supports auto-detection and formatting preservation.'
  },
  {
    type: 'groqReasoningTask',
    name: 'GROQ: Advanced Reasoning',
    icon: Brain,
    description: 'Performs complex reasoning tasks using GROQ API with Llama models',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'llama-3.1-70b-versatile',
      problem: '{{input.problem}}',
      reasoningType: 'logical',
      stepByStep: true,
      showWorkings: true,
      simulatedOutput: '{"solution": "The answer is...", "reasoning_steps": ["Step 1", "Step 2"], "confidence": 0.9}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
        defaultValue: 'llama-3.1-70b-versatile',
        required: true,
        helperText: 'Llama 3.1 70B recommended for complex reasoning'
      },
      problem: {
        label: 'Problem/Question',
        type: 'textarea',
        placeholder: '{{input.problem}}',
        required: true
      },
      reasoningType: {
        label: 'Reasoning Type',
        type: 'select',
        options: ['logical', 'mathematical', 'analytical', 'creative', 'strategic'],
        defaultValue: 'logical',
        helperText: 'Type of reasoning to apply'
      },
      stepByStep: {
        label: 'Step-by-Step Solution',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Break down the solution into steps'
      },
      showWorkings: {
        label: 'Show Workings',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Include detailed workings and explanations'
      },
      simulatedOutput: {
        label: 'Simulated Output (JSON)',
        type: 'json',
        placeholder: '{"solution": "Answer", "reasoning_steps": ["Step 1"], "confidence": 0.9}',
        helperText: 'Mock reasoning result for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['solution', 'reasoningSteps', 'confidence', 'error'],
    aiExplanation: 'Leverages GROQ API with Llama models for advanced reasoning capabilities and complex problem-solving with fast inference.'
  }
];

// Export for use in main nodes configuration
export default GROQ_AI_INTEGRATIONS;