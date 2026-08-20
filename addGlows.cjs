const fs = require('fs');
let code = fs.readFileSync('src/components/CarromCanvas.tsx', 'utf8');

const regexVars = /const animFrameRef = useRef<number \| null>\(null\);/g;
code = code.replace(regexVars, `const animFrameRef = useRef<number | null>(null);
  const pocketedIdsRef = useRef<Set<string>>(new Set());
  const pocketGlowsRef = useRef<{ pocketId: number; color: string; life: number; type: string }[]>([]);`);

const regexLoop = /\/\/ 3\. Draw Deep 3D Pocket Wells and Braided Mesh Nets\n      drawPockets\(ctx, theme\);/g;
code = code.replace(regexLoop, `// 3. Draw Deep 3D Pocket Wells and Braided Mesh Nets
      drawPockets(ctx, theme);

      // Track newly pocketed pieces for premium glows
      for (const p of pieces) {
        if (p.isPocketed && p.pocketId !== undefined && !pocketedIdsRef.current.has(p.id)) {
          pocketedIdsRef.current.add(p.id);
          let glowColor = 'rgba(255, 255, 255, 0.9)'; // White
          if (p.type === 'black') glowColor = 'rgba(20, 20, 20, 0.9)'; // Dark/Black
          if (p.type === 'queen') glowColor = 'rgba(255, 77, 109, 0.9)'; // Reddish pink
          if (p.type === 'striker') glowColor = 'rgba(212, 175, 55, 0.9)'; // Gold

          pocketGlowsRef.current.push({
            pocketId: p.pocketId,
            color: glowColor,
            life: 1.0,
            type: p.type
          });
        }
      }

      // Draw premium pocket highlights
      for (let i = pocketGlowsRef.current.length - 1; i >= 0; i--) {
        const glow = pocketGlowsRef.current[i];
        const pocket = POCKETS.find(p => p.id === glow.pocketId);
        if (pocket) {
          ctx.save();
          // Animated pulsating scale based on life
          const pulse = Math.sin((1 - glow.life) * Math.PI) * 15;
          const outerRadius = pocket.radius + 15 + pulse;
          
          const grad = ctx.createRadialGradient(pocket.x, pocket.y, pocket.radius, pocket.x, pocket.y, outerRadius);
          // Split alpha so it fades out
          const alpha = Math.max(0, glow.life);
          
          let colorParts = glow.color.match(/rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
          if (colorParts) {
             const r = colorParts[1];
             const g = colorParts[2];
             const b = colorParts[3];
             grad.addColorStop(0, \`rgba(\${r}, \${g}, \${b}, \${alpha * 0.8})\`);
             grad.addColorStop(0.6, \`rgba(\${r}, \${g}, \${b}, \${alpha * 0.4})\`);
             grad.addColorStop(1, \`rgba(\${r}, \${g}, \${b}, 0)\`);
          } else {
             // Fallback
             grad.addColorStop(0, glow.color);
             grad.addColorStop(1, 'rgba(0,0,0,0)');
          }

          ctx.beginPath();
          ctx.arc(pocket.x, pocket.y, outerRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Add a sharp neon ring
          if (colorParts) {
            ctx.beginPath();
            ctx.arc(pocket.x, pocket.y, pocket.radius + 5 + (1 - glow.life) * 10, 0, Math.PI * 2);
            ctx.strokeStyle = \`rgba(\${colorParts[1]}, \${colorParts[2]}, \${colorParts[3]}, \${alpha})\`;
            ctx.lineWidth = 3 * alpha;
            ctx.stroke();
          }

          ctx.restore();
        }
        
        glow.life -= 0.015; // Approx 1 second fade (1/60 * 66 frames = ~1 sec)
        if (glow.life <= 0) {
          pocketGlowsRef.current.splice(i, 1);
        }
      }`);

fs.writeFileSync('src/components/CarromCanvas.tsx', code);
console.log("Updated CarromCanvas");
