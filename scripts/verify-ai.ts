import axios from 'axios';

async function verifyAI() {
    console.log('🔍 Starting System Verification...');
    const BASE_URL = 'http://localhost:3000';

    // 1. Test Health / DB (Services)
    console.log('\nTesting Database Connection (Services)...');
    try {
        const response = await axios.get(`${BASE_URL}/api/services`);
        console.log(`✅ Services Status: ${response.status}`);
        console.log(`   Found ${response.data.length} services.`);
    } catch (error: any) {
        console.error('❌ Services Failed:', error.message);
    }

    // 2. Test Local Ollama
    console.log('\nTesting Local Ollama Endpoint...');
    try {
        const response = await axios.post(`${BASE_URL}/api/ai/generate`, {
            model: 'ministral-3:3b',
            provider: 'ollama',
            messages: [{ role: 'user', content: 'Ping' }]
        });
        console.log('✅ Ollama Response:', response.data.response);
    } catch (error: any) {
        console.error('❌ Ollama Failed:', error.response?.data || error.message);
    }

    // 3. Test Google Gemini
    console.log('\nTesting Google Gemini Endpoint...');
    try {
        const response = await axios.post(`${BASE_URL}/api/ai/generate`, {
            model: 'gemini-2.0-flash',
            provider: 'google',
            messages: [{ role: 'user', content: 'Ping' }]
        });
        console.log('✅ Gemini Response:', response.data.response);
    } catch (error: any) {
        console.error('❌ Gemini Failed:', error.response?.data || error.message);
    }
}

// Wait for server to be ready
setTimeout(() => verifyAI(), 5000);
