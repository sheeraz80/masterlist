// TensorFlow.js predictor that works on both client and server
// With ROCm support through WebGL acceleration

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

// Dynamic import for TensorFlow.js
let tf: any = null;

async function loadTensorFlow() {
  if (!tf) {
    if (typeof window === 'undefined') {
      // Server-side: use node backend (CPU)
      tf = await import('@tensorflow/tfjs-node');
    } else {
      // Client-side: use WebGL backend (can use ROCm GPU)
      tf = await import('@tensorflow/tfjs');
      // Enable WebGL backend for GPU acceleration
      await tf.setBackend('webgl');
    }
  }
  return tf;
}

export class TFJSProjectPredictor {
  private model: any = null;
  private tf: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    this.tf = await loadTensorFlow();
    
    // Create a simple neural network
    this.model = this.tf.sequential({
      layers: [
        this.tf.layers.dense({ inputShape: [7], units: 16, activation: 'relu' }),
        this.tf.layers.dropout({ rate: 0.2 }),
        this.tf.layers.dense({ units: 8, activation: 'relu' }),
        this.tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    this.initialized = true;
  }

  async predict(project: ProjectFeatures): Promise<PredictionResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    // For now, use heuristic prediction
    // In production, you would load a pre-trained model
    return this.heuristicPredict(project);
  }

  private heuristicPredict(project: ProjectFeatures): PredictionResult {
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

    return {
      successProbability: Math.min(Math.max(score, 0), 1),
      riskLevel,
      confidenceScore: 0.85,
      factors: { positive, negative }
    };
  }

  async trainOnData(historicalData: Array<ProjectFeatures & { success: boolean }>) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Prepare training data
    const features = historicalData.map(d => [
      d.qualityScore / 10,
      d.technicalComplexity / 10,
      Math.log10(d.revenuePotential + 1) / 6,
      d.categoryPopularity,
      d.competitionLevel / 4,
      Math.min(d.teamSize / 10, 1),
      Math.log10(d.activitiesCount + 1) / 3
    ]);

    const labels = historicalData.map(d => d.success ? 1 : 0);

    // Convert to tensors
    const xs = this.tf.tensor2d(features);
    const ys = this.tf.tensor2d(labels, [labels.length, 1]);

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch: number, logs: any) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}`);
          }
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }
}

// Export a singleton instance
export const tfPredictor = new TFJSProjectPredictor();