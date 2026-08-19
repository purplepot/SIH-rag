# Use a slim Python image
FROM python:3.10-slim

# Install Node.js and curl
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Install ChromaDB
RUN pip install chromadb

# Copy all project files
COPY . /app/

# Create a startup script
RUN echo '#!/bin/bash\n\
# Start ChromaDB on port 8000 in the background\n\
chroma run --path ./chroma_data --host 0.0.0.0 --port 8000 &\n\
\n\
# Wait for Chroma to initialize\n\
sleep 5\n\
\n\
# Start the Node.js backend (Render will use process.env.PORT for the node app)\n\
cd backend && npm run dev\n' > /app/start.sh

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
