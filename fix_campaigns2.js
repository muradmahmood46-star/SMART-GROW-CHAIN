const fs = require('fs');
const path = require('path').join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.js');
let c = fs.readFileSync(path, 'utf8');
const nl = c.includes('\r\n') ? '\r\n' : '\n';
let lines = c.split(/\r\n|\n/);

// Fix 1: Change reactivate condition from (isRejected||isCompleted) to show for ALL
// Line 1614 (index 1613): {(isRejected||isCompleted) && (
lines[1613] = "                              {true && (";

// Fix 2: Remove padding from old reactivate button, add padding:'13px' and boxShadow
// Line 1622 (index 1621): the style
lines[1621] = "                                }} style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:'0 2px 12px rgba(124,58,237,.35)'}}>\"";

fs.writeFileSync(path, lines.join(nl), 'utf8');
console.log('Done. Lines:', lines.length);
