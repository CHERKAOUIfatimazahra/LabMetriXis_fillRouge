FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./

RUN npm install

# Copy all files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 3000

CMD ["node", "server.js"]