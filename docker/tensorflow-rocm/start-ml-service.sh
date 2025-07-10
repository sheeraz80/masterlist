#!/bin/bash

echo "Starting ROCm TensorFlow ML Analytics Service..."
echo "This will use your AMD GPU for accelerated machine learning"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "Error: Docker Compose is not installed."
    exit 1
fi

# Navigate to the docker directory
cd "$(dirname "$0")"

# Build the Docker image
echo "Building TensorFlow ROCm Docker image..."
$COMPOSE_CMD build

# Start the service
echo "Starting ML Analytics service..."
$COMPOSE_CMD up -d

# Wait for service to be ready
echo "Waiting for service to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/ > /dev/null; then
        echo ""
        echo "✅ ML Analytics Service is running!"
        echo ""
        
        # Check GPU status
        GPU_INFO=$(curl -s http://localhost:8000/ | grep -o '"gpu_available":[^,]*' | cut -d: -f2)
        if [ "$GPU_INFO" = "true" ]; then
            echo "🚀 GPU acceleration is ENABLED - using AMD ROCm"
        else
            echo "⚠️  GPU acceleration is DISABLED - running on CPU"
        fi
        
        echo ""
        echo "Service endpoints:"
        echo "  - Health Check: http://localhost:8000/"
        echo "  - Predict: http://localhost:8000/predict"
        echo "  - Batch Predict: http://localhost:8000/batch_predict"
        echo "  - Train: http://localhost:8000/train"
        echo "  - Anomaly Detection: http://localhost:8000/anomaly_detection"
        echo ""
        echo "View logs: $COMPOSE_CMD logs -f"
        echo "Stop service: $COMPOSE_CMD down"
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "❌ Service failed to start. Check logs with: $COMPOSE_CMD logs"
exit 1