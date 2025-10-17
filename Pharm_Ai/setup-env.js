#!/usr/bin/env node
/**
 * Environment Setup Script for Pharm-Ai
 * This script helps set up environment variables for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Pharm-Ai Environment Setup');
console.log('============================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env.local created successfully!');
  } else {
    console.log('❌ env.example not found. Creating basic .env.local...');
    
    const basicEnv = `# Pharm-Ai Environment Variables
# Copy this file to .env.local and fill in your values

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL=your_database_url_here

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# Application Settings
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Other AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
`;
    
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env.local created!');
  }
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n📋 Required Environment Variables for Vercel:');
console.log('==============================================');

const requiredVars = [
  'OPENAI_API_KEY',
  'GEMINI_API_KEY', 
  'PINECONE_API_KEY',
  'PINECONE_ENVIRONMENT',
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

requiredVars.forEach((varName, index) => {
  console.log(`${index + 1}. ${varName}`);
});

console.log('\n🔧 Next Steps:');
console.log('==============');
console.log('1. Fill in your API keys in .env.local');
console.log('2. Test locally: npm run dev');
console.log('3. Deploy to Vercel: vercel');
console.log('4. Set environment variables in Vercel dashboard');
console.log('5. Redeploy your application');

console.log('\n📚 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md');
console.log('\n🎉 Setup complete! Happy coding!');
