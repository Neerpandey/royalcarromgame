const fs = require('fs');
let code = fs.readFileSync('src/components/CarromCanvas.tsx', 'utf8');

const regex = /function drawFeltSurface.*?\}\n/s;
// wait, that might not match the whole function because of nested braces.
