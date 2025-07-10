// TensorFlow.js imports - only load on server side when available
let tf: any;
try {
  if (typeof window === 'undefined') {
    tf = require('@tensorflow/tfjs-node');
  }
} catch (error) {
  console.log('TensorFlow not available, using fallback ML predictions');
  tf = null;
}

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

export class ProjectSuccessPredictor {
  private model: tf.LayersModel | null = null;
  private scaler = {
    mean: [0, 0, 0, 0, 0, 0, 0],
    std: [1, 1, 1, 1, 1, 1, 1]
  };

  async initialize() {
    if (!tf) {
      console.log('Using fallback prediction model');
      return;
    }
    
    // Create a simple neural network for project success prediction
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [7], units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  async trainModel(historicalData: Array<ProjectFeatures & { success: boolean }>) {
    if (!this.model) await this.initialize();

    // Prepare training data
    const features = historicalData.map(d => [
      d.qualityScore / 10,
      d.technicalComplexity / 10,
      Math.log10(d.revenuePotential + 1) / 6, // Normalize to 0-1
      d.categoryPopularity,
      d.competitionLevel / 4,
      Math.min(d.teamSize / 10, 1),
      Math.log10(d.activitiesCount + 1) / 3
    ]);

    const labels = historicalData.map(d => d.success ? 1 : 0);

    // Calculate normalization parameters
    this.calculateScaler(features);

    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features);

    // Convert to tensors
    const xs = tf.tensor2d(normalizedFeatures);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    // Train the model
    await this.model!.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
          }
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  async predict(project: ProjectFeatures): Promise<PredictionResult> {
    if (!tf || !this.model) {
      // Fallback prediction without TensorFlow
      return this.fallbackPredict(project);
    }

    // Prepare features
    const features = [[
      project.qualityScore / 10,
      project.technicalComplexity / 10,
      Math.log10(project.revenuePotential + 1) / 6,
      project.categoryPopularity,
      project.competitionLevel / 4,
      Math.min(project.teamSize / 10, 1),
      Math.log10(project.activitiesCount + 1) / 3
    ]];

    // Normalize
    const normalizedFeatures = this.normalizeFeatures(features);

    // Predict
    const prediction = await this.model.predict(tf.tensor2d(normalizedFeatures)) as tf.Tensor;
    const successProbability = (await prediction.data())[0];

    // Analyze factors
    const factors = this.analyzeFactors(project, successProbability);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (successProbability > 0.7) riskLevel = 'low';
    else if (successProbability > 0.4) riskLevel = 'medium';
    else riskLevel = 'high';

    // Calculate confidence based on feature extremity
    const confidenceScore = this.calculateConfidence(normalizedFeatures[0]);

    prediction.dispose();

    return {
      successProbability,
      riskLevel,
      confidenceScore,
      factors
    };
  }

  private calculateScaler(features: number[][]) {
    const numFeatures = features[0].length;
    
    for (let i = 0; i < numFeatures; i++) {
      const column = features.map(row => row[i]);
      this.scaler.mean[i] = column.reduce((a, b) => a + b) / column.length;
      
      const variance = column.reduce((sum, val) => 
        sum + Math.pow(val - this.scaler.mean[i], 2), 0
      ) / column.length;
      
      this.scaler.std[i] = Math.sqrt(variance) || 1;
    }
  }

  private normalizeFeatures(features: number[][]): number[][] {
    return features.map(row => 
      row.map((val, i) => (val - this.scaler.mean[i]) / this.scaler.std[i])
    );
  }

