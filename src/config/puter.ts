import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Brain, MessageSquare, FileText, Code, Search, Wand2, BookOpen, Languages, Cpu } from 'lucide-react';

// Puter.js AI Integration Nodes using meta-llama/llama-4-maverick
export const PUTER_AI_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'puterChatCompletion',
    name: 'Puter.js: Chat Completion',
    icon: Bot,
    description: 'Generates text completions using Puter.js meta-llama/llama-4-maverick with unlimited usage',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'meta-llama/llama-4-maverick',
      messages: '[{"role": "user", "content": "{{input.prompt}}"}]',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 1.0,
      simulatedOutput: 'This is a simulated Puter.js response using meta-llama/llama-4-maverick with unlimited usage.'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: [
          'meta-llama/llama-4-maverick',
          'meta-llama/llama-3.3-70b',
          'meta-llama/llama-3.2-90b',
          'meta-llama/llama-3.1-405b'
        ],
        defaultValue: 'meta-llama/llama-4-maverick',
        required: true,
        helperText: 'Select the Meta Llama model to use via Puter.js'
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
        placeholder: 'This is a simulated Puter.js response.',
        helperText: 'Mock response for simulation mode'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'usage', 'error'],
    aiExplanation: 'Uses Puter.js with meta-llama/llama-4-maverick for unlimited text generation. No API keys required - provides scalable AI capabilities directly through your browser.'
  },
  {
    type: 'puterCodeGeneration',
    name: 'Puter.js: Code Generation',
    icon: Code,
    description: 'Generates code using Puter.js meta-llama/llama-4-maverick optimized for programming tasks',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'meta-llama/llama-4-maverick',
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
        options: ['meta-llama/llama-4-maverick', 'meta-llama/llama-3.3-70b'],
        defaultValue: 'meta-llama/llama-4-maverick',
        required: true,
        helperText: 'Meta Llama 4 Maverick is optimized for code generation'
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
    aiExplanation: 'Specialized for code generation using Puter.js meta-llama/llama-4-maverick. Supports multiple programming languages with unlimited usage and no API keys required.'
  },
  {
    type: 'puterTextAnalysis',
    name: 'Puter.js: Text Analysis',
    icon: Search,
    description: 'Analyzes text for sentiment, entities, key topics using Puter.js meta-llama/llama-4-maverick',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'meta-llama/llama-4-maverick',
      text: '{{input.text}}',
      analysisType: 'sentiment',
      customPrompt: '',
      simulatedOutput: '{"sentiment": "positive", "confidence": 0.85, "key_topics": ["technology", "innovation"]}'
    },
    configSchema: {
      model: {
        label: 'Model',
        type: 'select',
        options: ['meta-llama/llama-4-maverick', 'meta-llama/llama-3.3-70b'],
        defaultValue: 'meta-llama/llama-4-maverick',
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
    aiExplanation: 'Performs various text analysis tasks including sentiment analysis, entity extraction, topic identification using Puter.js meta-llama/llama-4-maverick with unlimited usage.'
  },
  {
    type: 'puterDocumentSummary',
    name: 'Puter.js: Document Summary',
    icon: FileText,
    description: 'Summarizes long documents using Puter.js meta-llama/llama-4-maverick with unlimited usage',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'meta-llama/llama-4-maverick',
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
        options: ['meta-llama/llama-4-maverick', 'meta-llama/llama-3.3-70b'],
        defaultValue: 'meta-llama/llama-4-maverick',
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
    aiExplanation: 'Generates comprehensive summaries of long documents using Puter.js meta-llama/llama-4-maverick with unlimited usage and different summary styles.'
  },
  {
    type: 'puterTranslation',
    name: 'Puter.js: Translation',
    icon: Languages,
    description: 'Translates text between languages using Puter.js meta-llama/llama-4-maverick',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'meta-llama/llama-4-maverick',
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
        options: ['meta-llama/llama-4-maverick', 'meta-llama/llama-3.3-70b'],
        defaultValue: 'meta-llama/llama-4-maverick',
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
    aiExplanation: 'Provides high-quality translations with context awareness using Puter.js meta-llama/llama-4-maverick with unlimited usage. Supports auto-detection and formatting preservation.'
  },
  {
    type: 'puterReasoningTask',
    name: 'Puter.js: Advanced Reasoning',
    icon: Brain,
    description: 'Performs complex reasoning tasks using Puter.js meta-llama/llama-4-maverick with unlimited usage',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      model: 'meta-llama/llama-4-maverick',
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
        options: ['meta-llama/llama-4-maverick', 'meta-llama/llama-3.3-70b'],
        defaultValue: 'meta-llama/llama-4-maverick',
        required: true,
        helperText: 'Meta Llama 4 Maverick recommended for complex reasoning'
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
    aiExplanation: 'Leverages Puter.js meta-llama/llama-4-maverick advanced reasoning capabilities for complex problem-solving with unlimited usage. No API keys required.'
  }
];

// Export for use in main nodes configuration
export default PUTER_AI_INTEGRATIONS;