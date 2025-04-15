const fs = require('fs');
const path = require('path');

// Function to recursively list all .ts files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all TypeScript files in the project
const allTsFiles = findTsFiles('./app');

// Incorrect import pattern to fix
const incorrectImport = "import authOptions from '@/lib/auth'";
// Correct import pattern
const correctImport = "import { authOptions } from '@/lib/auth.config'";

let fixedCount = 0;

// Process each file
allTsFiles.forEach(filePath => {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains the incorrect import
    if (content.includes(incorrectImport)) {
      // Replace the incorrect import with the correct one
      content = content.replace(incorrectImport, correctImport);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log(`Fixed import in: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
});

console.log(`Import fix script completed. Fixed ${fixedCount} files.`); 