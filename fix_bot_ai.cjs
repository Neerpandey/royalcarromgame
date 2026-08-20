const fs = require('fs');
let code = fs.readFileSync('src/physics/botAI.ts', 'utf8');

// Find the block starting with try { // Attempt to use Gemini API and ending before // Apply difficulty noise
const startMarker = "// Attempt to use Gemini API to select the best shot among the top 5";
const endMarker = "// Apply difficulty noise";

if (code.includes(startMarker) && code.includes(endMarker)) {
  const startIndex = code.indexOf(startMarker);
  const endIndex = code.indexOf(endMarker);
  code = code.substring(0, startIndex) + code.substring(endIndex);
  fs.writeFileSync('src/physics/botAI.ts', code);
  console.log("Bot AI fixed (removed Gemini API dependency).");
} else {
  console.log("Could not find markers.");
}
