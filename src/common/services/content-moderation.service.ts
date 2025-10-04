import { Injectable } from '@nestjs/common';

interface ModerationResult {
  isAppropriate: boolean;
  flaggedWords: string[];
  severity: 'low' | 'medium' | 'high';
  reason?: string;
}

@Injectable()
export class ContentModerationService {
  private readonly badWords = [
    // Add your bad words list here
    'spam', 'hate', 'violence', 'inappropriate',
    // This is a simplified list - you'd want to use a proper moderation service
  ];

  private readonly contextualWords = [
    'exam', 'test', 'study', 'homework', 'assignment',
    'lesson', 'course', 'education', 'learn', 'teach',
  ];

  moderateContent(content: string): ModerationResult {
    const lowercaseContent = content.toLowerCase();
    const flaggedWords: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Check for bad words
    for (const word of this.badWords) {
      if (lowercaseContent.includes(word)) {
        flaggedWords.push(word);
        severity = 'high';
      }
    }

    // Check for out of context words (educational context)
    const hasEducationalContext = this.contextualWords.some(word =>
      lowercaseContent.includes(word)
    );

    // Simple spam detection
    const isSpam = this.detectSpam(content);
    if (isSpam) {
      flaggedWords.push('spam-pattern');
      severity = severity === 'high' ? 'high' : 'medium';
    }

    // Check for excessive caps
    const capsRatio = this.getCapsRatio(content);
    if (capsRatio > 0.7 && content.length > 20) {
      flaggedWords.push('excessive-caps');
      severity = severity === 'high' ? 'high' : 'medium';
    }

    const isAppropriate = flaggedWords.length === 0;

    return {
      isAppropriate,
      flaggedWords,
      severity,
      reason: !isAppropriate ? this.generateReason(flaggedWords) : undefined,
    };
  }

  private detectSpam(content: string): boolean {
    // Simple spam detection rules
    const spamPatterns = [
      /(.)\1{4,}/g, // Repeated characters
      /\b(buy|sell|click|visit|free|win|prize)\b/gi,
      /https?:\/\/[^\s]+/g, // URLs
    ];

    return spamPatterns.some(pattern => pattern.test(content));
  }

  private getCapsRatio(content: string): number {
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;

    const caps = content.replace(/[^A-Z]/g, '');
    return caps.length / letters.length;
  }

  private generateReason(flaggedWords: string[]): string {
    if (flaggedWords.includes('spam-pattern')) {
      return 'Content appears to be spam';
    }
    if (flaggedWords.includes('excessive-caps')) {
      return 'Excessive use of capital letters';
    }
    if (flaggedWords.some(word => this.badWords.includes(word))) {
      return 'Content contains inappropriate language';
    }
    return 'Content flagged by moderation system';
  }

  // For AI-based moderation (you can integrate with services like AWS Comprehend, OpenAI, etc.)
  async moderateWithAI(content: string): Promise<ModerationResult> {
    // This would integrate with an AI service
    // For now, return basic moderation
    return this.moderateContent(content);
  }
}
