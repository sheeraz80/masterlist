// AI Feature Configuration
// Controls whether to use real AI services or fallback data

export const AI_CONFIG = {
  // Master switch for AI features
  ENABLE_AI: process.env.ENABLE_AI_FEATURES !== 'false',
  
  // Use fallback data when AI services unavailable
  USE_FALLBACK: process.env.USE_FALLBACK_DATA !== 'false',
  
  // Service URLs
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  CHROMA_URL: process.env.CHROMA_URL || 'http://localhost:8001',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  
  // Timeouts
  OLLAMA_TIMEOUT: parseInt(process.env.OLLAMA_TIMEOUT || '30000'),
  ML_SERVICE_TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT || '5000'),
  
  // Model selection
  MODELS: {
    STRUCTURED: process.env.OLLAMA_MODEL_STRUCTURED || 'deepseek-r1:70b',
    EMBEDDING: process.env.OLLAMA_MODEL_EMBEDDING || 'nomic-embed-text',
    FAST: process.env.OLLAMA_MODEL_FAST || 'sam860/deepseek-r1-0528-qwen3:8b-Q4_K_M'
  },
  
  // Feature flags
  FEATURES: {
    QA_AI_TESTING: process.env.ENABLE_QA_AI_TESTING !== 'false',
    VISUAL_REGRESSION_AI: process.env.ENABLE_VISUAL_REGRESSION_AI !== 'false',
    PREDICTIVE_METRICS: process.env.ENABLE_PREDICTIVE_METRICS !== 'false',
    CODE_QUALITY_AI: process.env.ENABLE_CODE_QUALITY_AI !== 'false',
    SECURITY_SCANNING_AI: process.env.ENABLE_SECURITY_SCANNING_AI !== 'false'
  }
};

// Helper to check if we should use real AI or fallback
export function shouldUseAI(): boolean {
  return AI_CONFIG.ENABLE_AI;
}

export function shouldUseFallback(): boolean {
  return AI_CONFIG.USE_FALLBACK;
}