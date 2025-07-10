import { Ollama } from 'ollama';

// ChromaDB is optional - only load if available
let ChromaClient: any;
try {
  if (typeof window === 'undefined') {
    ChromaClient = require('chromadb').ChromaClient;
  }
} catch (e) {
  // ChromaDB not available, will work without it
  console.log('ChromaDB not available, semantic search disabled');
}

// Initialize Ollama client
const ollama = new Ollama({
  host: 'http://localhost:11434' // Default Ollama host
});

// Model configuration - DeepSeek R1 is excellent for reasoning
const MODELS = {
  // Your 8B model - fast and efficient for most tasks
  fast: 'sam860/deepseek-r1-0528-qwen3:8b-Q4_K_M',
  // Your 70B model - use for complex analysis when needed
  advanced: 'deepseek-r1:70b',
  // Optional: specialized models (install if needed)
  embeddings: 'nomic-embed-text', // ollama pull nomic-embed-text
  structured: 'mistral:7b-instruct' // ollama pull mistral:7b-instruct
};

// Default to fast model, can switch based on task complexity
const MODEL_NAME = MODELS.fast;

interface ProjectAnalysis {
  id: string;
  title: string;
  insights: string;
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  marketAnalysis: {
    opportunity: string;
    competition: string;
    targetAudience: string;
  };
  successFactors: string[];
  improvementAreas: string[];
}

interface TrendPrediction {
  category: string;
  prediction: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  timeframe: string;
}

export class OllamaAnalytics {
  private chroma: any;
  private projectCollection: any;
  private modelCache = new Map<string, boolean>();

  constructor() {
    if (ChromaClient) {
      this.chroma = new ChromaClient();
    }
  }

