# Use official ROCm TensorFlow image
FROM rocm/tensorflow:rocm6.4.1-py3.12-tf2.18-dev

# Set working directory
WORKDIR /app

# Install additional Python packages for analytics
RUN pip install --no-cache-dir \
    pandas \
    numpy \
    scikit-learn \
    matplotlib \
    seaborn \
    fastapi \
    uvicorn \
    pydantic

# Copy the ML analytics service
COPY ml-analytics-service.py /app/
COPY requirements.txt /app/

# Install project-specific requirements
RUN pip install --no-cache-dir -r requirements.txt

# Expose port for the ML service
EXPOSE 8000

# Run the ML analytics service
CMD ["python", "-m", "uvicorn", "ml-analytics-service:app", "--host", "0.0.0.0", "--port", "8000"]