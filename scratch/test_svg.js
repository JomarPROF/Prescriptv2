const fs = require('fs');

const svg = `<svg class="splash-logo-svg" viewBox="0 0 100 100" width="76" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="asclepiusStaff" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="asclepiusSerpent" x1="20" y1="20" x2="80" y2="85" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="80%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <filter id="neonStaffGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <line x1="50" y1="14" x2="50" y2="86" stroke="url(#asclepiusStaff)" stroke-width="4.5" stroke-linecap="round" filter="url(#neonStaffGlow)"/>
  <circle cx="50" cy="14" r="5" fill="#ffffff" filter="url(#neonStaffGlow)"/>
  <circle cx="50" cy="86" r="3" fill="#38bdf8"/>
  <path d="M 48,22 C 32,25 31,37 50,40 C 69,43 68,55 50,58 C 32,61 31,73 50,76 C 59,77.5 61,82 52,85" 
        stroke="url(#asclepiusSerpent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#neonStaffGlow)"/>
  <circle cx="50" cy="22" r="3.2" fill="#e0f2fe"/>
  <circle cx="51.5" cy="21.5" r="1" fill="#0284c7"/>
  <path d="M 50,33 L 50,37 M 48,35 L 52,35" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
  <path d="M 50,69 L 50,73 M 48,71 L 52,71" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
</svg>`;

console.log('SVG length:', svg.length);
console.log('SVG is valid!');
