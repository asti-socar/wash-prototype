import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const historyPath = path.join(__dirname, 'constants/updateHistory.js');
const publicPath = path.join(__dirname, '../public/version.json');

try {
  const historyContent = fs.readFileSync(historyPath, 'utf8');
  
  // Extract first ID from BROWN_HISTORY
  const brownMatch = historyContent.match(/export const BROWN_HISTORY = \[\s*\{\s*id:\s*(\d+)/);
  // Extract first ID from ASTI_HISTORY
  const astiMatch = historyContent.match(/export const ASTI_HISTORY = \[\s*\{\s*id:\s*(\d+)/);

  const brownId = brownMatch ? parseInt(brownMatch[1], 10) : 0;
  const astiId = astiMatch ? parseInt(astiMatch[1], 10) : 0;
  const latestId = brownId + astiId;
  
  if (latestId > 0) {
    const versionData = { latestId };
    
    fs.writeFileSync(publicPath, JSON.stringify(versionData, null, 2));
    console.log(`[Version] Updated version.json with latestId: ${latestId} (Brown: ${brownId} + Asti: ${astiId})`);
  } else {
    console.error('[Version] Could not find history IDs in updateHistory.js');
  }
} catch (err) {
  console.error('[Version] Error generating version.json:', err);
}