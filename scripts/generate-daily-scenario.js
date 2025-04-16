// Script to generate a daily scenario by calling the API
// Usage: node scripts/generate-daily-scenario.js

const https = require('https');
const http = require('http');
require('dotenv').config();

// Configuration - update these values for your environment
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_KEY = process.env.DAILY_SCENARIO_API_KEY;

if (!API_KEY) {
  console.error('Error: DAILY_SCENARIO_API_KEY is not defined in your environment variables');
  process.exit(1);
}

console.log(`Generating daily scenario on ${API_URL}...`);

// Determine whether to use http or https
const client = API_URL.startsWith('https') ? https : http;

// Prepare the request
const requestUrl = `${API_URL}/api/scenarios/daily?apiKey=${API_KEY}`;

// Make the API call
const req = client.get(requestUrl, (res) => {
  let data = '';

  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received
  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('Success:', response.message);
      console.log(`Scenario ID: ${response.scenarioId}`);
      console.log(`Title: ${response.title || 'N/A'}`);
    } else {
      console.error(`Error (${res.statusCode}):`, data);
    }
  });
});

// Handle errors
req.on('error', (error) => {
  console.error('Request error:', error.message);
});

// End the request
req.end(); 