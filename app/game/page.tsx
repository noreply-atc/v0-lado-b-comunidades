'use client';

export default function GamePage() {
  return (
    <div
      id="game-root"
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
      dangerouslySetInnerHTML={{
        __html: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>ATC Campus</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    touch-action: none;
  }
  #header {
    position: fixed;
    top: 0; left: 0; right: 0;
    background: rgba(0,0,0,0.85);
    border-bottom: 2px solid #00ff88;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
  }
  #header h1 {
    color: #00ff88;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  #discovered {
    color: #00ff88;
    font-size: 12px;
    background: rgba(0,255,136,0.1);
    border: 1px solid #00ff88;
    padding: 4px 10px;
    border-radius: 4px;
  }
  #gameContainer {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #2d5a27;
  }
  canvas {
    display: block;
    image-rendering: pixelated;
  }
  #popup {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: rgba(10,10,10,0.95);
    border: 2px solid #00ff88;
    border-radius: 8px;
    padding: 14px 20px;
    color: white;
    text-align: center;
    z-index: 200;
    min-width: 220px;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  }
  #popup.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: all;
  }
  #popup h3 { color: #00ff88; font-size: 13px; margin-bottom: 4px; letter-spacing: 1px; }
  #popup p { font-size: 11px; color: #aaa; margin-bottom: 10px; }
  #popup button {
    background: #00ff88;
    color: #000;
    border: none;
    padding: 6px 16px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 11px;
    cursor: pointer;
    border-radius: 4px;
    letter-spacing: 1px;
  }
  #joystick-container {
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 150;
  }
  #joystick-base {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(0,255,136,0.08);
    border: 2px solid rgba(0,255,136,0.3);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #joystick-thumb {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0,255,136,0.6);
    border: 2px solid #00ff88;
    position: absolute;
    transition: none;
    touch-action: none;
  }
  #interact-btn {
    position: fixed;
    bottom: 45px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(0,255,136,0.15);
    border: 2px solid #00ff88;
    color: #00ff88;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    z-index: 150;
  }
</style>
</head>
<body>

<div id="header">
  <h1>⬡ ATC Campus</h1>
  <div id="discovered">0/8 explorado</div>
</div>

<div id="gameContainer">
  <canvas id="gameCanvas"></canvas>
</div>

<div id="popup">
  <h3 id="popup-name">ZONA</h3>
  <p id="popup-desc">Descripción</p>
  <button id="popup-btn">ENTRAR →</button>
</div>

<div id="joystick-container">
  <div id="joystick-base">
    <div id="joystick-thumb"></div>
  </div>
</div>

<button id="interact-btn">A</button>

<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 32;
const WORLD_W = 40;
const WORLD_H = 40;
const WORLD_PX = WORLD_W * TILE;
const WORLD_PY = WORLD_H * TILE;

const COLORS = {
  grass:      '#3a7d44',
  grassDark:  '#2d6035',
  path:       '#c8a96e',
  pathEdge:   '#b8955a',
  building:   '#2c3e50',
  buildingAlt:'#1a252f',
  roof:       '#1a6b3a',
  roofAlt:    '#0d4a28',
  accent:     '#00ff88',
  accentDim:  '#007744',
  water:      '#1a6699',
  waterLight: '#2288bb',
  tree1:      '#2d7a35',
  tree2:      '#1f5a27',
  treeTop:    '#3d9e47',
  shadow:     'rgba(0,0,0,0.35)',
  white:      '#ffffff',
  yellow:     '#ffd700',
};

const zones = [
  { id:'stadium',   name:'ATC Stadium',      desc:'Hub central de todas las comunidades', x:17, y:13, w:6, h:6,  color:'#1a6b8a', discovered:false },
  { id:'padel',     name:'Bejota Pádel',     desc:'Comunidad de pádel · 340 jugadores',  x:3,  y:4,  w:6, h:4,  color:'#1a6b3a', discovered:false },
  { id:'babolat',   name:'Babolat Remeros',  desc:'Club de remo · 120 miembros',         x:3,  y:13, w:5, h:3,  color:'#1a3a6b', discovered:false },
  { id:'blue',      name:'Blue Fútbol Club', desc:'Fútbol recreativo · 280 jugadores',   x:31, y:4,  w:6, h:4,  color:'#6b1a1a', discovered:false },
  { id:'tennis',    name:'Tennis Academy',   desc:'Academia de tenis · 95 alumnos',      x:31, y:15, w:5, h:4,  color:'#6b5a1a', discovered:false },
  { id:'caba',      name:'CABA',             desc:'Comunidad zona CABA · 450 jugadores', x:18, y:25, w:5, h:4,  color:'#4a1a6b', discovered:false },
  { id:'formosa',   name:'Formosa',          desc:'Comunidad Formosa · 180 jugadores',   x:8,  y:28, w:5, h:3,  color:'#6b3a1a', discovered:false },
  { id:'cordoba',   name:'Córdoba',          desc:'Comunidad Córdoba · 310 jugadores',   x:23, y:28, w:5, h:3,  color:'#1a5a6b', discovered:false },
];

