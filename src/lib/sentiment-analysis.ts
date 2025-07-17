'use server';

import { generateText } from 'ai';

export interface SentimentResult {
  score: number; // -1 to 1, where -1 is most negative, 1 is most positive
  confidence: number; // 0 to 1
  label: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  escalationRequired: boolean;
  reasoning: string;
}

export interface SentimentAnalysisConfig {
  escalationThreshold: number; // Default: -0.3
  confidenceThreshold: number; // Default: 0.7
  enabled: boolean;
  autoEscalate: boolean;
}

const DEFAULT_CONFIG: SentimentAnalysisConfig = {
  escalationThreshold: -0.3,
  confidenceThreshold: 0.7,
  enabled: true,
  autoEscalate: true,
};

/**
 * Analyzes text for sentiment using AI model
 */
export async function analyzeSentiment(
  text: string,
  config: SentimentAnalysisConfig = DEFAULT_CONFIG
): Promise<SentimentResult> {
  if (!config.enabled) {
    return {
      score: 0,
      confidence: 0,
      label: 'neutral',
      keywords: [],
      escalationRequired: false,
      reasoning: 'Sentiment analysis is disabled',
    };
  }

  try {
    // Use AI model to analyze sentiment
    const analysisPrompt = `
    Analyze the sentiment of the following text and provide a detailed assessment:

    Text: "${text}"

    Please provide your analysis in the following JSON format:
    {
      "score": [number between -1 and 1],
      "confidence": [number between 0 and 1],
      "label": ["positive", "negative", or "neutral"],
      "keywords": [array of relevant keywords that influenced the sentiment],
      "reasoning": "Brief explanation of the sentiment analysis"
    }

    Guidelines:
    - Score: -1 = very negative, 0 = neutral, 1 = very positive
    - Confidence: How certain you are about the analysis (0-1)
    - Keywords: Extract 3-5 key words/phrases that influenced the sentiment
    - Reasoning: 1-2 sentence explanation of why you scored it this way

    Focus on emotional tone, intent, and context. Consider:
    - Explicit positive/negative words
    - Implied frustration or satisfaction
    - Urgency or escalation indicators
    - Professional vs emotional language
    `;

    const { text: analysisResult } = await generateText({
      model: 'gpt-3.5-turbo',
      prompt: analysisPrompt,
      maxTokens: 300,
    });

    // Parse the AI response
    const cleanedResult = analysisResult.replace(/```json\n?/, '').replace(/```\n?/, '');
    const parsed = JSON.parse(cleanedResult);

    const result: SentimentResult = {
      score: Math.max(-1, Math.min(1, parsed.score || 0)),
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      label: parsed.label || 'neutral',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      reasoning: parsed.reasoning || 'No reasoning provided',
      escalationRequired: false,
    };

    // Determine if escalation is required
    result.escalationRequired = config.autoEscalate && 
      result.score < config.escalationThreshold && 
      result.confidence > config.confidenceThreshold;

    return result;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    // Fallback to simple keyword-based analysis
    return performSimpleSentimentAnalysis(text, config);
  }
}

/**
 * Fallback sentiment analysis using simple keyword matching
 */
function performSimpleSentimentAnalysis(
  text: string,
  config: SentimentAnalysisConfig
): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Define keyword lists
  const positiveKeywords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'perfect', 'love', 'like', 'happy', 'satisfied', 'pleased',
    'thank', 'appreciate', 'helpful', 'useful', 'efficient',
    'quick', 'fast', 'easy', 'smooth', 'working', 'success'
  ];

  const negativeKeywords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike',
    'frustrated', 'angry', 'upset', 'disappointed', 'confused',
    'broken', 'error', 'problem', 'issue', 'bug', 'wrong',
    'failed', 'failure', 'slow', 'difficult', 'hard', 'impossible',
    'urgent', 'critical', 'emergency', 'complaint', 'dispute'
  ];

  const escalationKeywords = [
    'urgent', 'critical', 'emergency', 'complaint', 'dispute',
    'frustrated', 'angry', 'unacceptable', 'demand', 'refund',
    'cancel', 'lawsuit', 'legal', 'report', 'escalate'
  ];

  // Count matches
  let positiveScore = 0;
  let negativeScore = 0;
  let escalationScore = 0;
  const foundKeywords: string[] = [];

  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveScore++;
      foundKeywords.push(keyword);
    }
  });

  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeScore++;
      foundKeywords.push(keyword);
    }
  });

  escalationKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      escalationScore++;
      foundKeywords.push(keyword);
    }
  });

  // Calculate score
  const totalScore = positiveScore - negativeScore;
  const maxScore = Math.max(positiveScore, negativeScore, 1);
  const normalizedScore = totalScore / maxScore;

  // Determine label
  let label: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (normalizedScore > 0.2) label = 'positive';
  else if (normalizedScore < -0.2) label = 'negative';

  // Calculate confidence based on keyword matches
  const totalKeywords = positiveScore + negativeScore + escalationScore;
  const confidence = Math.min(totalKeywords / 10, 0.8); // Max 80% confidence for simple analysis

  const result: SentimentResult = {
    score: normalizedScore,
    confidence,
    label,
    keywords: foundKeywords.slice(0, 5), // Return top 5 keywords
    reasoning: `Simple keyword analysis: ${positiveScore} positive, ${negativeScore} negative, ${escalationScore} escalation keywords found.`,
    escalationRequired: false,
  };

  // Check for escalation
  result.escalationRequired = config.autoEscalate && 
    (escalationScore > 0 || (result.score < config.escalationThreshold && confidence > config.confidenceThreshold));

  return result;
}

