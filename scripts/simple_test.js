// Simple test script without external dependencies
import http from 'http';

const BASE_URL = 'localhost';
const PORT = 5050;

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPIs() {
  console.log('🚀 Starting Simple API Tests...');
  
  try {
    // Test 1: Get all products
    console.log('\n1. Testing GET /api/v1/products');
    const productsResponse = await makeRequest('/api/v1/products');
    console.log(`✅ Status: ${productsResponse.status}`);
    
    // Test 2: Test users endpoint (should return 401)
    console.log('\n2. Testing GET /api/v1/users');
    try {
      const usersResponse = await makeRequest('/api/v1/users');
      console.log(`✅ Status: ${usersResponse.status}`);
    } catch (error) {
      console.log(`ℹ️ Expected error for protected route: ${error.message}`);
    }
    
    // Test 3: Test product stats
    console.log('\n3. Testing GET /api/v1/products/stats');
    const statsResponse = await makeRequest('/api/v1/products/stats');
    console.log(`✅ Status: ${statsResponse.status}`);
    
    console.log('\n🎉 All basic API tests completed!');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔴 Server is not running or not accessible');
    }
  }
}

testAPIs();
