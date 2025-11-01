/**
 * Environment Variable Checker
 * Run this to verify your .env configuration
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const requiredVars = {
  PORT: process.env.PORT,
  VITE_MAPBOX_TOKEN: process.env.VITE_MAPBOX_TOKEN,
  GEMINI_API: process.env.GEMINI_API,
};

const optionalVars = {
  NEWS_API: process.env.NEWS_API,
  GMAPS_API: process.env.GMAPS_API,
};

console.log('\n🔍 Environment Variable Check\n');
console.log('='.repeat(50));

console.log('\n✅ Required Variables:');
let allRequiredPresent = true;
Object.entries(requiredVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 10)}...` : 'MISSING';
  console.log(`  ${status} ${key}: ${displayValue}`);
  if (!value) allRequiredPresent = false;
});

console.log('\n📋 Optional Variables:');
Object.entries(optionalVars).forEach(([key, value]) => {
  const status = value ? '✅' : '⚪';
  const displayValue = value ? `${value.substring(0, 10)}...` : 'Not set';
  console.log(`  ${status} ${key}: ${displayValue}`);
});

console.log('\n' + '='.repeat(50));

if (allRequiredPresent) {
  console.log('\n✅ All required environment variables are set!');
  console.log('🚀 Your server should be ready to run.\n');
} else {
  console.log('\n⚠️  Missing required environment variables!');
  console.log('📝 Please check your .env file in the server/ directory.\n');
  console.log('Expected .env file format:');
  console.log('PORT=3000');
  console.log('VITE_MAPBOX_TOKEN=your_mapbox_token');
  console.log('GEMINI_API=your_gemini_key');
  console.log('NEWS_API=your_news_api_key  (optional)');
  console.log('GMAPS_API=your_google_maps_key  (optional)\n');
}