  private analyzeFactors(project: ProjectFeatures, successProb: number): { positive: string[]; negative: string[] } {
    const positive: string[] = [];
    const negative: string[] = [];

    // Quality analysis
    if (project.qualityScore >= 8) {
      positive.push('Excellent quality score');
    } else if (project.qualityScore < 5) {
      negative.push('Low quality score needs improvement');
    }

    // Complexity vs Revenue
    const complexityRatio = project.technicalComplexity / 10;
    const revenueRatio = Math.min(project.revenuePotential / 500000, 1);
    
    if (revenueRatio > complexityRatio * 1.5) {
      positive.push('High revenue potential relative to complexity');
    } else if (revenueRatio < complexityRatio * 0.5) {
      negative.push('Revenue may not justify complexity');
    }

    // Competition
    if (project.competitionLevel < 2) {
      positive.push('Low competition in market');
    } else if (project.competitionLevel > 3) {
      negative.push('High competition may impact success');
    }

    // Team engagement
    if (project.teamSize > 3 && project.activitiesCount > 50) {
      positive.push('Strong team engagement');
    } else if (project.teamSize === 1 && project.activitiesCount < 10) {
      negative.push('Limited team activity');
    }

    // Category popularity
    if (project.categoryPopularity > 0.7) {
      positive.push('Popular category with proven demand');
    } else if (project.categoryPopularity < 0.3) {
      negative.push('Niche category may limit growth');
    }

    return { positive, negative };
  }

  private fallbackPredict(project: ProjectFeatures): PredictionResult {
    // Simple rule-based prediction without TensorFlow
    let successScore = 0;

    // Quality weight: 30%
    successScore += (project.qualityScore / 10) * 0.3;

    // Revenue vs Complexity: 25%
    const complexityPenalty = project.technicalComplexity / 10;
    const revenueBonus = Math.min(project.revenuePotential / 500000, 1);
    successScore += (revenueBonus - complexityPenalty * 0.5) * 0.25;

    // Competition factor: 20%
    const competitionScore = Math.max(0, 1 - project.competitionLevel / 4);
    successScore += competitionScore * 0.2;

    // Team engagement: 15%
    const engagementScore = Math.min(project.activitiesCount / 100, 1) * Math.min(project.teamSize / 5, 1);
    successScore += engagementScore * 0.15;

    // Category popularity: 10%
    successScore += project.categoryPopularity * 0.1;

    // Normalize to 0-1
    const successProbability = Math.max(0, Math.min(1, successScore));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (successProbability > 0.7) riskLevel = 'low';
    else if (successProbability > 0.4) riskLevel = 'medium';
    else riskLevel = 'high';

    // Calculate confidence (higher for typical values)
    const confidenceScore = 0.8; // Static confidence for fallback

    // Analyze factors
    const factors = this.analyzeFactors(project, successProbability);

    return {
      successProbability,
      riskLevel,
      confidenceScore,
      factors
    };
  }

  private calculateConfidence(normalizedFeatures: number[]): number {
    // Higher confidence when features are closer to training distribution
    const distanceFromMean = normalizedFeatures.reduce((sum, val) => 
      sum + Math.abs(val), 0
    ) / normalizedFeatures.length;
    
    // Convert distance to confidence (0-1)
    return Math.max(0, Math.min(1, 1 - distanceFromMean / 3));
  }

  async saveModel(path: string) {
    if (!this.model) throw new Error('No model to save');
    await this.model.save(`file://${path}`);
  }

  async loadModel(path: string) {
    this.model = await tf.loadLayersModel(`file://${path}/model.json`);
  }
}

// Anomaly Detection using statistical methods (no external API needed)
export class AnomalyDetector {
  detectAnomalies(data: number[], threshold: number = 2): number[] {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const std = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

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

// Local sentiment analysis without external APIs
export class SentimentAnalyzer {
  private positiveWords = new Set([
    'excellent', 'great', 'amazing', 'fantastic', 'love', 'perfect',
    'wonderful', 'best', 'outstanding', 'brilliant', 'superb'
  ]);

  private negativeWords = new Set([
    'bad', 'terrible', 'awful', 'hate', 'worst', 'poor',
    'disappointing', 'useless', 'broken', 'fail', 'horrible'
  ]);

  analyze(text: string): { score: number; sentiment: 'positive' | 'neutral' | 'negative' } {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (this.positiveWords.has(word)) score += 1;
      if (this.negativeWords.has(word)) score -= 1;
    });

    const normalizedScore = Math.max(-1, Math.min(1, score / words.length));

    return {
      score: normalizedScore,
      sentiment: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral'
    };
  }
}