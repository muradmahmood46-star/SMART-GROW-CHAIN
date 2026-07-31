const fs = require('fs');

const dashboardPath = 'frontend/src/pages/Dashboard.js';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');
dashboard = dashboard.replace(/const \[epAccounts, setEpAccounts\] = useState\(\[\]\);\n?/g, '');
dashboard = dashboard.replace(/const \[plans, setPlans\] = useState\(\[\]\);\n?/g, '');
dashboard = dashboard.replace(/const \[adWelcomeMsg, setAdWelcomeMsg\] = useState\(''\);\n?/g, '');
dashboard = dashboard.replace(/const \[adSectionMsg, setAdSectionMsg\] = useState\(''\);\n?/g, '');
dashboard = dashboard.replace(/import HeroSlider from '\.\.\/components\/HeroSlider';\n?/g, '');
fs.writeFileSync(dashboardPath, dashboard);

const regPath = 'frontend/src/pages/Register.js';
let reg = fs.readFileSync(regPath, 'utf8');
reg = reg.replace(/const \[maskedEmail, setMaskedEmail\] = useState\(''\);\n?/g, '');
fs.writeFileSync(regPath, reg);

const backPath = 'frontend/src/services/hooks/useBackNavigation.js';
let back = fs.readFileSync(backPath, 'utf8');
back = back.replace(/const \[isMobile, setIsMobile\] = useState\(window\.innerWidth <= 768\);\n?/g, '');
back = back.replace(/setIsMobile\(window\.innerWidth <= 768\);\n?/g, '');
fs.writeFileSync(backPath, back);