const player = {
  x: WORLD_PX / 2,
  y: WORLD_PY / 2,
  w: 16, h: 20,
  speed: 2.5,
  vx: 0, vy: 0,
  dir: 'down',
  frame: 0,
  frameTimer: 0,
  frameDelay: 8,
  moving: false,
};

const cam = { x: 0, y: 0 };

const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup',   e => keys[e.key] = false);

const joystickBase  = document.getElementById('joystick-base');
const joystickThumb = document.getElementById('joystick-thumb');
const joyBaseRect = () => joystickBase.getBoundingClientRect();
let joyActive = false;
let joyDx = 0, joyDy = 0;
const JOY_MAX = 28;

function joyMove(cx, cy) {
  const r = joyBaseRect();
  const ox = cx - (r.left + r.width/2);
  const oy = cy - (r.top  + r.height/2);
  const dist = Math.sqrt(ox*ox + oy*oy);
  const clamped = Math.min(dist, JOY_MAX);
  const angle = Math.atan2(oy, ox);
  joyDx = Math.cos(angle) * clamped / JOY_MAX;
  joyDy = Math.sin(angle) * clamped / JOY_MAX;
  joystickThumb.style.transform =
    \`translate(\${Math.cos(angle)*clamped}px, \${Math.sin(angle)*clamped}px)\`;
}

joystickBase.addEventListener('touchstart', e => {
  e.preventDefault(); joyActive = true;
  joyMove(e.touches[0].clientX, e.touches[0].clientY);
}, {passive:false});
joystickBase.addEventListener('touchmove', e => {
  e.preventDefault(); joyMove(e.touches[0].clientX, e.touches[0].clientY);
}, {passive:false});
['touchend','touchcancel'].forEach(ev =>
  joystickBase.addEventListener(ev, e => {
    e.preventDefault(); joyActive = false; joyDx = 0; joyDy = 0;
    joystickThumb.style.transform = 'translate(0,0)';
  }, {passive:false})
);

let currentZone = null;
let discoveredCount = 0;

function showPopup(zone) {
  if (currentZone === zone) return;
  currentZone = zone;
  document.getElementById('popup-name').textContent = zone.name;
  document.getElementById('popup-desc').textContent = zone.desc;
  document.getElementById('popup').classList.add('show');

  if (!zone.discovered) {
    zone.discovered = true;
    discoveredCount++;
    document.getElementById('discovered').textContent =
      \`\${discoveredCount}/8 explorado\`;
  }
}
function hidePopup() {
  currentZone = null;
  document.getElementById('popup').classList.remove('show');
}

document.getElementById('popup-btn').addEventListener('click', () => {
  if (currentZone) alert(\`Entrando a \${currentZone.name}…\\n(Aquí iría la experiencia de comunidad)\`);
});
document.getElementById('interact-btn').addEventListener('click', () => {
  if (currentZone) document.getElementById('popup-btn').click();
});

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawTree(x, y) {
  drawPixelRect(x+5, y+10, 6, 8, '#5a3a1a');
  ctx.fillStyle = COLORS.tree2;
  ctx.beginPath();
  ctx.arc(x+8, y+8, 9, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = COLORS.tree1;
  ctx.beginPath();
  ctx.arc(x+8, y+6, 8, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = COLORS.treeTop;
  ctx.beginPath();
  ctx.arc(x+6, y+4, 4, 0, Math.PI*2);
  ctx.fill();
}

function drawBuilding(zone, cx, cy) {
  const bx = zone.x * TILE - cx;
  const by = zone.y * TILE - cy;
  const bw = zone.w * TILE;
  const bh = zone.h * TILE;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(bx+4, by+4, bw, bh);

  ctx.fillStyle = zone.color;
  ctx.fillRect(bx, by, bw, bh);

  ctx.fillStyle = shadeColor(zone.color, -30);
  ctx.fillRect(bx, by, bw, 6);

  if (zone.discovered) {
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx+1, by+1, bw-2, bh-2);
  }

  const dx = bx + bw/2 - 6;
  const dy = by + bh - 14;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(dx, dy, 12, 14);
  ctx.fillStyle = COLORS.accentDim;
  ctx.fillRect(dx+1, dy+1, 10, 12);

  ctx.fillStyle = 'rgba(255,255,200,0.7)';
  ctx.fillRect(bx+6,  by+10, 8, 6);
  ctx.fillRect(bx+bw-14, by+10, 8, 6);

  ctx.fillStyle = zone.discovered ? COLORS.accent : 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 8px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(zone.name, bx + bw/2, by - 4);
}

function shadeColor(hex, amt) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (n>>16)+amt));
  const g = Math.min(255, Math.max(0, ((n>>8)&0xff)+amt));
  const b = Math.min(255, Math.max(0, (n&0xff)+amt));
  return \`rgb(\${r},\${g},\${b})\`;
}

function drawPlayer(px, py) {
  const x = Math.floor(px - player.w/2);
  const y = Math.floor(py - player.h/2);
  const f = player.frame;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x+8, y+player.h+2, 7, 3, 0, 0, Math.PI*2);
  ctx.fill();

  const bodyColor = '#2255aa';
  const skinColor = '#f5c89a';
  const hairColor = '#1a1a1a';
  const shoeColor = '#222';

  const legOff = player.moving ? Math.sin(player.frame * 0.8) * 3 : 0;
  ctx.fillStyle = shoeColor;
  ctx.fillRect(x+3,  y+14, 4, 5);
  ctx.fillRect(x+9,  y+14, 4, 5);
  ctx.fillStyle = '#1a3a7a';
  ctx.fillRect(x+3,  y+11+legOff, 4, 5);
  ctx.fillRect(x+9,  y+11-legOff, 4, 5);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x+2, y+7, 12, 7);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x,   y+7+legOff, 3, 6);
  ctx.fillStyle = skinColor;
  ctx.fillRect(x,   y+13+legOff, 3, 3);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x+13, y+7-legOff, 3, 6);
  ctx.fillStyle = skinColor;
  ctx.fillRect(x+13, y+13-legOff, 3, 3);

  ctx.fillStyle = skinColor;
  ctx.fillRect(x+3, y+1, 10, 9);

  ctx.fillStyle = hairColor;
  ctx.fillRect(x+3, y+1, 10, 4);
  ctx.fillRect(x+1, y+3, 3, 2);
  ctx.fillRect(x+12, y+3, 3, 2);

  ctx.fillStyle = '#222';
  if (player.dir === 'down' || player.dir === 'left' || player.dir === 'right') {
    ctx.fillRect(x+5, y+6, 2, 2);
    ctx.fillRect(x+9, y+6, 2, 2);
  }

  ctx.fillStyle = COLORS.accent;
  ctx.font = 'bold 5px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('ATC', x+8, y+13);
}

function drawWorld(cx, cy) {
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let ty = 0; ty < WORLD_H; ty++) {
    for (let tx = 0; tx < WORLD_W; tx++) {
      const wx = tx * TILE - cx;
      const wy = ty * TILE - cy;
      if (wx > canvas.width || wy > canvas.height || wx < -TILE || wy < -TILE) continue;
      if ((tx + ty) % 2 === 0) {
        ctx.fillStyle = COLORS.grassDark;
        ctx.fillRect(wx, wy, TILE, TILE);
      }
    }
  }

  const pathMidX = (WORLD_W/2) * TILE - cx - TILE;
  const pathMidY = (WORLD_H/2) * TILE - cy - TILE;
  const pathW = TILE * 3;

  ctx.fillStyle = COLORS.path;
  ctx.fillRect(0, pathMidY, canvas.width, pathW);
  ctx.fillRect(pathMidX, 0, pathW, canvas.height);

  ctx.fillStyle = COLORS.pathEdge;
  ctx.fillRect(0, pathMidY, canvas.width, 3);
  ctx.fillRect(0, pathMidY + pathW - 3, canvas.width, 3);
  ctx.fillRect(pathMidX, 0, 3, canvas.height);
  ctx.fillRect(pathMidX + pathW - 3, 0, 3, canvas.height);

  const fx = WORLD_W/2 * TILE - cx + TILE/2;
  const fy = WORLD_H/2 * TILE - cy + TILE/2;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(fx+2, fy+2, 20, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = COLORS.water;
  ctx.beginPath(); ctx.arc(fx, fy, 20, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = COLORS.waterLight;
  ctx.beginPath(); ctx.arc(fx, fy, 14, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.arc(fx-3, fy-5, 4, 0, Math.PI*2); ctx.fill();

  const treePts = [
    [5,7],[9,7],[14,7],[25,7],[30,7],[35,7],
    [5,18],[14,18],[25,18],[35,18],
    [5,24],[14,24],[25,24],[35,24],
    [5,32],[9,32],[14,32],[25,32],[30,32],[35,32],
  ];
  treePts.forEach(([tx,ty]) => {
    const wx = tx * TILE - cx;
    const wy = ty * TILE - cy;
    if (wx > -20 && wx < canvas.width+20 && wy > -20 && wy < canvas.height+20)
      drawTree(wx, wy);
  });

  zones.forEach(z => drawBuilding(z, cx, cy));
}

function checkZoneCollision() {
  const px = player.x;
  const py = player.y;
  for (const z of zones) {
    const zx1 = z.x * TILE;
    const zy1 = z.y * TILE;
    const zx2 = (z.x + z.w) * TILE;
    const zy2 = (z.y + z.h) * TILE;
    const margin = 12;
    if (px > zx1 - margin && px < zx2 + margin &&
        py > zy1 - margin && py < zy2 + margin) {
      showPopup(z);
      return;
    }
  }
  hidePopup();
}

function collidesWithBuilding(nx, ny) {
  for (const z of zones) {
    const zx1 = z.x * TILE + 4;
    const zy1 = z.y * TILE + 4;
    const zx2 = (z.x + z.w) * TILE - 4;
    const zy2 = (z.y + z.h) * TILE - 4;
    if (nx > zx1 && nx < zx2 && ny > zy1 && ny < zy2) return true;
  }
  return false;
}

let lastTime = 0;

function update(dt) {
  let dx = 0, dy = 0;

  if (keys['ArrowLeft']  || keys['a']) dx -= 1;
  if (keys['ArrowRight'] || keys['d']) dx += 1;
  if (keys['ArrowUp']    || keys['w']) dy -= 1;
  if (keys['ArrowDown']  || keys['s']) dy += 1;

  if (joyActive) { dx = joyDx; dy = joyDy; }

  const len = Math.sqrt(dx*dx + dy*dy);
  if (len > 0) { dx /= Math.max(len,1); dy /= Math.max(len,1); }

  const spd = player.speed;
  const nx = player.x + dx * spd;
  const ny = player.y + dy * spd;

  if (nx > 16 && nx < WORLD_PX - 16 && !collidesWithBuilding(nx, player.y))
    player.x = nx;
  if (ny > 16 && ny < WORLD_PY - 16 && !collidesWithBuilding(player.x, ny))
    player.y = ny;

  player.moving = len > 0.1;

  if (player.moving) {
    if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? 'right' : 'left';
    else player.dir = dy > 0 ? 'down' : 'up';

    player.frameTimer++;
    if (player.frameTimer >= player.frameDelay) {
      player.frame = (player.frame + 1) % 4;
      player.frameTimer = 0;
    }
  } else {
    player.frame = 0;
  }

  const targetCX = player.x - canvas.width/2;
  const targetCY = player.y - canvas.height/2;
  cam.x += (targetCX - cam.x) * 0.12;
  cam.y += (targetCY - cam.y) * 0.12;
  cam.x = Math.max(0, Math.min(WORLD_PX - canvas.width, cam.x));
  cam.y = Math.max(0, Math.min(WORLD_PY - canvas.height, cam.y));

  checkZoneCollision();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld(Math.floor(cam.x), Math.floor(cam.y));
  const screenX = player.x - cam.x;
  const screenY = player.y - cam.y;
  drawPlayer(screenX, screenY);
}

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 16.67, 3);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});

requestAnimationFrame(loop);
</script>

</body>
</html>
        `,
      }}
    />
  );
}
