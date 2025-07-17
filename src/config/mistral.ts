import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Brain, MessageSquare, FileText, Code, Search, Wand2, BookOpen, Languages, Cpu } from 'lucide-react';

// Mistral AI Integration Nodes
export const MISTRAL_AI_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'mistralChatCompletion',
    name: 'Mistral AI: Chat Completion',
    icon: Bot,
    description: 'Generates text completions using Mistral AI models with advanced reasoning capabilities',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'mistral-large-latest',
      messages: '[{"role": "user", "content": "{{input.prompt}}"}]',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 1.0,
      apiKey: '{{credential.MistralApiKey}}',
      simulatedOutput: 'This is a simulated Mistral AI response with advanced reasoning capabilities.'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: [
          'mistral-large-latest',
          'mistral-small-latest',
          'mistral-medium-latest',
          'codestral-latest',
          'ministral-8b-latest',
          'ministral-3b-latest'
        ],
        defaultValue: 'mistral-large-latest',
        required: true,
        helperText: 'Select the Mistral AI model to use'
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
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MistralApiKey}}',
        helperText: 'Mistral AI API key from environment or credentials',
        required: true
      },
      simulatedOutput: {
        label: 'Simulated Output (String)',
        type: 'string',
        placeholder: 'This is a simulated Mistral AI response.',
        helperText: 'Mock response for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'usage', 'error'],
    aiExplanation: 'Uses Mistral AI models for text generation with advanced reasoning. Supports various models including Mistral Large for complex tasks, Codestral for code generation, and Ministral for efficient processing.'
  },
  {
    type: 'mistralCodeGeneration',
    name: 'Mistral AI: Code Generation',
    icon: Code,
    description: 'Generates code using Mistral\'s Codestral model optimized for programming tasks',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'codestral-latest',
      prompt: '{{input.codePrompt}}',
      language: 'javascript',
      context: '',
      maxTokens: 2000,
      temperature: 0.1,
      apiKey: '{{credential.MistralApiKey}}',
      simulatedOutput: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['codestral-latest', 'mistral-large-latest'],
        defaultValue: 'codestral-latest',
        required: true,
        helperText: 'Codestral is optimized for code generation'
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
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MistralApiKey}}',
        required: true
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
    aiExplanation: 'Specialized for code generation using Codestral, Mistral\'s model trained specifically for programming tasks. Supports multiple programming languages and provides code explanations.'
  },
  {
    type: 'mistralTextAnalysis',
    name: 'Mistral AI: Text Analysis',
    icon: Search,
    description: 'Analyzes text for sentiment, entities, key topics, and other insights using Mistral AI',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'mistral-large-latest',
      text: '{{input.text}}',
      analysisType: 'sentiment',
      customPrompt: '',
      apiKey: '{{credential.MistralApiKey}}',
      simulatedOutput: '{"sentiment": "positive", "confidence": 0.85, "key_topics": ["technology", "innovation"]}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['mistral-large-latest', 'mistral-small-latest'],
        defaultValue: 'mistral-large-latest',
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
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MistralApiKey}}',
        required: true
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
    aiExplanation: 'Performs various text analysis tasks including sentiment analysis, entity extraction, topic identification, and custom analysis using Mistral AI\'s advanced language understanding.'
  },
  {
    type: 'mistralDocumentSummary',
    name: 'Mistral AI: Document Summary',
    icon: FileText,
    description: 'Summarizes long documents and extracts key information using Mistral AI',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'mistral-large-latest',
      document: '{{input.document}}',
      summaryType: 'concise',
      keyPoints: true,
      maxLength: 500,
      apiKey: '{{credential.MistralApiKey}}',
      simulatedOutput: '{"summary": "This document discusses...", "key_points": ["Point 1", "Point 2"]}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['mistral-large-latest', 'mistral-medium-latest'],
        defaultValue: 'mistral-large-latest',
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
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MistralApiKey}}',
        required: true
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
    aiExplanation: 'Generates comprehensive summaries of long documents with different styles and extracts key points using Mistral AI\'s advanced text understanding capabilities.'
  },
  {
    type: 'mistralTranslation',
    name: 'Mistral AI: Translation',
    icon: Languages,
    description: 'Translates text between languages using Mistral AI with context awareness',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'mistral-large-latest',
      text: '{{input.text}}',
      sourceLanguage: 'auto',
      targetLanguage: 'english',
      context: '',
      preserveFormatting: true,
      apiKey: '{{credential.MistralApiKey}}',
      simulatedOutput: '{"translated_text": "Hello, how are you?", "detected_language": "spanish"}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['mistral-large-latest', 'mistral-medium-latest'],
        defaultValue: 'mistral-large-latest',
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
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MistralApiKey}}',
        required: true
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
    aiExplanation: 'Provides high-quality translations with context awareness using Mistral AI. Supports auto-detection of source language and maintains formatting when requested.'
  },
  {
    type: 'mistralReasoningTask',
    name: 'Mistral AI: Advanced Reasoning',
    icon: Brain,
    description: 'Performs complex reasoning tasks including logical deduction, mathematical problem solving, and multi-step analysis',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'mistral-large-latest',
      problem: '{{input.problem}}',
      reasoningType: 'logical',
      stepByStep: true,
      showWorkings: true,
      apiKey: '{{credential.MistralApiKey}}',
      simulatedOutput: '{"solution": "The answer is...", "reasoning_steps": ["Step 1", "Step 2"], "confidence": 0.9}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['mistral-large-latest', 'mistral-medium-latest'],
        defaultValue: 'mistral-large-latest',
        required: true,
        helperText: 'Mistral Large recommended for complex reasoning'
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
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MistralApiKey}}',
        required: true
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
    aiExplanation: 'Leverages Mistral AI\'s advanced reasoning capabilities for complex problem-solving, logical deduction, mathematical calculations, and multi-step analysis with detailed explanations.'
  }
];

// Export for use in main nodes configuration
export default MISTRAL_AI_INTEGRATIONS;