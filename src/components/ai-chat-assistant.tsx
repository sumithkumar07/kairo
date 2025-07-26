'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2,
  Workflow,
  Brain,
  Zap,
  Settings,
  Magic
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

interface AIActionsProps {
  onWorkflowGenerate: (description: string) => void;
  onGodTierActivate: (feature: string) => void;
  onIntegrationSetup: (service: string) => void;
}

export function AIFloatingAssistant({ 
  onWorkflowGenerate, 
  onGodTierActivate, 
  onIntegrationSetup 
}: AIActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your Kairo AI Assistant. I can help you:\n\n• Generate workflows from natural language\n• Activate God-tier features\n• Set up integrations\n• Analyze your automation performance\n\nWhat would you like to create today?',
      timestamp: new Date(),
      actions: [
        { label: 'Create Workflow', action: 'workflow_create' },
        { label: 'God-Tier Features', action: 'godtier_view' },
        { label: 'Browse Integrations', action: 'integrations_browse' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = getAIResponse(input);
      setMessages(prev => [...prev, responses]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('workflow') || lowerInput.includes('automation')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I'll help you create a workflow! Based on your request "${userInput}", I can generate an intelligent automation.\n\nWould you like me to:\n• Create this workflow using AI\n• Show you similar templates\n• Set up required integrations`,
        timestamp: new Date(),
        actions: [
          { label: 'Generate Workflow', action: 'workflow_create', data: userInput },
          { label: 'View Templates', action: 'templates_view' },
          { label: 'Setup Integrations', action: 'integrations_setup' }
        ]
      };
    }
    
    if (lowerInput.includes('god-tier') || lowerInput.includes('quantum') || lowerInput.includes('reality')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `You're interested in our God-tier features! These include:\n\n🔮 Quantum Simulation (99.1% accuracy)\n🌐 Reality Fabricator (IoT control)\n🧠 Global Consciousness Feed\n⚕️ HIPAA Compliance Pack\n\nWhich feature would you like to explore?`,
        timestamp: new Date(),
        actions: [
          { label: 'Quantum Simulation', action: 'godtier_activate', data: 'quantum' },
          { label: 'Reality Fabricator', action: 'godtier_activate', data: 'reality' },
          { label: 'Consciousness Feed', action: 'godtier_activate', data: 'consciousness' }
        ]
      };
    }
    
    if (lowerInput.includes('integration') || lowerInput.includes('connect')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I can help you connect with 100+ services! Popular integrations include:\n\n• Salesforce, HubSpot (CRM)\n• Slack, Teams (Communication)\n• AWS, Azure (Cloud)\n• Shopify, Stripe (E-commerce)\n\nWhat service would you like to integrate?`,
        timestamp: new Date(),
        actions: [
          { label: 'Browse All', action: 'integrations_browse' },
          { label: 'Setup Salesforce', action: 'integration_setup', data: 'salesforce' },
          { label: 'Setup Slack', action: 'integration_setup', data: 'slack' }
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I understand you're asking about "${userInput}". I can help you with:\n\n• Creating intelligent workflows\n• Activating advanced AI features\n• Setting up integrations\n• Monitoring your automations\n\nWhat specific task would you like assistance with?`,
      timestamp: new Date(),
      actions: [
        { label: 'Create Workflow', action: 'workflow_create' },
        { label: 'View Analytics', action: 'analytics_view' },
        { label: 'System Status', action: 'monitoring_view' }
      ]
    };
  };

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'workflow_create':
        onWorkflowGenerate(data || 'Create a new workflow');
        break;
      case 'godtier_activate':
        onGodTierActivate(data || 'quantum');
        break;
      case 'integration_setup':
      case 'integrations_browse':
        onIntegrationSetup(data || 'general');
        break;
      default:
        console.log('Action:', action, data);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
        <div className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Assistant
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "w-96 shadow-2xl border-2 transition-all duration-300",
        isMinimized ? "h-16" : "h-[600px]"
      )}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">Kairo AI Assistant</CardTitle>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[536px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3 text-sm",
                      message.type === 'user' 
                        ? "bg-primary text-primary-foreground ml-auto" 
                        : "bg-muted"
                    )}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.actions && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(action.action, action.data)}
                              className="text-xs h-7"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about workflows, AI features, integrations..."
                  className="min-h-[44px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Powered by Kairo AI • Press Enter to send</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}