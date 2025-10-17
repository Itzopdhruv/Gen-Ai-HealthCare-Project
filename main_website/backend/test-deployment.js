#!/usr/bin/env node
/**
 * AayuLink Backend Deployment Test Script
 * This script tests the backend for Render deployment readiness
 */

import { spawn } from 'child_process';
import http from 'http';

console.log('🚀 AayuLink Backend Deployment Test');
console.log('===================================\n');

// Test 1: Check if server starts without errors
console.log('🔍 Test 1: Starting server...');
const serverProcess = spawn('node', ['src/server.js'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'test', PORT: '5001' }
});

let serverOutput = '';
let serverError = '';

serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

serverProcess.stderr.on('data', (data) => {
  serverError += data.toString();
});

// Wait for server to start
setTimeout(() => {
  console.log('📊 Server output:');
  console.log(serverOutput);
  
  if (serverError) {
    console.log('❌ Server errors:');
    console.log(serverError);
  }
  
  // Test 2: Health check
  console.log('\n🔍 Test 2: Health check...');
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Health check response:');
      console.log(JSON.parse(data));
      
      // Test 3: API health check
      console.log('\n🔍 Test 3: API health check...');
      const apiOptions = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/health',
        method: 'GET'
      };
      
      const apiReq = http.request(apiOptions, (apiRes) => {
        let apiData = '';
        apiRes.on('data', (chunk) => {
          apiData += chunk;
        });
        
        apiRes.on('end', () => {
          console.log('✅ API health check response:');
          console.log(JSON.parse(apiData));
          
          // Clean up
          serverProcess.kill();
          
          console.log('\n🎉 All tests completed!');
          console.log('✅ Backend is ready for Render deployment');
        });
      });
      
      apiReq.on('error', (err) => {
        console.log('❌ API health check failed:', err.message);
        serverProcess.kill();
      });
      
      apiReq.end();
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Health check failed:', err.message);
    serverProcess.kill();
  });
  
  req.end();
}, 3000);

// Handle server process errors
serverProcess.on('error', (err) => {
  console.log('❌ Failed to start server:', err.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`❌ Server exited with code ${code}`);
    process.exit(1);
  }
});
