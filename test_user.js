// Test user API
import http from 'http';

// Test user API (should return 401 without auth)
const options = {
  hostname: 'localhost',
  port: 5050,
  path: '/api/v1/users',
  method: 'GET'
};

console.log('Testing GET /api/v1/users (should return 401)...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Valid JSON response');
      console.log('Response:', JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 401) {
        console.log('✅ User API protection working correctly (401 Unauthorized)');
      } else {
        console.log(`ℹ️ Unexpected status code: ${res.statusCode}`);
      }
    } catch (e) {
      console.log('Response data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