/**
 * Batch analyze multiple texts for sentiment
 */
export async function batchAnalyzeSentiment(
  texts: string[],
  config: SentimentAnalysisConfig = DEFAULT_CONFIG
): Promise<SentimentResult[]> {
  const results: SentimentResult[] = [];
  
  for (const text of texts) {
    const result = await analyzeSentiment(text, config);
    results.push(result);
  }
  
  return results;
}

/**
 * Check if text contains escalation triggers
 */
export function detectEscalationTriggers(text: string): {
  hasEscalationTriggers: boolean;
  triggers: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const lowerText = text.toLowerCase();
  const triggers: string[] = [];
  
  const escalationPatterns = [
    { pattern: /urgent|emergency|critical|asap|immediately/i, severity: 'high', keyword: 'urgency' },
    { pattern: /angry|frustrated|upset|furious|livid/i, severity: 'medium', keyword: 'emotion' },
    { pattern: /complaint|dispute|unacceptable|demand/i, severity: 'high', keyword: 'complaint' },
    { pattern: /refund|cancel|lawsuit|legal|report/i, severity: 'critical', keyword: 'escalation' },
    { pattern: /manager|supervisor|escalate|speak to someone/i, severity: 'medium', keyword: 'escalation_request' },
    { pattern: /broken|failed|not working|error|bug/i, severity: 'low', keyword: 'technical_issue' },
  ];

  let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  escalationPatterns.forEach(({ pattern, severity, keyword }) => {
    if (pattern.test(lowerText)) {
      triggers.push(keyword);
      
      // Update max severity
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      if (severityLevels[severity] > severityLevels[maxSeverity]) {
        maxSeverity = severity;
      }
    }
  });

  return {
    hasEscalationTriggers: triggers.length > 0,
    triggers,
    severity: maxSeverity,
  };
}

/**
 * Generate sentiment analysis report
 */
export function generateSentimentReport(results: SentimentResult[]): {
  totalAnalyzed: number;
  averageScore: number;
  averageConfidence: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  escalationRate: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  recommendations: string[];
} {
  if (results.length === 0) {
    return {
      totalAnalyzed: 0,
      averageScore: 0,
      averageConfidence: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      escalationRate: 0,
      topKeywords: [],
      recommendations: [],
    };
  }

  const totalAnalyzed = results.length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalAnalyzed;
  const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalAnalyzed;

  const sentimentDistribution = {
    positive: results.filter(r => r.label === 'positive').length,
    negative: results.filter(r => r.label === 'negative').length,
    neutral: results.filter(r => r.label === 'neutral').length,
  };

  const escalationRate = results.filter(r => r.escalationRequired).length / totalAnalyzed;

  // Count keywords
  const keywordCounts: Record<string, number> = {};
  results.forEach(r => {
    r.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageScore < -0.2) {
    recommendations.push('Overall sentiment is negative. Consider improving user experience.');
  }
  
  if (escalationRate > 0.1) {
    recommendations.push('High escalation rate detected. Review escalation triggers and response processes.');
  }
  
  if (averageConfidence < 0.5) {
    recommendations.push('Low confidence in sentiment analysis. Consider improving training data or model parameters.');
  }
  
  if (sentimentDistribution.negative > sentimentDistribution.positive) {
    recommendations.push('More negative than positive sentiment. Focus on addressing common issues.');
  }

  return {
    totalAnalyzed,
    averageScore,
    averageConfidence,
    sentimentDistribution,
    escalationRate,
    topKeywords,
    recommendations,
  };
}