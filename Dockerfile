# Stage 1: Build the React app
FROM node:16.17.0-bullseye-slim AS builder

WORKDIR /app

# Define build arguments
ARG REACT_APP_API_ENDPOINT
ARG REACT_APP_SERVER_URL
ARG APP_ENABLED_PAST_DATES
ARG REACT_APP_API_ENDPOINT_AUTH_SERVICE
ARG REACT_APP_API_ENDPOINT_EXTRACT_SERVICE
ARG REACT_APP_CLIENT_ID
ARG REACT_APP_AUTHORITY_URL
ARG REACT_APP_PROFILE
ARG REACT_APP_UNLOCKED_ESTIMATION_EDIT
ARG REACT_APP_BUSINESS_UNITS

# Copy package.json and package-lock.json separately to leverage Docker's caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Set environment variables for the build
ENV REACT_APP_API_ENDPOINT=$REACT_APP_API_ENDPOINT
ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
ENV APP_ENABLED_PAST_DATES=$APP_ENABLED_PAST_DATES
ENV REACT_APP_API_ENDPOINT_AUTH_SERVICE=$REACT_APP_API_ENDPOINT_AUTH_SERVICE
ENV REACT_APP_API_ENDPOINT_EXTRACT_SERVICE=$REACT_APP_API_ENDPOINT_EXTRACT_SERVICE
ENV REACT_APP_CLIENT_ID=$REACT_APP_CLIENT_ID
ENV REACT_APP_AUTHORITY_URL=$REACT_APP_AUTHORITY_URL
ENV REACT_APP_PROFILE=$REACT_APP_PROFILE
ENV REACT_APP_UNLOCKED_ESTIMATION_EDIT=$REACT_APP_UNLOCKED_ESTIMATION_EDIT
ENV REACT_APP_BUSINESS_UNITS=$REACT_APP_BUSINESS_UNITS

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