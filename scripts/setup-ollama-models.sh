#!/bin/bash

echo "Setting up specialized Ollama models for analytics..."

# Your existing models are great for general analysis
echo "✓ DeepSeek R1 models already installed - excellent for reasoning and analysis"

# Recommended additional models for specific tasks:
echo ""
echo "Recommended specialized models for enhanced analytics:"
echo ""

# 1. For embeddings and semantic search - smaller, faster
echo "1. nomic-embed-text (137M) - Specialized for embeddings"
echo "   Usage: Semantic search, finding similar projects"
echo "   Command: ollama pull nomic-embed-text"
echo ""

# 2. For code analysis if you have coding projects
echo "2. codellama:7b-instruct (3.8GB) - Code understanding"
echo "   Usage: Analyzing technical projects, code complexity"
echo "   Command: ollama pull codellama:7b-instruct"
echo ""

# 3. For structured data extraction
echo "3. mistral:7b-instruct (4.1GB) - Fast, good at JSON"
echo "   Usage: Structured data extraction, API responses"
echo "   Command: ollama pull mistral:7b-instruct"
echo ""

# 4. For financial analysis
echo "4. phi3:mini (2.3GB) - Efficient for calculations"
echo "   Usage: ROI calculations, financial projections"
echo "   Command: ollama pull phi3:mini"
echo ""

echo "Your current setup with DeepSeek R1 can handle all analytics tasks!"
echo "Additional models are optional optimizations for specific use cases."
echo ""
echo "To install any model, run the corresponding ollama pull command."

# Check available VRAM for ROCm
echo ""
echo "Checking GPU memory..."
rocm-smi --showmeminfo vram 2>/dev/null || echo "rocm-smi not found, but models will still work"