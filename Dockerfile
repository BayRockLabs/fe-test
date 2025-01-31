# MPS NodeJS Dockerfile
 
# FROM node:16.17.0-bullseye-slim

# WORKDIR /app 

# COPY --chown=node:node . .

# RUN npm install --legacy-peer-deps

# EXPOSE 3000

# USER node

# CMD npm start


# Stage 1: Build React App
FROM node:16.17.0-bullseye-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker's caching
COPY . .
RUN npm install --legacy-peer-deps



# Build the React app
RUN npm run build

# Stage 2: Serve Static Files using Nginx
FROM nginx:alpine

# Copy the built static files from the previous stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration file if needed
COPY react.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
