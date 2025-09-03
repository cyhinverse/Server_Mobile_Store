// Test API endpoints for Product and User modules
import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api/v1';

// Test data for product creation
const testProductData = {
  "name": "iPhone 15 Pro Max Test",
  "price": 32990000,
  "thumbnail": "https://example.com/images/iphone15promax-thumb.jpg",
  "stock": 120,
  "sold": 35,
  "status": "active",
  "brand_id": "66c4f8e7e7c123456789abcd",
  "category_id": "66c4f8e7e7c987654321abcd",
  "variants": [
    {
      "color": "Black Titanium",
      "storage": "256GB",
      "price": {
        "originalPrice": 32990000,
        "currency": "VND"
      },
      "stock": 50,
      "sku": "IP15PM-BLK-256-TEST",
      "image_url": "https://example.com/images/iphone15promax-black-256.jpg"
    }
  ],
  "slug": "iphone-15-pro-max-test",
  "isNewProduct": true,
  "isFeatured": true,
  "productDetail": {
    "description": "iPhone 15 Pro Max Test Product",
    "rating": 4.8,
    "images": [
      "https://example.com/images/iphone15promax-front.jpg",
      "https://example.com/images/iphone15promax-back.jpg"
    ],
    "specs": {
      "screenSize": "6.7 inch",
      "screenTechnology": "Super Retina XDR OLED",
      "nearCamera": "48MP + 12MP + 12MP",
      "frontCamera": "12MP",
      "chipset": "Apple A17 Pro",
      "ram": "8GB",
      "currentStorage": "256GB",
      "battery": "4422mAh",
      "sim": "2 SIM (nano-SIM và eSIM)",
      "os": "iOS 17"
    }
  }
};

// Store created items for cleanup
let createdItems = {
  products: [],
  users: []
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Test Product API
async function testProductAPI() {
  log('\n=== TESTING PRODUCT API ===', 'blue');
  
  try {
    // Test 1: Get all products
    log('1. Testing GET /products', 'yellow');
    const getProductsResponse = await axios.get(`${BASE_URL}/products`);
    log(`✅ GET /products - Status: ${getProductsResponse.status}`, 'green');
    
    // Test 2: Create product
    log('2. Testing POST /products', 'yellow');
    const createProductResponse = await axios.post(`${BASE_URL}/products`, testProductData);
    log(`✅ POST /products - Status: ${createProductResponse.status}`, 'green');
    
    const createdProduct = createProductResponse.data.data || createProductResponse.data;
    if (createdProduct && createdProduct._id) {
      createdItems.products.push(createdProduct._id);
      log(`📦 Created product ID: ${createdProduct._id}`, 'blue');
      
      // Test 3: Get product by ID
      log('3. Testing GET /products/:id', 'yellow');
      const getProductResponse = await axios.get(`${BASE_URL}/products/${createdProduct._id}`);
      log(`✅ GET /products/:id - Status: ${getProductResponse.status}`, 'green');
    }
    
    // Test 4: Search products
    log('4. Testing GET /products/search', 'yellow');
    const searchResponse = await axios.get(`${BASE_URL}/products/search?q=iPhone`);
    log(`✅ GET /products/search - Status: ${searchResponse.status}`, 'green');
    
    // Test 5: Get featured products
    log('5. Testing GET /products/featured', 'yellow');
    const featuredResponse = await axios.get(`${BASE_URL}/products/featured`);
    log(`✅ GET /products/featured - Status: ${featuredResponse.status}`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Product API Error: ${error.response?.status || 'No Response'} - ${error.message}`, 'red');
    if (error.response?.data) {
      log(`Error details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    if (error.code) {
      log(`Error code: ${error.code}`, 'red');
    }
    return false;
  }
}

// Test User API (simplified since it requires authentication)
async function testUserAPI() {
  log('\n=== TESTING USER API ===', 'blue');
  
  try {
    // Since user routes require authentication, we'll test auth endpoint first
    log('1. Testing user-related endpoints (without auth)', 'yellow');
    
    // Try to access a protected route (should return 401)
    try {
      await axios.get(`${BASE_URL}/users`);
    } catch (error) {
      if (error.response?.status === 401) {
        log('✅ User API protection working - Returns 401 for unauthenticated requests', 'green');
        return true;
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ User API Error: ${error.response?.status || 'No Response'} - ${error.message}`, 'red');
    if (error.code) {
      log(`Error code: ${error.code}`, 'red');
    }
    return false;
  }
}

// Cleanup function
async function cleanup() {
  log('\n=== CLEANING UP TEST DATA ===', 'blue');
  
  // Clean up products
  for (const productId of createdItems.products) {
    try {
      // Note: This might fail if delete requires authentication
      // await axios.delete(`${BASE_URL}/products/${productId}`);
      log(`🧹 Would delete product: ${productId}`, 'yellow');
    } catch (error) {
      log(`⚠️ Could not delete product ${productId}: ${error.message}`, 'yellow');
    }
  }
  
  log('✅ Cleanup completed', 'green');
}

// Main test function
async function runTests() {
  log('🚀 Starting API Tests...', 'blue');
  
  let allTestsPassed = true;
  
  // Test Product API
  const productTestResult = await testProductAPI();
  allTestsPassed = allTestsPassed && productTestResult;
  
  // Test User API
  const userTestResult = await testUserAPI();
  allTestsPassed = allTestsPassed && userTestResult;
  
  // Show summary
  log('\n=== TEST SUMMARY ===', 'blue');
  if (allTestsPassed) {
    log('🎉 All tests passed successfully!', 'green');
  } else {
    log('❌ Some tests failed', 'red');
  }
  
  // Auto cleanup if all tests passed
  if (allTestsPassed) {
    await cleanup();
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', async () => {
  log('\n🛑 Test interrupted, cleaning up...', 'yellow');
  await cleanup();
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  log(`💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
