export interface TextAnalysisResult {
  keywords: string[];
  entities: {
    systems: string[];
    dates: string[];
    issues: string[];
    features: string[];
  };
  sentiment: number;
  category: string;
  urgencyIndicators: string[];
  categoryScores: Record<string, number>;
}

export function analyzeTicketContent(title: string, description: string): TextAnalysisResult {
  const fullText = `${title} ${description}`.toLowerCase();

  // Extract keywords based on property management domain
  const keywords = extractKeywords(fullText);

  // Extract entities
  const entities = extractEntities(fullText);

  // Analyze sentiment
  const sentiment = analyzeSentiment(fullText);

  // Detect category with scoring
  const categoryScores = detectCategoryScores(fullText, keywords);
  const category = Object.entries(categoryScores).sort(([, a], [, b]) => b - a)[0][0];

  // Find urgency indicators
  const urgencyIndicators = findUrgencyPatterns(fullText);

  return {
    keywords,
    entities,
    sentiment,
    category,
    urgencyIndicators,
    categoryScores,
  };
}

function extractKeywords(text: string): string[] {
  // Property management specific keywords
  const domainKeywords = {
    technical: [
      'calendar',
      'sync',
      'api',
      'integration',
      'error',
      'broken',
      'bug',
      'password',
      'login',
      'ical',
      'smart lock',
      'lock',
      'code',
      'wifi',
      'connection',
    ],
    billing: [
      'payment',
      'refund',
      'payout',
      'charge',
      'fee',
      'commission',
      'tax',
      'invoice',
      'deposit',
      'money',
      'price',
      'cost',
    ],
    product: [
      'feature',
      'how to',
      'guide',
      'setup',
      'pricing',
      'listing',
      'property',
      'amenity',
      'rules',
      'policy',
      'availability',
    ],
    issues: [
      'not working',
      'broken',
      'failed',
      'cant',
      'wont',
      'problem',
      'issue',
      'error',
      'help',
      'urgent',
      'asap',
    ],
  };

  const foundKeywords: string[] = [];

  // Check for multi-word keywords first
  const multiWordKeywords = ['smart lock', 'how to', 'not working'];
  multiWordKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  });

  // Check single word keywords
  Object.values(domainKeywords)
    .flat()
    .forEach((keyword) => {
      if (!keyword.includes(' ') && text.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

  // Extract additional keywords (3+ characters, not common words)
  const commonWords = new Set([
    'the',
    'and',
    'but',
    'for',
    'with',
    'this',
    'that',
    'have',
    'has',
    'had',
    'can',
    'cant',
    'wont',
    'from',
    'been',
  ]);
  const words = text
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .filter((word) => !foundKeywords.includes(word));

  return [...new Set([...foundKeywords, ...words.slice(0, 5)])];
}

function extractEntities(text: string): TextAnalysisResult['entities'] {
  const entities = {
    systems: [] as string[],
    dates: [] as string[],
    issues: [] as string[],
    features: [] as string[],
  };

  // Systems
  const systems = [
    'airbnb',
    'vrbo',
    'booking.com',
    'ical',
    'calendar',
    'pms',
    'property management system',
    'smart lock',
    'august',
    'yale',
  ];
  systems.forEach((system) => {
    if (text.includes(system)) {
      entities.systems.push(system);
    }
  });

  // Date patterns
  const datePatterns = [
    /\d+\s*(days?|hours?|minutes?|weeks?)\s*ago/g,
    /yesterday|today|tomorrow/g,
    /last\s*(week|month|year)/g,
  ];
  datePatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      entities.dates.push(...matches);
    }
  });

  // Common issues
  const issuePatterns = [
    'not working',
    'broken',
    'stopped working',
    'error',
    'failed',
    'cant access',
    'wont sync',
  ];
  issuePatterns.forEach((issue) => {
    if (text.includes(issue)) {
      entities.issues.push(issue);
    }
  });

  // Features
  const features = [
    'calendar sync',
    'pricing',
    'refund',
    'payout',
    'booking',
    'guest',
    'host',
    'listing',
  ];
  features.forEach((feature) => {
    if (text.includes(feature)) {
      entities.features.push(feature);
    }
  });

  return entities;
}

