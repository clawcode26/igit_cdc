const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/admin/offerings/AdminOfferingsClient.tsx', 'utf8');

const replacements = [
  { regex: /bg-\\[#FAFBFC\\]/g, replace: 'bg-[var(--surface-tertiary)]' },
  { regex: /bg-white/g, replace: 'bg-[var(--surface-primary)]' },
  { regex: /bg-\\[#F4F5F7\\]/g, replace: 'bg-[var(--surface-secondary)]' },
  { regex: /bg-slate-50/g, replace: 'bg-[var(--surface-secondary)]' },
  { regex: /bg-slate-100/g, replace: 'bg-[var(--surface-secondary)]' },
  { regex: /bg-slate-200/g, replace: 'bg-[var(--surface-secondary)]' },
  { regex: /bg-slate-300/g, replace: 'bg-[var(--border-strong)]' },
  
  { regex: /text-\\[#172B4D\\]/g, replace: 'text-[var(--text-primary)]' },
  { regex: /text-\\[#5E6C84\\]/g, replace: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-400/g, replace: 'text-[var(--text-tertiary)]' },
  { regex: /text-slate-500/g, replace: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-600/g, replace: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-700/g, replace: 'text-[var(--text-primary)]' },
  
  { regex: /border-slate-100/g, replace: 'border-[var(--border-color)]' },
  { regex: /border-slate-200/g, replace: 'border-[var(--border-color)]' },
  { regex: /border-slate-300/g, replace: 'border-[var(--border-strong)]' },

  { regex: /bg-\\[#0052CC\\]/g, replace: 'bg-[var(--accent-admin)]' },
  { regex: /hover:bg-\\[#0047b3\\]/g, replace: 'hover:opacity-90' },
  { regex: /border-\\[#0052CC\\]/g, replace: 'border-[var(--accent-admin)]' },
  { regex: /text-\\[#0052CC\\]/g, replace: 'text-[var(--accent-admin)]' },
  
  { regex: /'#172B4D'/g, replace: "'var(--text-primary)'" },
  { regex: /'#0052CC'/g, replace: "'var(--accent-admin)'" },
  { regex: /'#5E6C84'/g, replace: "'var(--text-secondary)'" },
  { regex: /'#FAFBFC'/g, replace: "'var(--surface-tertiary)'" },
  { regex: /'#F4F5F7'/g, replace: "'var(--surface-secondary)'" },
  { regex: /'#22C55E'/g, replace: "'var(--status-success)'" },
  { regex: /'#EF4444'/g, replace: "'var(--status-error)'" }
];

replacements.forEach(r => {
  content = content.replace(r.regex, r.replace);
});

fs.writeFileSync('src/app/dashboard/admin/offerings/AdminOfferingsClient.tsx', content);
console.log('Colors replaced successfully');
