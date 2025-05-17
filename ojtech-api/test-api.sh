#!/bin/bash

echo "Testing login endpoint..."
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"student@ojtech.com","password":"student123"}' http://localhost:8080/api/auth/login | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "Login failed or token not received"
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo -e "\nTesting /api/profiles/me endpoint..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/profiles/me -v 