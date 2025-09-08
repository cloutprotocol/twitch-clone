#!/usr/bin/env node

/**
 * Theme System Test Script
 * Validates that the theme system is properly configured
 */

const fs = require('fs');
const path = require('path');

function testThemeSystem() {
  console.log('🎨 Testing Theme System...\n');
  
  const tests = [
    {
      name: 'CSS Variables Defined',
      test: () => {
        const cssContent = fs.readFileSync('app/globals.css', 'utf8');
        const requiredVars = [
          '--background-primary',
          '--background-secondary',
          '--text-primary',
          '--text-secondary',
          '--interactive-primary',
          '--border-primary',
          '--streaming-live'
        ];
        
        const missing = requiredVars.filter(varName => !cssContent.includes(varName));
        return {
          passed: missing.length === 0,
          message: missing.length === 0 
            ? 'All required CSS variables are defined' 
            : `Missing variables: ${missing.join(', ')}`
        };
      }
    },
    
    {
      name: 'Tailwind Config Updated',
      test: () => {
        const configContent = fs.readFileSync('tailwind.config.ts', 'utf8');
        const requiredColors = [
          'background-primary',
          'text-primary',
          'interactive-primary',
          'streaming-live'
        ];
        
        const missing = requiredColors.filter(color => !configContent.includes(color));
        return {
          passed: missing.length === 0,
          message: missing.length === 0 
            ? 'Tailwind config includes semantic colors' 
            : `Missing colors in config: ${missing.join(', ')}`
        };
      }
    },
    
    {
      name: 'Theme Provider Exists',
      test: () => {
        const exists = fs.existsSync('components/theme/theme-provider.tsx');
        return {
          passed: exists,
          message: exists 
            ? 'Theme provider component exists' 
            : 'Theme provider component missing'
        };
      }
    },
    
    {
      name: 'Theme Toggle Exists',
      test: () => {
        const exists = fs.existsSync('components/theme/twitch-style-toggle.tsx');
        return {
          passed: exists,
          message: exists 
            ? 'Twitch-style theme toggle exists' 
            : 'Theme toggle component missing'
        };
      }
    },
    
    {
      name: 'Migration Applied',
      test: () => {
        const navbarContent = fs.readFileSync('app/(browse)/_components/navbar/index.tsx', 'utf8');
        const hasOldColors = navbarContent.includes('#252731') || navbarContent.includes('#2D2E35');
        return {
          passed: !hasOldColors,
          message: hasOldColors 
            ? 'Old hardcoded colors still present in navbar' 
            : 'Migration successfully applied to navbar'
        };
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(({ name, test }) => {
    try {
      const result = test();
      if (result.passed) {
        console.log(`✅ ${name}: ${result.message}`);
        passed++;
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All theme system tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test theme switching in the UI');
    console.log('3. Verify text contrast in both light and dark modes');
    console.log('4. Check mobile responsiveness');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
  }
}

if (require.main === module) {
  testThemeSystem();
}

module.exports = { testThemeSystem };