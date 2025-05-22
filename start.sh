#!/bin/bash

# Start Spring Boot backend
cd JavaSpringBootOAuth2JwtCrud
echo "Starting Spring Boot backend on port 8080..."
./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 10

# Start React frontend
cd ../ojtech-vite
echo "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# Handle script termination
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

# Keep script running
wait 