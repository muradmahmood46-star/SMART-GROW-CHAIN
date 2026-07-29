const fs = require('fs');
const path = require('path').join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.js');

let content = fs.readFileSync(path, 'utf8');
const hasCRLF = content.includes('\r\n');
const nl = hasCRLF ? '\r\n' : '\n';
let lines = content.split(/\r\n|\r|\n/);

console.log('Lines before:', lines.length);

// Remove second duplicate minCampaignUsers useState
let mcCount = 0;
lines = lines.filter(line => {
  if (line.trim().startsWith('const [minCampaignUsers') && line.includes('useState(50)')) {
    mcCount++;
    if (mcCount === 2) { console.log('Removed duplicate minCampaignUsers'); return false; }
  }
  return true;
});

// Remove second duplicate freePlanNotifShown useEffect block
let fpCount = 0;
let blockStart = -1, blockEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("sessionStorage.getItem('freePlanNotifShown')")) {
    fpCount++;
    if (fpCount === 2) {
      blockStart = i - 2;
      while (blockStart > 0 && !lines[blockStart].includes('useEffect')) blockStart--;
      blockEnd = i + 7;
      while (blockEnd < lines.length && !lines[blockEnd].trim().match(/^\}.*\[\]\s*\)/)) blockEnd++;
      console.log('Removing useEffect block lines', blockStart+1, 'to', blockEnd+1);
      lines.splice(blockStart, blockEnd - blockStart + 1);
      break;
    }
  }
}

// Remove duplicate validation line
let vcCount = 0;
lines = lines.filter(line => {
  if (line.includes('Minimum') && line.includes('minCampaignUsers') && line.includes('users required')) {
    vcCount++;
    if (vcCount === 2) { console.log('Removed duplicate validation line'); return false; }
  }
  return true;
});

console.log('Lines after:', lines.length);
fs.writeFileSync(path, lines.join(nl), 'utf8');
console.log('Saved OK');
