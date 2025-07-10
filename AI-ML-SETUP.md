# AI/ML Services Setup Guide

## Current Status

The QA system is fully functional but currently using **fallback data** instead of real AI/ML services. To enable actual AI-powered features, you need to set up the following services:

## Required Services

### 1. Ollama (Local AI Models)
Ollama is already attempting to run but getting timeout errors.

**Fix:**
```bash
# Check if Ollama is running
systemctl status ollama

# If not running, start it:
sudo systemctl start ollama

# Or run manually:
ollama serve

# Pull required models:
ollama pull llama2:latest
ollama pull nomic-embed-text  # For embeddings
```

### 2. ChromaDB (Vector Database)
Missing package dependency.

**Fix:**
```bash
# Install ChromaDB properly
npm install chromadb

# If you get peer dependency issues:
npm install @chroma-core/default-embed chromadb
```

### 3. ML Docker Service (Port 8000)
Custom ML service for advanced analytics.

**Option A - Use Existing Ollama:**
```typescript
// Update src/lib/analytics/ml-client.ts to use Ollama directly
const ML_SERVICE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
```

**Option B - Run ML Service:**
```bash
# Create docker-compose.yml for ML services
docker-compose up -d ml-service
```

## Quick Setup Script

Create `scripts/setup-ml-services.sh`:
```bash
#!/bin/bash

echo "Setting up ML/AI services..."

# 1. Install missing npm packages
echo "Installing ChromaDB..."
npm install chromadb @chroma-core/default-embed

# 2. Start Ollama
echo "Starting Ollama..."
systemctl start ollama 2>/dev/null || ollama serve &

# 3. Pull required models
echo "Pulling AI models..."
ollama pull llama2:latest
ollama pull nomic-embed-text

# 4. Test services
echo "Testing services..."
curl -s http://localhost:11434/api/tags | jq . || echo "Ollama not responding"

echo "Setup complete!"
```

## Environment Variables

Add to `.env`:
```
# AI/ML Services
OLLAMA_URL=http://localhost:11434
CHROMA_URL=http://localhost:8001
ML_SERVICE_URL=http://localhost:8000

# Enable/Disable AI features
ENABLE_AI_FEATURES=true
USE_FALLBACK_DATA=false
```

## Fallback Strategy

Current implementation includes smart fallbacks:
- ✅ Shows realistic sample data when AI unavailable
- ✅ Continues to function without external services
- ✅ Logs all AI service failures for debugging

To disable fallbacks and require real AI:
```typescript
// In your API routes
if (!aiServiceAvailable && !process.env.USE_FALLBACK_DATA) {
  throw new Error('AI service required but not available');
}
```

## Testing AI Integration

Once services are running:
```bash
# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Test"
}'

# Test ChromaDB
curl http://localhost:8001/api/v1/collections

# Check QA features
npm run dev
# Visit http://localhost:3000/qa
```

## Performance Considerations

- Ollama models require 4-8GB RAM per model
- ChromaDB needs ~2GB for vector storage
- Consider using smaller models for faster responses:
  - `phi3:mini` (2.3GB) for quick analysis
  - `mistral:7b` (4.1GB) for structured data
  - `nomic-embed-text` (137MB) for embeddings