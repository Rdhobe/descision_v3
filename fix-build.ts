/**
 * This file adds debugging information to help identify build issues
 */

import fs from 'fs';
import path from 'path';

// Function to check if a file has 'use client' and react hooks
function checkFileForClientDirective(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file uses React hooks
  const hasReactHooks = content.includes('useState') || 
                        content.includes('useEffect') || 
                        content.includes('useRef') || 
                        content.includes('useContext') ||
                        content.includes('useCallback') ||
                        content.includes('useMemo') ||
                        content.includes('useReducer') ||
                        content.includes('useSession');
  
  // Check if the file has 'use client' directive
  const hasUseClientDirective = content.includes("'use client'") || content.includes('"use client"');
  
  // If the file has hooks but no 'use client' directive, it needs to be fixed
  if (hasReactHooks && !hasUseClientDirective) {
    console.log(`⚠️ ${filePath} uses React hooks but doesn't have 'use client' directive`);
    return false;
  }
  
  return true;
}

// Recursive function to process all TypeScript/TypeScriptReact files in a directory
function processDirectory(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      if (entry.name === 'route.ts' || entry.name === 'layout.tsx') continue;
      
      // Only check files in the app directory
      if (fullPath.includes('/app/') || fullPath.includes('\\app\\')) {
        checkFileForClientDirective(fullPath);
      }
    }
  }
}

// Start processing from the app directory
const appDir = path.join(process.cwd(), 'app');
console.log('Checking files in the app directory for missing "use client" directives...');
processDirectory(appDir);
console.log('Done checking files.'); 