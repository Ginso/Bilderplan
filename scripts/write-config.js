const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'public', 'config.js');
const fallbackMatch = /urlForQuery\s*:\s*['"]([^'"]*)['"]/m;

let fallbackUrl = '';

if (fs.existsSync(configPath)) {
  const existing = fs.readFileSync(configPath, 'utf8');
  const match = existing.match(fallbackMatch);
  if (match) fallbackUrl = match[1];
}

const envUrl = process.env.REACT_APP_URL_FOR_QUERY || fallbackUrl;

const content = `window.__BILDERPLAN_CONFIG__ = {
\turlForQuery: ${JSON.stringify(envUrl)},
};\n`;

fs.writeFileSync(configPath, content, 'utf8');
console.log(`Generated public/config.js with urlForQuery=${JSON.stringify(envUrl)}`);