function analyzeSentiment(text: string): number {
  // Simple sentiment analysis (-1 to 1)
  const negativeWords = [
    'broken',
    'not working',
    'failed',
    'error',
    'cant',
    'wont',
    'problem',
    'issue',
    'urgent',
    'frustrated',
    'angry',
    'terrible',
    'worst',
    'never',
  ];
  const positiveWords = [
    'working',
    'fixed',
    'solved',
    'great',
    'excellent',
    'perfect',
    'love',
    'amazing',
    'best',
  ];

  let score = 0;
  negativeWords.forEach((word) => {
    if (text.includes(word)) score -= 0.2;
  });
  positiveWords.forEach((word) => {
    if (text.includes(word)) score += 0.2;
  });

  // Urgency modifiers
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
    score -= 0.3;
  }

  return Math.max(-1, Math.min(1, score));
}

function detectCategoryScores(text: string, keywords: string[]): Record<string, number> {
  const scores = {
    TECHNICAL: 0,
    BILLING: 0,
    PRODUCT: 0,
    GENERAL: 0,
    COMPLAINT: 0,
  };

  // Category keyword mappings with weights
  const categoryKeywords = {
    TECHNICAL: {
      strong: [
        'api',
        'integration',
        'sync',
        'calendar',
        'ical',
        'smart lock',
        'error',
        'bug',
        'broken',
      ],
      medium: ['login', 'password', 'connection', 'technical', 'system'],
      weak: ['not working', 'issue', 'problem'],
    },
    BILLING: {
      strong: ['payment', 'refund', 'payout', 'charge', 'money', 'tax', 'invoice'],
      medium: ['fee', 'commission', 'price', 'cost', 'deposit'],
      weak: ['billing', 'financial'],
    },
    PRODUCT: {
      strong: ['how to', 'guide', 'feature', 'setup', 'tutorial'],
      medium: ['listing', 'property', 'availability', 'amenity'],
      weak: ['help', 'question', 'new'],
    },
    COMPLAINT: {
      strong: ['complaint', 'terrible', 'worst', 'unacceptable', 'fraud'],
      medium: ['angry', 'frustrated', 'disappointed', 'upset'],
      weak: ['issue', 'problem'],
    },
  };

  // Calculate scores
  Object.entries(categoryKeywords).forEach(([category, keywordGroups]) => {
    keywordGroups.strong.forEach((keyword) => {
      if (text.includes(keyword) || keywords.includes(keyword)) {
        scores[category] += 0.3;
      }
    });
    keywordGroups.medium.forEach((keyword) => {
      if (text.includes(keyword) || keywords.includes(keyword)) {
        scores[category] += 0.2;
      }
    });
    keywordGroups.weak.forEach((keyword) => {
      if (text.includes(keyword) || keywords.includes(keyword)) {
        scores[category] += 0.1;
      }
    });
  });

  // Normalize scores
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    Object.keys(scores).forEach((key) => {
      scores[key] = scores[key] / maxScore;
    });
  } else {
    scores.GENERAL = 1.0; // Default to general if no matches
  }

  return scores;
}

function findUrgencyPatterns(text: string): string[] {
  const urgencyIndicators: string[] = [];

  const patterns = [
    { pattern: /urgent|asap|immediately/i, indicator: 'Explicit urgency request' },
    { pattern: /\d+\s*days?\s*ago/i, indicator: 'Time elapsed indicator' },
    { pattern: /losing money|revenue loss|costing/i, indicator: 'Financial impact' },
    { pattern: /double booking|overbooked/i, indicator: 'Booking conflict' },
    {
      pattern: /guest arriving|check.?in today|arriving soon/i,
      indicator: 'Imminent guest arrival',
    },
    {
      pattern: /multiple properties|all my properties/i,
      indicator: 'Multiple properties affected',
    },
  ];

  patterns.forEach(({ pattern, indicator }) => {
    if (pattern.test(text)) {
      urgencyIndicators.push(indicator);
    }
  });

  return urgencyIndicators;
}
