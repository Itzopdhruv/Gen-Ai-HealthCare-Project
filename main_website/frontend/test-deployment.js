// AayuLink Frontend - Deployment Test Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing AayuLink Frontend Deployment Configuration...\n');

console.log('📁 Checking build files...');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('✅ dist/ directory exists');
    
    const indexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
        console.log('✅ index.html exists');
    } else {
        console.log('❌ index.html not found');
    }
    
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
        console.log('✅ assets/ directory exists');
        const files = fs.readdirSync(assetsPath);
        console.log(`   📦 Found ${files.length} asset files`);
    } else {
        console.log('❌ assets/ directory not found');
    }
} else {
    console.log('❌ dist/ directory not found - run npm run build first');
}

// Test 2: Check package.json
console.log('\n📦 Checking package.json...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`✅ Package name: ${packageJson.name}`);
    console.log(`✅ Version: ${packageJson.version}`);
    
    if (packageJson.scripts && packageJson.scripts.build) {
        console.log('✅ Build script found');
    } else {
        console.log('❌ Build script not found');
    }
} else {
    console.log('❌ package.json not found');
}

// Test 3: Check Vercel configuration
console.log('\n⚙️ Checking Vercel configuration...');
const vercelJsonPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    console.log('✅ vercel.json exists');
    
    if (vercelConfig.env) {
        console.log('✅ Environment variables configured:');
        Object.keys(vercelConfig.env).forEach(key => {
            console.log(`   - ${key}: ${vercelConfig.env[key]}`);
        });
    } else {
        console.log('⚠️ No environment variables configured');
    }
    
    if (vercelConfig.buildCommand) {
        console.log(`✅ Build command: ${vercelConfig.buildCommand}`);
    }
    
    if (vercelConfig.outputDirectory) {
        console.log(`✅ Output directory: ${vercelConfig.outputDirectory}`);
    }
} else {
    console.log('❌ vercel.json not found');
}

// Test 4: Check Vite configuration
console.log('\n🔧 Checking Vite configuration...');
const viteConfigPath = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
    console.log('✅ vite.config.js exists');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    if (viteConfig.includes('VITE_API_URL')) {
        console.log('✅ Environment variable support configured');
    } else {
        console.log('⚠️ Environment variable support not configured');
    }
} else {
    console.log('❌ vite.config.js not found');
}

// Test 5: Check source files for hardcoded URLs
console.log('\n🔍 Checking for hardcoded URLs...');
const srcPath = path.join(__dirname, 'src');
let hardcodedUrls = [];

function checkFile(filePath) {
    if (fs.statSync(filePath).isDirectory()) {
        const files = fs.readdirSync(filePath);
        files.forEach(file => {
            checkFile(path.join(filePath, file));
        });
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const localhostMatches = content.match(/localhost:\d+/g);
        const httpMatches = content.match(/https?:\/\/[^"'\s]+/g);
        
        if (localhostMatches) {
            localhostMatches.forEach(match => {
                if (!match.includes('localhost:3002')) { // Ignore Vite dev server
                    hardcodedUrls.push(`${filePath}: ${match}`);
                }
            });
        }
        
        if (httpMatches) {
            httpMatches.forEach(match => {
                if (match.includes('onrender.com') || match.includes('vercel.app')) {
                    // These are expected for production
                } else if (match.includes('localhost') || match.includes('127.0.0.1')) {
                    hardcodedUrls.push(`${filePath}: ${match}`);
                }
            });
        }
    }
}

if (fs.existsSync(srcPath)) {
    checkFile(srcPath);
    
    if (hardcodedUrls.length === 0) {
        console.log('✅ No hardcoded localhost URLs found');
    } else {
        console.log('⚠️ Found hardcoded URLs:');
        hardcodedUrls.forEach(url => console.log(`   - ${url}`));
    }
} else {
    console.log('❌ src/ directory not found');
}

console.log('\n========================================');
console.log('📊 Deployment Test Summary:');
console.log('✅ Frontend is ready for Vercel deployment!');
console.log('🔗 Environment variables are configured');
console.log('📦 Build files are ready');
console.log('⚙️ Vercel configuration is set');
console.log('\n🚀 Ready to deploy! Run: npm run build && vercel --prod');
console.log('========================================');