  // Check if a model is available
  private async isModelAvailable(modelName: string): Promise<boolean> {
    if (this.modelCache.has(modelName)) {
      return this.modelCache.get(modelName)!;
    }

    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      const available = data.models.some((m: any) => m.name === modelName);
      this.modelCache.set(modelName, available);
      return available;
    } catch {
      return false;
    }
  }

  // Select best available model for the task
  private async selectModel(taskType: 'reasoning' | 'embeddings' | 'structured' = 'reasoning'): Promise<string> {
    switch (taskType) {
      case 'embeddings':
        // Check if specialized embedding model is available
        if (await this.isModelAvailable(MODELS.embeddings)) {
          return MODELS.embeddings;
        }
        break;
      case 'structured':
        // Check if Mistral is available for JSON tasks
        if (await this.isModelAvailable(MODELS.structured)) {
          return MODELS.structured;
        }
        break;
    }
    
    // Default to your DeepSeek models
    return MODEL_NAME;
  }

  async initialize() {
    // Initialize ChromaDB for semantic search if available
    if (this.chroma) {
      try {
        this.projectCollection = await this.chroma.createCollection({
          name: 'projects',
          metadata: { description: 'Project embeddings for semantic search' }
        });
      } catch (error) {
        // Collection might already exist
        try {
          this.projectCollection = await this.chroma.getCollection({
            name: 'projects'
          });
        } catch (e) {
          console.log('ChromaDB initialization failed, continuing without it');
        }
      }
    }
  }

  // Analyze a single project with deep insights
  async analyzeProject(project: any): Promise<ProjectAnalysis> {
    const prompt = `You are an expert business analyst. Analyze this project and provide detailed insights:

Project: ${project.title}
Problem: ${project.problem}
Solution: ${project.solution}
Category: ${project.category}
Target Users: ${project.targetUsers}
Revenue Model: ${project.revenueModel}
Technical Complexity: ${project.technicalComplexity}/10
Quality Score: ${project.qualityScore}/10
Competition Level: ${project.competitionLevel}
Development Time: ${project.developmentTime}

Provide a comprehensive analysis in the following JSON format:
{
  "insights": "Overall assessment of the project's viability and potential",
  "recommendations": ["Specific actionable recommendations"],
  "riskAssessment": {
    "level": "low/medium/high",
    "factors": ["List of risk factors"]
  },
  "marketAnalysis": {
    "opportunity": "Market opportunity assessment",
    "competition": "Competitive landscape analysis",
    "targetAudience": "Target audience insights"
  },
  "successFactors": ["Key factors that could drive success"],
  "improvementAreas": ["Areas that need improvement"]
}`;

    try {
      const response = await ollama.generate({
        model: await this.selectModel('structured'),
        prompt,
        format: 'json',
        stream: false,
        options: {
          num_predict: 512,  // Limit response size for faster generation
          temperature: 0.3,   // Lower temperature for more consistent JSON
          timeout: 30000      // 30 second timeout
        }
      });

      const analysis = JSON.parse(response.response);
      
      return {
        id: project.id,
        title: project.title,
        ...analysis
      };
    } catch (error) {
      console.error('Error analyzing project:', error);
      // Fallback analysis
      return {
        id: project.id,
        title: project.title,
        insights: 'Analysis pending',
        recommendations: [],
        riskAssessment: { level: 'medium', factors: [] },
        marketAnalysis: {
          opportunity: 'To be analyzed',
          competition: 'To be analyzed',
          targetAudience: 'To be analyzed'
        },
        successFactors: [],
        improvementAreas: []
      };
    }
  }

  // Predict future trends based on historical data
  async predictTrends(historicalData: any[]): Promise<TrendPrediction[]> {
    const categoryCounts = historicalData.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {});

    const prompt = `Based on this project distribution data, predict future trends:

${JSON.stringify(categoryCounts, null, 2)}

Recent projects: ${historicalData.slice(-10).map(p => `${p.title} (${p.category})`).join(', ')}

Analyze trends and provide predictions in JSON format:
[
  {
    "category": "category name",
    "prediction": "detailed prediction about this category",
    "confidence": "high/medium/low",
    "reasoning": "why you made this prediction",
    "timeframe": "expected timeframe for this trend"
  }
]

Focus on the top 5 most significant trends.`;

    try {
      const response = await ollama.generate({
        model: await this.selectModel('structured'),
        prompt,
        format: 'json',
        stream: false,
        options: {
          num_predict: 512,  // Limit response size for faster generation
          temperature: 0.3,   // Lower temperature for more consistent JSON
          timeout: 30000      // 30 second timeout
        }
      });

      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error predicting trends:', error);
      return [];
    }
  }

  // Generate strategic recommendations based on portfolio analysis
  async generateStrategicRecommendations(projects: any[]): Promise<{
    portfolioHealth: string;
    diversificationScore: number;
    strategicGaps: string[];
    opportunities: string[];
    actionPlan: string[];
  }> {
    const prompt = `Analyze this project portfolio and provide strategic recommendations:

Total Projects: ${projects.length}
Categories: ${[...new Set(projects.map(p => p.category))].join(', ')}
Average Quality Score: ${(projects.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / projects.length).toFixed(1)}
Average Revenue Potential: $${(projects.reduce((sum, p) => sum + (JSON.parse(p.revenuePotential || '{}').realistic || 0), 0) / projects.length).toFixed(0)}

Top 10 Projects by Revenue:
${projects
  .sort((a, b) => (JSON.parse(b.revenuePotential || '{}').realistic || 0) - (JSON.parse(a.revenuePotential || '{}').realistic || 0))
  .slice(0, 10)
  .map(p => `- ${p.title} (${p.category}): $${JSON.parse(p.revenuePotential || '{}').realistic || 0}`)
  .join('\n')}

Provide strategic analysis in JSON format:
{
  "portfolioHealth": "Overall assessment of portfolio health",
  "diversificationScore": 0-10,
  "strategicGaps": ["List of gaps in the portfolio"],
  "opportunities": ["List of strategic opportunities"],
  "actionPlan": ["Prioritized list of actions to take"]
}`;

    try {
      const response = await ollama.generate({
        model: await this.selectModel('structured'),
        prompt,
        format: 'json',
        stream: false,
        options: {
          num_predict: 512,  // Limit response size for faster generation
          temperature: 0.3,   // Lower temperature for more consistent JSON
          timeout: 30000      // 30 second timeout
        }
      });

      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error generating strategic recommendations:', error);
      return {
        portfolioHealth: 'Analysis pending',
        diversificationScore: 5,
        strategicGaps: [],
        opportunities: [],
        actionPlan: []
      };
    }
  }

  // Natural language query interface
  async queryAnalytics(question: string, context: any): Promise<string> {
    const prompt = `You are an analytics assistant. Answer this question based on the provided data:

Question: ${question}

Context Data:
- Total Projects: ${context.totalProjects}
- Total Revenue Potential: $${context.totalRevenue}
- Average Quality Score: ${context.avgQuality}
- Categories: ${context.categories.join(', ')}
- Recent Activity: ${context.recentActivity}

Additional Details:
${JSON.stringify(context.additionalData || {}, null, 2)}

Provide a clear, concise answer with specific insights and numbers where relevant.`;

    try {
      const response = await ollama.generate({
        model: MODEL_NAME,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });

      // Clean up response - remove thinking tags if present
      let answer = response.response;
      if (answer.includes('<think>')) {
        // Extract only the content after </think>
        const parts = answer.split('</think>');
        answer = parts[parts.length - 1].trim();
      }
      
      return answer;
    } catch (error) {
      console.error('Error querying analytics:', error);
      return 'Unable to process query at this time.';
    }
  }

  // Generate embeddings for semantic search
  async generateProjectEmbeddings(projects: any[]) {
    try {
      const embeddings = await Promise.all(
        projects.map(async (project) => {
          const text = `${project.title} ${project.problem} ${project.solution} ${project.category}`;
          const response = await ollama.embeddings({
            model: MODEL_NAME,
            prompt: text
          });
          return {
            id: project.id,
            embedding: response.embedding
          };
        })
      );

      // Store in ChromaDB
      await this.projectCollection.add({
        ids: embeddings.map(e => e.id),
        embeddings: embeddings.map(e => e.embedding),
        metadatas: projects.map(p => ({
          title: p.title,
          category: p.category,
          qualityScore: p.qualityScore
        }))
      });
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  }

  // Find similar projects using semantic search
  async findSimilarProjects(projectId: string, limit: number = 5): Promise<string[]> {
    try {
      const results = await this.projectCollection.query({
        queryEmbeddings: [], // Would need the embedding of the query project
        nResults: limit
      });

      return results.ids[0] || [];
    } catch (error) {
      console.error('Error finding similar projects:', error);
      return [];
    }
  }

  // Batch analyze multiple projects for efficiency
  async batchAnalyzeProjects(projects: any[], batchSize: number = 5): Promise<ProjectAnalysis[]> {
    const results: ProjectAnalysis[] = [];
    
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(project => this.analyzeProject(project))
      );
      results.push(...batchResults);
      
      // Small delay to avoid overwhelming Ollama
      if (i + batchSize < projects.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}