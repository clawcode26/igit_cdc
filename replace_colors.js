const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('src/app/dashboard/admin');

const replacements = [
  { regex: /'#FFFFFF'/g, replace: "'var(--surface-primary)'" },
  { regex: /background:\s*'white'/g, replace: "background: 'var(--surface-primary)'" },
  { regex: /'#F9FAFB'/g, replace: "'var(--surface-secondary)'" },
  { regex: /'#f8f9fa'/gi, replace: "'var(--surface-secondary)'" },
  { regex: /'#FDEDED'/gi, replace: "'var(--accent-admin-bg)'" },
  { regex: /'#E7F4F0'/gi, replace: "'var(--status-success-bg)'" },
  { regex: /'#E8F0F9'/gi, replace: "'var(--accent-faculty-bg)'" },
  { regex: /'#EEEDF9'/gi, replace: "'var(--accent-hod-bg)'" },
  { regex: /'rgba\\(83,\\s*74,\\s*183,\\s*0.05\\)'/g, replace: "'var(--accent-hod-bg)'" },
  { regex: /'rgba\\(226,\\s*75,\\s*74,\\s*0.05\\)'/g, replace: "'var(--accent-admin-bg)'" },
  { regex: /'rgba\\(15,\\s*110,\\s*86,\\s*0.05\\)'/g, replace: "'var(--status-success-bg)'" },
  { regex: /'#F0F9FF'/gi, replace: "'var(--surface-secondary)'" },
  { regex: /'#E2E8F0'/gi, replace: "'var(--border-color)'" },
  { regex: /'#0F172A'/gi, replace: "'var(--text-primary)'" },
  { regex: /'#334155'/gi, replace: "'var(--text-primary)'" },
  { regex: /'#64748B'/gi, replace: "'var(--text-secondary)'" },
  { regex: /'#94A3B8'/gi, replace: "'var(--text-tertiary)'" },
  { regex: /'#CBD5E1'/gi, replace: "'var(--text-tertiary)'" },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
