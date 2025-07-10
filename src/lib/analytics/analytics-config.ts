// Analytics configuration optimized for your hardware
// AMD Ryzen 8845HS + 128GB RAM + ROCm GPU

export const ANALYTICS_CONFIG = {
  // Model selection based on available resources
  models: {
    // Your existing models - excellent for analytics
    primary: {
      fast: 'sam860/deepseek-r1-0528-qwen3:8b-Q4_K_M', // 5GB - very fast
      advanced: 'deepseek-r1:70b', // 42GB - powerful but slower
    },
    
    // Optional specialized models (install only if needed)
    optional: {
      embeddings: 'nomic-embed-text', // 137MB - for semantic search
      code: 'codellama:7b-instruct', // 3.8GB - for code analysis
      structured: 'mistral:7b-instruct', // 4.1GB - for JSON/structured data
      math: 'phi3:mini', // 2.3GB - for financial calculations
    }
  },

  // Performance settings for your hardware
  performance: {
    // Batch processing settings
    batchSize: 10, // Can handle large batches with 128GB RAM
    maxConcurrent: 5, // Process multiple requests in parallel
    
    // Model loading settings
    gpuLayers: -1, // Use all GPU layers (ROCm)
    threads: 16, // Ryzen 8845HS has 16 threads
    
    // Memory settings
    contextSize: 8192, // Can use large context with your RAM
    maxTokens: 4096, // Generous token limit
  },

  // Caching settings to improve performance
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour cache for analytics results
    maxSize: 1000, // Store up to 1000 cached results
  },

  // TensorFlow.js settings for ML tasks
  tensorflow: {
    backend: 'tensorflow', // Use native TF backend
    maxTextureSize: 16384, // ROCm can handle large textures
    webgl: {
      pack: true,
      channelsLast: false,
    }
  },

  // Real-time analytics settings
  realtime: {
    updateInterval: 60000, // Update every minute
    metricsRetention: 1000, // Keep last 1000 data points
    anomalyThreshold: 2.5, // Z-score for anomaly detection
  }
};

// Task complexity evaluator
export function evaluateTaskComplexity(task: {
  projectCount?: number;
  analysisDepth?: 'basic' | 'standard' | 'deep';
  responseLength?: number;
}): 'fast' | 'advanced' {
  const { projectCount = 1, analysisDepth = 'standard', responseLength = 1000 } = task;
  
  // Use advanced model for complex tasks
  if (projectCount > 50 || analysisDepth === 'deep' || responseLength > 2000) {
    return 'advanced';
  }
  
  return 'fast';
}

// Ollama optimization settings
export const OLLAMA_OPTIONS = {
  // Optimized for your DeepSeek models
  num_ctx: 8192, // Context window
  num_predict: 2048, // Max tokens to generate
  temperature: 0.7, // Balanced creativity/accuracy
  top_p: 0.95, // Nucleus sampling
  top_k: 40, // Top-k sampling
  repeat_penalty: 1.1, // Avoid repetition
  
  // GPU acceleration
  num_gpu: -1, // Use all GPU layers
  main_gpu: 0, // Primary GPU
  
  // Performance
  num_thread: 16, // Match your CPU threads
  num_batch: 512, // Batch size for prompt eval
  
  // Memory settings
  use_mmap: true, // Memory-mapped files
  use_mlock: false, // Don't lock memory (you have plenty)
};

// Prompt templates optimized for DeepSeek R1
export const PROMPT_TEMPLATES = {
  projectAnalysis: `<|User|>You are an expert business analyst with deep knowledge of market trends, technology, and business strategy.

Analyze this project comprehensively:
{projectDetails}

Provide a detailed analysis covering:
1. Market viability and opportunity size
2. Technical feasibility and complexity assessment  
3. Revenue potential and monetization strategy
4. Risk factors and mitigation strategies
5. Competitive advantages and differentiation
6. Target audience fit and user acquisition strategy
7. Development roadmap and resource requirements

Format your response as structured JSON with clear sections.
<|Assistant|>`,

  trendPrediction: `<|User|>You are a data scientist specializing in predictive analytics and market trend analysis.

Based on this historical data:
{historicalData}

Predict future trends for the next 3-6 months, considering:
1. Current momentum and growth patterns
2. Market saturation indicators
3. Seasonal factors
4. Technology adoption curves
5. Competitive landscape changes

Provide predictions with confidence levels and reasoning.
<|Assistant|>`,

  strategicRecommendation: `<|User|>You are a strategic advisor helping optimize project portfolios.

Portfolio Overview:
{portfolioData}

Provide strategic recommendations for:
1. Portfolio diversification and risk management
2. Resource allocation across projects
3. Market opportunities to pursue
4. Projects to prioritize or sunset
5. Team structure and skill gaps
6. Revenue optimization strategies

Be specific and actionable in your recommendations.
<|Assistant|>`
};