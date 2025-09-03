// Very simple test using node built-in modules
import http from 'http';

// Test product API
const options = {
  hostname: 'localhost',
  port: 5050,
  path: '/api/v1/products',
  method: 'GET'
};

console.log('Testing GET /api/v1/products...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Valid JSON response');
      console.log('Data preview:', JSON.stringify(jsonData).substring(0, 200) + '...');
    } catch (e) {
      console.log('Response data:', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
