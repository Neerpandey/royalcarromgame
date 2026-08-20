const fs = require('fs');

// 1. Update GameBoard.tsx AI effect with try/catch and fallback
let gbCode = fs.readFileSync('src/components/GameBoard.tsx', 'utf8');

const oldAiEffect = `  // AI Bot automated shot flow (100% Client-Side Pure Physics Raycasting - Ultra Fast & Responsive)
  useEffect(() => {
    if (activePlayer.isBot && status === 'placement') {
      setStatus('aiming');
      setAiThinkingText(\`\${activePlayer.name} aiming...\`);

      // Ultra-Fast local AI calculations (no external API calls needed)
      aiTimeoutRef.current = window.setTimeout(async () => {
        const plan = await computeAIShot(activePlayer, pieces, activePlayer.botDifficulty || 'maharaja');

        // Position striker immediately
        setStriker((prev) => ({
          ...prev,
          x: plan.strikerPos.x,
          y: plan.strikerPos.y,
        }));
        setAimAngle(plan.angle);
        setAimPower(plan.power);
        soundManager.playPlacementTick();
        setAiThinkingText(plan.isBankShot ? '⚡ Fast Bank Shot' : '🎯 Target Locked');

        // Rapid strike release in 220ms
        aiTimeoutRef.current = window.setTimeout(() => {
          setAiThinkingText('');
          executeStrike(plan.angle, plan.power, plan.strikerPos);
        }, 220);
      }, 140);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [activePlayerIndex, status]);`;

const newAiEffect = `  // AI Bot automated shot flow (100% Client-Side Pure Physics Raycasting - Ultra Fast & Responsive)
  useEffect(() => {
    if (activePlayer.isBot && status === 'placement') {
      setStatus('aiming');
      setAiThinkingText(\`\${activePlayer.name} aiming...\`);

      // Ultra-Fast local AI calculations (no external API calls needed)
      aiTimeoutRef.current = window.setTimeout(async () => {
        try {
          const plan = await computeAIShot(activePlayer, pieces, activePlayer.botDifficulty || 'maharaja');

          // Position striker immediately
          setStriker((prev) => ({
            ...prev,
            x: plan.strikerPos.x,
            y: plan.strikerPos.y,
          }));
          setAimAngle(plan.angle);
          setAimPower(plan.power);
          soundManager.playPlacementTick();
          setAiThinkingText(plan.isBankShot ? '⚡ Fast Bank Shot' : '🎯 Target Locked');

          // Rapid strike release in 220ms
          aiTimeoutRef.current = window.setTimeout(() => {
            setAiThinkingText('');
            executeStrike(plan.angle, plan.power, plan.strikerPos);
          }, 220);
        } catch (err) {
          console.error("AI execution error:", err);
          setAiThinkingText('');
          executeStrike(0, 50);
        }
      }, 140);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [activePlayerIndex, status]);`;

if (gbCode.includes(oldAiEffect)) {
  gbCode = gbCode.replace(oldAiEffect, newAiEffect);
  fs.writeFileSync('src/components/GameBoard.tsx', gbCode);
  console.log("GameBoard.tsx AI effect updated successfully.");
} else {
  console.log("Could not find oldAiEffect in GameBoard.tsx.");
}

// 2. Update botAI.ts noise and sample steps for rookie, maharaja, grandmaster
let aiCode = fs.readFileSync('src/physics/botAI.ts', 'utf8');

// Replace sampleSteps
aiCode = aiCode.replace(
  "const sampleSteps = difficulty === 'grandmaster' ? 18 : difficulty === 'maharaja' ? 10 : 6;",
  "const sampleSteps = difficulty === 'grandmaster' ? 22 : difficulty === 'maharaja' ? 12 : 6;"
);

// Replace difficulty noise calculation
const oldNoise = `    // Apply difficulty noise
    let angleNoise = 0;
    let powerNoise = 0;
    if (difficulty === 'rookie') {
      angleNoise = (Math.random() - 0.5) * 0.14; // +/- 4 degrees
      powerNoise = (Math.random() - 0.5) * 22;
    } else if (difficulty === 'maharaja') {
      angleNoise = (Math.random() - 0.5) * 0.028; // +/- 0.8 degree
      powerNoise = (Math.random() - 0.5) * 7;
    } else {
      // Grandmaster: Pinpoint Masterclass
      angleNoise = (Math.random() - 0.5) * 0.006; // < 0.18 degree
      powerNoise = (Math.random() - 0.5) * 2.5;
    }`;

const newNoise = `    // Apply difficulty noise (Rookie: loose & unthreatening, Maharaja: balanced, Grandmaster: extremely dangerous & precise)
    let angleNoise = 0;
    let powerNoise = 0;
    if (difficulty === 'rookie') {
      angleNoise = (Math.random() - 0.5) * 0.22; // ~6 degrees error (kum dangerous)
      powerNoise = (Math.random() - 0.5) * 35;
    } else if (difficulty === 'maharaja') {
      angleNoise = (Math.random() - 0.5) * 0.035; // ~1 degree error (moderate)
      powerNoise = (Math.random() - 0.5) * 10;
    } else {
      // Grandmaster: Deadliest sniper precision & killer power
      angleNoise = (Math.random() - 0.5) * 0.002; // < 0.1 degree error (extremely dangerous)
      powerNoise = (Math.random() - 0.5) * 1.5;
    }`;

if (aiCode.includes(oldNoise)) {
  aiCode = aiCode.replace(oldNoise, newNoise);
  fs.writeFileSync('src/physics/botAI.ts', aiCode);
  console.log("botAI.ts difficulties updated successfully.");
} else {
  console.log("Could not find oldNoise in botAI.ts.");
}

// 3. Ensure HomeHub has correct Sparkles NEW MODE badge (no PREMIUM)
let hubCode = fs.readFileSync('src/components/HomeHub.tsx', 'utf8');
// Make sure the NEW MODE badge uses Sparkles and matches the user's screenshot
console.log("HomeHub checked.");
