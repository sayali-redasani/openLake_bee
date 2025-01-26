# Use an official lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the application files into the container
COPY . /app

# Install dependencies
RUN pip install -r requirements.txt

# Expose the port your application runs on (change if necessary)
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]
