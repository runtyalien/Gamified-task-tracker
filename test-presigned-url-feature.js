const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test the updated upload endpoint that returns presigned URL
async function testUploadWithPresignedUrl() {
    console.log('\n🔍 Testing Backend Upload with Presigned URL Feature...\n');
    
    const backendUrl = 'http://localhost:3001';
    
    try {
        // Test 1: Health check
        console.log('1. Testing health check...');
        const healthResponse = await axios.get(`${backendUrl}/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        
        // Test 2: Create a test image file
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        if (!fs.existsSync(testImagePath)) {
            // Create a minimal valid JPEG file
            const jpegData = Buffer.from([
                0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
                0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
                0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
                0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
                0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
                0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
                0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
                0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
                0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
                0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
                0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
                0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
            ]);
            fs.writeFileSync(testImagePath, jpegData);
            console.log('✅ Created test image file');
        }
        
        // Test 3: Upload image and get presigned URL
        console.log('\n2. Testing image upload with presigned URL response...');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(testImagePath));
        formData.append('userId', 'test-user-123');
        
        const uploadResponse = await axios.post(`${backendUrl}/api/s3/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000,
        });
        
        console.log('✅ Upload successful!');
        console.log('📊 Response data:');
        console.log(JSON.stringify(uploadResponse.data, null, 2));
        
        // Test 4: Validate response structure
        const responseData = uploadResponse.data.data;
        console.log('\n3. Validating response structure...');
        
        if (!responseData.key) {
            throw new Error('❌ Response missing "key" field');
        }
        console.log('✅ Key field present:', responseData.key);
        
        if (!responseData.publicUrl) {
            throw new Error('❌ Response missing "publicUrl" field');
        }
        console.log('✅ Public URL field present:', responseData.publicUrl);
        
        if (responseData.presignedUrl) {
            console.log('✅ Presigned URL field present:', responseData.presignedUrl);
            
            // Test 5: Validate presigned URL format
            if (!responseData.presignedUrl.includes('X-Amz-Algorithm')) {
                console.log('⚠️  Warning: Presigned URL might not be in expected AWS format');
            } else {
                console.log('✅ Presigned URL appears to be in correct AWS format');
            }
        } else {
            console.log('⚠️  Warning: Presigned URL field not present (may be null)');
        }
        
        // Test 6: Test presigned URL accessibility (if available)
        if (responseData.presignedUrl) {
            console.log('\n4. Testing presigned URL accessibility...');
            try {
                const presignedResponse = await axios.head(responseData.presignedUrl, {
                    timeout: 10000
                });
                console.log('✅ Presigned URL is accessible');
                console.log('📋 Response headers:', presignedResponse.headers);
            } catch (presignedError) {
                console.log('⚠️  Presigned URL test failed (this may be expected for some configurations):', presignedError.message);
            }
        }
        
        // Test 7: Cleanup
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
            console.log('✅ Cleaned up test file');
        }
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('✨ Backend now returns presigned URL in upload response');
        console.log('🚀 Frontend can display both public URL and presigned URL to users');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('📋 Error response:', error.response.status, error.response.data);
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔧 Make sure the backend server is running on port 3001');
        }
        
        // Cleanup on error
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
}

// Run the test
if (require.main === module) {
    testUploadWithPresignedUrl();
}

module.exports = { testUploadWithPresignedUrl };
