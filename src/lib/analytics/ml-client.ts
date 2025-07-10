/**
 * Client for connecting to the ROCm TensorFlow ML service
 * This runs the heavy ML workloads on GPU in Docker
 */

interface ProjectFeatures {
  quality_score: number;
  technical_complexity: number;
  revenue_potential: number;
  category_popularity: number;
  competition_level: number;
  team_size: number;
  activities_count: number;
}

interface PredictionResult {
  success_probability: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  gpu_accelerated: boolean;
}

export class MLServiceClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Check if ML service is healthy and GPU is available
   */
  async healthCheck(): Promise<{
    status: string;
    tensorflow_version: string;
    gpu_available: boolean;
    gpu_devices: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML service health check failed:', error);
      throw error;
    }
  }

  /**
   * Predict project success using GPU-accelerated TensorFlow
   */
  async predict(project: ProjectFeatures): Promise<PredictionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML prediction failed:', error);
      // Fallback to simple prediction if ML service is unavailable
      return this.fallbackPredict(project);
    }
  }

  /**
   * Batch predict multiple projects (more efficient with GPU)
   */
  async batchPredict(projects: ProjectFeatures[]): Promise<{
    predictions: Array<Omit<PredictionResult, 'gpu_accelerated'>>;
    gpu_accelerated: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/batch_predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projects),
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`Batch prediction failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Batch ML prediction failed:', error);
      // Fallback to simple predictions
      const predictions = projects.map(p => {
        const result = this.fallbackPredict(p);
        const { gpu_accelerated, ...prediction } = result;
        return prediction;
      });
      
      return {
        predictions,
        gpu_accelerated: false
      };
    }
  }

  /**
   * Train the model with new data
   */
  async train(features: ProjectFeatures[], labels: boolean[]): Promise<{
    status: string;
    epochs_trained: number;
    final_loss: number;
    final_accuracy: number;
    gpu_accelerated: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features, labels }),
        signal: AbortSignal.timeout(this.timeout * 2) // Longer timeout for training
      });
      
      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML training failed:', error);
      throw error;
    }
  }

  /**
   * Detect anomalies in data
   */
  async detectAnomalies(values: number[], threshold: number = 2.0): Promise<{
    anomalies: number[];
    mean: number;
    std: number;
    threshold: number;
  }> {
    try {
      const params = new URLSearchParams({
        values: values.join(','),
        threshold: threshold.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/anomaly_detection?${params}`, {
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`Anomaly detection failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      // Fallback to simple anomaly detection
      return this.fallbackAnomalyDetection(values, threshold);
    }
  }

  /**
   * Fallback prediction when ML service is unavailable
   */
  private fallbackPredict(project: ProjectFeatures): PredictionResult {
    let score = 0;
    const positive: string[] = [];
    const negative: string[] = [];

    // Simple heuristic calculation
    const qualityContribution = (project.quality_score / 10) * 0.3;
    score += qualityContribution;
    
    if (project.quality_score >= 8) {
      positive.push('Excellent quality score');
    } else if (project.quality_score < 5) {
      negative.push('Low quality score needs improvement');
    }

    const complexityRatio = project.technical_complexity / 10;
    const revenueRatio = Math.min(project.revenue_potential / 500000, 1);
    const ratioScore = (revenueRatio / (complexityRatio + 0.1)) * 0.25;
    score += Math.min(ratioScore, 0.25);
    
    if (revenueRatio > complexityRatio * 1.5) {
      positive.push('High revenue potential relative to complexity');
    } else if (revenueRatio < complexityRatio * 0.5) {
      negative.push('Revenue may not justify complexity');
    }

    const competitionScore = (1 - project.competition_level / 4) * 0.15;
    score += competitionScore;
    
    if (project.competition_level < 2) {
      positive.push('Low competition in market');
    } else if (project.competition_level > 3) {
      negative.push('High competition may impact success');
    }

    const activityScore = Math.min(project.activities_count / 100, 1) * 0.1;
    const teamScore = Math.min(project.team_size / 5, 1) * 0.1;
    score += activityScore + teamScore;
    
    if (project.team_size > 3 && project.activities_count > 50) {
      positive.push('Strong team engagement');
    } else if (project.team_size === 1 && project.activities_count < 10) {
      negative.push('Limited team activity');
    }

    score += project.category_popularity * 0.1;
    
    if (project.category_popularity > 0.7) {
      positive.push('Popular category with proven demand');
    } else if (project.category_popularity < 0.3) {
      negative.push('Niche category may limit growth');
    }

    let risk_level: 'low' | 'medium' | 'high';
    if (score > 0.7) {
      risk_level = 'low';
    } else if (score > 0.4) {
      risk_level = 'medium';
    } else {
      risk_level = 'high';
    }

    return {
      success_probability: Math.min(Math.max(score, 0), 1),
      risk_level,
      confidence_score: 0.7, // Lower confidence for fallback
      factors: { positive, negative },
      gpu_accelerated: false
    };
  }

  /**
   * Fallback anomaly detection
   */
  private fallbackAnomalyDetection(values: number[], threshold: number): {
    anomalies: number[];
    mean: number;
    std: number;
    threshold: number;
  } {
    if (values.length < 3) {
      return { anomalies: [], mean: 0, std: 0, threshold };
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    if (std === 0) {
      return { anomalies: [], mean, std, threshold };
    }

    const anomalies = values
      .map((value, index) => ({ value, index, zScore: Math.abs((value - mean) / std) }))
      .filter(item => item.zScore > threshold)
      .map(item => item.index);

    return { anomalies, mean, std, threshold };
  }
}

// Export singleton instance
export const mlClient = new MLServiceClient();