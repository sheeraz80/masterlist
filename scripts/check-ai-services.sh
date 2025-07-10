#!/bin/bash

echo "=== AI Services Status Check ==="
echo ""

# Check Ollama
echo "1. Ollama Service:"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama is running"
    echo "   Available models:"
    curl -s http://localhost:11434/api/tags | jq -r '.models[].name' | sed 's/^/      - /'
else
    echo "   ❌ Ollama is not accessible"
fi

# Check ChromaDB
echo ""
echo "2. ChromaDB:"
if npm list chromadb 2>/dev/null | grep -q chromadb; then
    echo "   ✅ ChromaDB package installed"
else
    echo "   ❌ ChromaDB not installed"
fi

# Check ML Service
echo ""
echo "3. ML Service (Port 8000):"
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "   ✅ ML Service is running"
else
    echo "   ❌ ML Service not running (expected - using Ollama fallback)"
fi

# Performance check
echo ""
echo "4. System Resources:"
echo "   CPU Usage by Ollama:"
ps aux | grep ollama | grep -v grep | awk '{print "      "$11" - CPU: "$3"% MEM: "$4"%"}'

echo ""
echo "=== Recommendations ==="
echo ""
echo "Your DeepSeek models are very large (70B parameters)."
echo "For faster QA features, consider these lighter alternatives:"
echo ""
echo "1. For general use: ollama pull llama3.2:3b"
echo "2. For code analysis: ollama pull qwen2.5-coder:1.5b" 
echo "3. For embeddings: ollama pull nomic-embed-text"
echo ""
echo "To disable AI and use only fallback data:"
echo "   export USE_FALLBACK_DATA=true"
echo "   export ENABLE_AI_FEATURES=false"
echo ""