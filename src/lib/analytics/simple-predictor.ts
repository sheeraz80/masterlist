// Simple prediction logic without TensorFlow
// This runs on both client and server

interface ProjectFeatures {
  qualityScore: number;
  technicalComplexity: number;
  revenuePotential: number;
  categoryPopularity: number;
  competitionLevel: number;
  teamSize: number;
  activitiesCount: number;
}

interface PredictionResult {
  successProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
  factors: {
    positive: string[];
    negative: string[];
  };
}

export class SimpleProjectPredictor {
  // Simple heuristic-based prediction without ML
  predict(project: ProjectFeatures): PredictionResult {
    let score = 0;
    const positive: string[] = [];
    const negative: string[] = [];

    // Quality score impact (30% weight)
    const qualityContribution = (project.qualityScore / 10) * 0.3;
    score += qualityContribution;
    
    if (project.qualityScore >= 8) {
      positive.push('Excellent quality score');
    } else if (project.qualityScore < 5) {
      negative.push('Low quality score needs improvement');
    }

    // Revenue vs Complexity ratio (25% weight)
    const complexityRatio = project.technicalComplexity / 10;
    const revenueRatio = Math.min(project.revenuePotential / 500000, 1);
    const ratioScore = (revenueRatio / (complexityRatio + 0.1)) * 0.25;
    score += Math.min(ratioScore, 0.25);
    
    if (revenueRatio > complexityRatio * 1.5) {
      positive.push('High revenue potential relative to complexity');
    } else if (revenueRatio < complexityRatio * 0.5) {
      negative.push('Revenue may not justify complexity');
    }

    // Competition impact (15% weight)
    const competitionScore = (1 - project.competitionLevel / 4) * 0.15;
    score += competitionScore;
    
    if (project.competitionLevel < 2) {
      positive.push('Low competition in market');
    } else if (project.competitionLevel > 3) {
      negative.push('High competition may impact success');
    }

    // Team and activity (20% weight)
    const activityScore = Math.min(project.activitiesCount / 100, 1) * 0.1;
    const teamScore = Math.min(project.teamSize / 5, 1) * 0.1;
    score += activityScore + teamScore;
    
    if (project.teamSize > 3 && project.activitiesCount > 50) {
      positive.push('Strong team engagement');
    } else if (project.teamSize === 1 && project.activitiesCount < 10) {
      negative.push('Limited team activity');
    }

    // Category popularity (10% weight)
    score += project.categoryPopularity * 0.1;
    
    if (project.categoryPopularity > 0.7) {
      positive.push('Popular category with proven demand');
    } else if (project.categoryPopularity < 0.3) {
      negative.push('Niche category may limit growth');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (score > 0.7) {
      riskLevel = 'low';
    } else if (score > 0.4) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // Calculate confidence (based on data completeness)
    const dataPoints = [
      project.qualityScore,
      project.technicalComplexity,
      project.revenuePotential,
      project.competitionLevel,
      project.teamSize,
      project.activitiesCount
    ];
    const validDataPoints = dataPoints.filter(v => v !== null && v !== undefined && v > 0).length;
    const confidenceScore = validDataPoints / dataPoints.length;

    return {
      successProbability: Math.min(Math.max(score, 0), 1),
      riskLevel,
      confidenceScore,
      factors: { positive, negative }
    };
  }
}

// Anomaly Detection using statistical methods
export class SimpleAnomalyDetector {
  detectAnomalies(data: number[], threshold: number = 2): number[] {
    if (data.length < 3) return [];
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const std = Math.sqrt(variance);

    if (std === 0) return [];

    return data
      .map((value, index) => ({ value, index, zScore: Math.abs((value - mean) / std) }))
      .filter(item => item.zScore > threshold)
      .map(item => item.index);
  }

  detectTrendAnomalies(timeSeries: Array<{ date: string; value: number }>): Array<{ date: string; value: number; isAnomaly: boolean }> {
    const values = timeSeries.map(item => item.value);
    const anomalyIndices = this.detectAnomalies(values);
    
    return timeSeries.map((item, index) => ({
      ...item,
      isAnomaly: anomalyIndices.includes(index)
    }));
  }
}

// Simple sentiment analysis
export class SimpleSentimentAnalyzer {
  private positiveWords = new Set([
    'excellent', 'great', 'amazing', 'fantastic', 'love', 'perfect',
    'wonderful', 'best', 'outstanding', 'brilliant', 'superb', 'good',
    'impressive', 'remarkable', 'exceptional', 'superior', 'positive'
  ]);

  private negativeWords = new Set([
    'bad', 'terrible', 'awful', 'hate', 'worst', 'poor',
    'disappointing', 'useless', 'broken', 'fail', 'horrible',
    'negative', 'issue', 'problem', 'difficult', 'confusing'
  ]);

  analyze(text: string): { score: number; sentiment: 'positive' | 'neutral' | 'negative' } {
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.has(word)) positiveCount++;
      if (this.negativeWords.has(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) {
      return { score: 0, sentiment: 'neutral' };
    }

    const score = (positiveCount - negativeCount) / totalSentimentWords;

    return {
      score,
      sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
    };
  }
}