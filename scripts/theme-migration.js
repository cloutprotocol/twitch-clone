#!/usr/bin/env node

/**
 * Theme Migration Script
 * Helps automate the migration from hardcoded colors to semantic tokens
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color mappings for automatic replacement
const colorMappings = {
  // Background colors
  'bg-\\[#252731\\]': 'bg-background-secondary',
  'bg-\\[#2D2E35\\]': 'bg-background-tertiary',
  'bg-\\[#0e0e10\\]': 'bg-background-primary',
  'bg-neutral-900/80': 'bg-background-primary',
  
  // Border colors
  'border-\\[#2D2E35\\]': 'border-border-primary',
  'border-\\[#252731\\]': 'border-border-secondary',
  
  // Text colors
  'text-muted-foreground': 'text-text-secondary',
  'text-gray-400': 'text-text-tertiary',
  'text-white': 'text-text-inverse',
  
  // Interactive colors
  'bg-blue-600': 'bg-interactive-primary',
  'hover:bg-blue-600/80': 'hover:bg-interactive-hover',
  'bg-red-500': 'bg-status-error',
  'text-red-500': 'text-status-error',
};

// File patterns to process
const filePatterns = [
  'app/**/*.tsx',
  'components/**/*.tsx',
  'app/**/*.ts',
  'components/**/*.ts',
];

function findFiles(pattern) {
  try {
    const result = execSync(`find . -path "./node_modules" -prune -o -name "${pattern}" -type f -print`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.warn(`Warning: Could not find files matching ${pattern}`);
    return [];
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply color mappings
    for (const [oldPattern, newValue] of Object.entries(colorMappings)) {
      const regex = new RegExp(oldPattern, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newValue);
        modified = true;
        console.log(`  ✓ Replaced ${oldPattern} with ${newValue}`);
      }
    }
    
    // Update import statements
    if (content.includes('from "@/lib/utils"') && content.includes('cn(')) {
      content = content.replace(
        'import { cn } from "@/lib/utils"',
        'import { cn } from "@/lib/theme-utils"'
      );
      modified = true;
      console.log('  ✓ Updated import to use theme-utils');
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎨 Starting theme migration...\n');
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  // Process TypeScript/TSX files
  for (const pattern of ['*.tsx', '*.ts']) {
    const files = findFiles(pattern);
    
    for (const file of files) {
      // Skip node_modules and other irrelevant directories
      if (file.includes('node_modules') || file.includes('.next') || file.includes('.git')) {
        continue;
      }
      
      totalFiles++;
      console.log(`Processing: ${file}`);
      
      if (processFile(file)) {
        modifiedFiles++;
      }
    }
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`📊 Processed ${totalFiles} files`);
  console.log(`🔄 Modified ${modifiedFiles} files`);
  
  if (modifiedFiles > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Review the changes with git diff');
    console.log('2. Test your application thoroughly');
    console.log('3. Update any remaining hardcoded colors manually');
    console.log('4. Consider adding theme toggle to your UI');
  }
}

if (require.main === module) {
  main();
}

module.exports = { colorMappings, processFile };