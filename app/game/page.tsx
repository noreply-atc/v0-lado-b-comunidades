'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ==================== DATOS ====================

interface Community {
  id: string;
  name: string;
  sport: SportType;
  members: number;
  whatsapp: string;
  discovered?: boolean;
}

interface Province {
  id: string;
  name: string;
  theme: string;
  palette: { ground: string; groundAlt: string; path: string; accent: string };
  description: string;
  worldX: number;
  worldY: number;
  communities: Community[];
}

type SportType = 'padel' | 'football' | 'tennis' | 'rowing' | 'trekking' | 'ski' | 'cycling' | 'polo' | 'kayak' | 'running';

const SPORT_EMOJI: Record<SportType, string> = {
  padel: '🏸',
  football: '⚽',
  tennis: '🎾',
  rowing: '🚣',
  trekking: '🥾',
  ski: '⛷️',
  cycling: '🚴',
  polo: '🐎',
  kayak: '🛶',
  running: '🏃',
};

// World configuration - larger to fit provinces with proper spacing
const TILE = 32;
const WORLD_W = 70;
const WORLD_H = 70;
const WORLD_PX = WORLD_W * TILE;
const WORLD_PY = WORLD_H * TILE;

// Province grid: each province is 14x12 tiles, with 4-tile gaps between them
// Arranged in a rough Argentina shape around center hub
const PROVINCES: Province[] = [
  {
    id: 'caba',
    name: 'CABA',
    theme: 'urban',
    palette: { ground: '#4a4a5a', groundAlt: '#5a5a6a', path: '#6a6a7a', accent: '#ff6b35' },
    description: 'Asfalto, jacarandas, palomas, adoquines porteños',
    worldX: 38, worldY: 38, // Southeast of center
    communities: [
      { id: 'caba-padel', name: 'Padel Palermo', sport: 'padel', members: 340, whatsapp: 'https://chat.whatsapp.com/example1' },
      { id: 'caba-futbol', name: 'Futbol Caballito', sport: 'football', members: 280, whatsapp: 'https://chat.whatsapp.com/example2' },
      { id: 'caba-tenis', name: 'Tenis Belgrano', sport: 'tennis', members: 95, whatsapp: 'https://chat.whatsapp.com/example3' },
    ]
  },
  {
    id: 'cordoba',
    name: 'Cordoba',
    theme: 'sierras',
    palette: { ground: '#5a7a3a', groundAlt: '#4a6a2a', path: '#c8a96e', accent: '#8bc34a' },
    description: 'Quebrachos, condores, sierras rocosas, arroyos',
    worldX: 20, worldY: 20, // Northwest of center
    communities: [
      { id: 'cba-padel', name: 'Padel Sierras', sport: 'padel', members: 310, whatsapp: 'https://chat.whatsapp.com/example4' },
      { id: 'cba-running', name: 'Running Cordoba', sport: 'running', members: 450, whatsapp: 'https://chat.whatsapp.com/example5' },
      { id: 'cba-futbol', name: 'Futbol Nueva Cordoba', sport: 'football', members: 190, whatsapp: 'https://chat.whatsapp.com/example6' },
    ]
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    theme: 'andes',
    palette: { ground: '#8a6a4a', groundAlt: '#9a7a5a', path: '#d4a96e', accent: '#9c27b0' },
    description: 'Vinedos, Andes nevados, olivos, piedra y arena',
    worldX: 4, worldY: 28, // West
    communities: [
      { id: 'mdz-ciclismo', name: 'Ciclismo Andino', sport: 'cycling', members: 220, whatsapp: 'https://chat.whatsapp.com/example7' },
      { id: 'mdz-padel', name: 'Padel Mendoza', sport: 'padel', members: 180, whatsapp: 'https://chat.whatsapp.com/example8' },
      { id: 'mdz-ski', name: 'Esqui Las Lenas', sport: 'ski', members: 130, whatsapp: 'https://chat.whatsapp.com/example9' },
    ]
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    theme: 'patagonia',
    palette: { ground: '#2a4a6a', groundAlt: '#3a5a7a', path: '#8ab4d4', accent: '#00bcd4' },
    description: 'Glaciares, lengas, condores, guanacos, viento',
    worldX: 20, worldY: 54, // South
    communities: [
      { id: 'pat-trekking', name: 'Trekking Bariloche', sport: 'trekking', members: 380, whatsapp: 'https://chat.whatsapp.com/example10' },
      { id: 'pat-remo', name: 'Remo Nahuel Huapi', sport: 'rowing', members: 90, whatsapp: 'https://chat.whatsapp.com/example11' },
      { id: 'pat-padel', name: 'Padel Sur', sport: 'padel', members: 140, whatsapp: 'https://chat.whatsapp.com/example12' },
    ]
  },
  {
    id: 'noa',
    name: 'NOA',
    theme: 'noa',
    palette: { ground: '#8a5a2a', groundAlt: '#9a6a3a', path: '#d4956e', accent: '#ff9800' },
    description: 'Cardones, llamas, Quebrada de Humahuaca, terracota',
    worldX: 20, worldY: 4, // North
    communities: [
      { id: 'noa-futbol', name: 'Futbol Jujuy', sport: 'football', members: 260, whatsapp: 'https://chat.whatsapp.com/example13' },
      { id: 'noa-tenis', name: 'Tenis Salta', sport: 'tennis', members: 110, whatsapp: 'https://chat.whatsapp.com/example14' },
      { id: 'noa-running', name: 'Running Altiplano', sport: 'running', members: 195, whatsapp: 'https://chat.whatsapp.com/example15' },
    ]
  },
  {
    id: 'litoral',
    name: 'Litoral',
    theme: 'litoral',
    palette: { ground: '#3a6a3a', groundAlt: '#4a7a4a', path: '#8ab46e', accent: '#4caf50' },
    description: 'Yerba mate, palmeras, carpinchos, rio Parana',
    worldX: 52, worldY: 18, // Northeast
    communities: [
      { id: 'lit-remo', name: 'Remo Parana', sport: 'rowing', members: 160, whatsapp: 'https://chat.whatsapp.com/example16' },
      { id: 'lit-futbol', name: 'Futbol Rosario', sport: 'football', members: 420, whatsapp: 'https://chat.whatsapp.com/example17' },
      { id: 'lit-padel', name: 'Padel Entre Rios', sport: 'padel', members: 230, whatsapp: 'https://chat.whatsapp.com/example18' },
    ]
  },
  {
    id: 'pampas',
    name: 'Pampas',
    theme: 'pampas',
    palette: { ground: '#6a8a3a', groundAlt: '#7a9a4a', path: '#c8b46e', accent: '#cddc39' },
    description: 'Llanuras infinitas, estancias, caballos, pasto pampeano',
    worldX: 38, worldY: 20, // East of center
    communities: [
      { id: 'pam-polo', name: 'Polo Buenos Aires', sport: 'polo', members: 85, whatsapp: 'https://chat.whatsapp.com/example21' },
      { id: 'pam-padel', name: 'Padel La Plata', sport: 'padel', members: 270, whatsapp: 'https://chat.whatsapp.com/example22' },
      { id: 'pam-running', name: 'Running Pampeano', sport: 'running', members: 310, whatsapp: 'https://chat.whatsapp.com/example23' },
    ]
  },
  {
    id: 'noreste',
    name: 'Noreste',
    theme: 'noreste',
    palette: { ground: '#2a6a2a', groundAlt: '#1a5a1a', path: '#6ab46a', accent: '#00e676' },
    description: 'Selva misionera, tucanes, Cataratas del Iguazu',
    worldX: 52, worldY: 4, // Far northeast
    communities: [
      { id: 'ne-futbol', name: 'Futbol Misiones', sport: 'football', members: 290, whatsapp: 'https://chat.whatsapp.com/example24' },
      { id: 'ne-tenis', name: 'Tenis Posadas', sport: 'tennis', members: 75, whatsapp: 'https://chat.whatsapp.com/example25' },
      { id: 'ne-kayak', name: 'Kayak Iguazu', sport: 'kayak', members: 120, whatsapp: 'https://chat.whatsapp.com/example26' },
    ]
  },
  {
    id: 'neuquen',
    name: 'Neuquen',
    theme: 'neuquen',
    palette: { ground: '#4a6a5a', groundAlt: '#3a5a4a', path: '#8ab4a4', accent: '#26a69a' },
    description: 'Araucarias, volcanes, termas, lagos color turquesa',
    worldX: 4, worldY: 46, // Southwest
    communities: [
      { id: 'nqn-ski', name: 'Esqui Chapelco', sport: 'ski', members: 200, whatsapp: 'https://chat.whatsapp.com/example27' },
      { id: 'nqn-padel', name: 'Padel Neuquen', sport: 'padel', members: 165, whatsapp: 'https://chat.whatsapp.com/example28' },
      { id: 'nqn-trekking', name: 'Trekking Lanin', sport: 'trekking', members: 240, whatsapp: 'https://chat.whatsapp.com/example29' },
    ]
  },
  {
    id: 'cuyo',
    name: 'Cuyo',
    theme: 'cuyo',
    palette: { ground: '#9a7a4a', groundAlt: '#aa8a5a', path: '#c8a96e', accent: '#795548' },
    description: 'Olivos, desierto, montanas rocosas, cielo azul intenso',
    worldX: 4, worldY: 10, // Northwest corner
    communities: [
      { id: 'cuyo-padel', name: 'Padel San Juan', sport: 'padel', members: 150, whatsapp: 'https://chat.whatsapp.com/example19' },
      { id: 'cuyo-futbol', name: 'Futbol San Luis', sport: 'football', members: 200, whatsapp: 'https://chat.whatsapp.com/example20' },
      { id: 'cuyo-ciclismo', name: 'Ciclismo Cuyo', sport: 'cycling', members: 175, whatsapp: 'https://chat.whatsapp.com/example30' },
    ]
  },
];

// Hub buildings with positions relative to province
interface Building {
  community: Community;
  province: Province;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Constants moved above PROVINCES definition

// Build all buildings from provinces with proper grid layout
function generateBuildings(): Building[] {
  const buildings: Building[] = [];
  
  PROVINCES.forEach(province => {
    // Layout de 3 comunidades en L dentro de la provincia con calles entre ellas
    const layouts = [
      { col: 0, row: 0 },  // top-left block
      { col: 1, row: 0 },  // top-right block  
      { col: 0, row: 1 },  // bottom-left block
    ];
    
    province.communities.forEach((community, idx) => {
      const layout = layouts[idx] || { col: idx % 2, row: Math.floor(idx / 2) };
      // Building size: 5w x 4h tiles, with 2-tile street gap between them, 1-tile margin from province edge
      const buildingX = province.worldX + 1 + layout.col * 7; // 5 building + 2 street
      const buildingY = province.worldY + 1 + layout.row * 6; // 4 building + 2 street
      buildings.push({
        community,
        province,
        x: buildingX,
        y: buildingY,
        w: 5,
        h: 4,
      });
    });
  });
  
  return buildings;
}

// ==================== GAME COMPONENT ====================

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentProvince, setCurrentProvince] = useState<Province | null>(null);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Game state refs - spawn on the main road OUTSIDE the stadium
  // World center is at 35*32 = 1120, stadium is at 32-38, so spawn at 40*32
  const playerRef = useRef({
    x: 40 * TILE, // Spawn east of stadium on the main road
    y: 35 * TILE, // Center Y
    w: 16,
    h: 20,
    speed: 2.5,
    dir: 'down' as 'up' | 'down' | 'left' | 'right',
    frame: 0,
    frameTimer: 0,
    frameDelay: 8,
    moving: false,
  });
  
  const camRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const joyRef = useRef({ active: false, dx: 0, dy: 0 });
  const buildingsRef = useRef<Building[]>(generateBuildings());
  const discoveredRef = useRef<Set<string>>(new Set());
  const fadeRef = useRef({ active: false, alpha: 0, targetX: 0, targetY: 0, phase: 'none' as 'none' | 'out' | 'in' });

  // Toast helper
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  // Get province at position
  const getProvinceAt = useCallback((x: number, y: number): Province | null => {
    for (const p of PROVINCES) {
      const px = p.worldX * TILE;
      const py = p.worldY * TILE;
      const pw = 14 * TILE;
      const ph = 12 * TILE;
      if (x >= px && x < px + pw && y >= py && y < py + ph) {
        return p;
      }
    }
    return null;
  }, []);

  // Fast travel handler
  const handleFastTravel = useCallback((province: Province) => {
    fadeRef.current = {
      active: true,
      alpha: 0,
      targetX: (province.worldX + 7) * TILE,
      targetY: (province.worldY + 6) * TILE,
      phase: 'out'
    };
    setShowMap(false);
  }, []);

  // Hide hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Main game effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === 'm' || e.key === 'M') setShowMap(prev => !prev);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Stadium center - positioned in the middle of the 70x70 world
    const STADIUM = {
      x: 32, // Center of 70-tile world
      y: 32,
      w: 6,
      h: 6,
    };

    // Draw sport-specific building design
    const drawSportBuilding = (
      bx: number, by: number, bw: number, bh: number,
      sport: SportType, accent: string, discovered: boolean
    ) => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(bx + 4, by + 4, bw, bh);

      // Base building
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(bx, by, bw, bh);

      // Sport-specific top decoration
      const topH = bh * 0.35;
      ctx.fillStyle = accent;
      
      switch (sport) {
        case 'padel':
          // Blue court top view
          ctx.fillStyle = '#1a5a9a';
          ctx.fillRect(bx, by, bw, topH);
          // Net
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + bw/2 - 1, by + 2, 2, topH - 4);
          break;
          
        case 'football':
          // Green field
          ctx.fillStyle = '#2d7a35';
          ctx.fillRect(bx, by, bw, topH);
          // Lines
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 4, by + 2, bw - 8, 1);
          ctx.fillRect(bx + 4, by + topH - 3, bw - 8, 1);
          ctx.fillRect(bx + bw/2 - 1, by + 2, 1, topH - 4);
          break;
          
        case 'tennis':
          // Orange clay
          ctx.fillStyle = '#c85a2a';
          ctx.fillRect(bx, by, bw, topH);
          // Lines
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 3, by + 2, bw - 6, 1);
          ctx.fillRect(bx + bw/2 - 1, by + 2, 1, topH - 4);
          break;
          
        case 'rowing':
        case 'kayak':
          // Water
          ctx.fillStyle = '#2288bb';
          ctx.fillRect(bx, by, bw, topH);
          // Waves
          ctx.fillStyle = '#4aa8db';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(bx + 4 + i * 12, by + 4 + i * 3, 8, 2);
          }
          // Dock
          ctx.fillStyle = '#8a6a4a';
          ctx.fillRect(bx + 2, by + topH - 6, 12, 4);
          break;
          
        case 'trekking':
        case 'ski':
          // Mountain
          ctx.fillStyle = sport === 'ski' ? '#aaccee' : '#6a7a5a';
          ctx.fillRect(bx, by, bw, topH);
          // Peak
          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.moveTo(bx + bw/2, by + 2);
          ctx.lineTo(bx + bw/2 - 10, by + topH);
          ctx.lineTo(bx + bw/2 + 10, by + topH);
          ctx.closePath();
          ctx.fill();
          // Snow cap
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(bx + bw/2, by + 2);
          ctx.lineTo(bx + bw/2 - 5, by + 10);
          ctx.lineTo(bx + bw/2 + 5, by + 10);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'cycling':
          // Track
          ctx.fillStyle = '#5a5a6a';
          ctx.fillRect(bx, by, bw, topH);
          // Oval track
          ctx.strokeStyle = '#ffaa00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(bx + bw/2, by + topH/2, bw/2 - 6, topH/2 - 4, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'polo':
          // Green field wide
          ctx.fillStyle = '#3a8a3a';
          ctx.fillRect(bx, by, bw, topH);
          // Horse silhouette (simple)
          ctx.fillStyle = '#5a4a3a';
          ctx.fillRect(bx + bw/2 - 4, by + 4, 8, 6);
          ctx.fillRect(bx + bw/2 - 6, by + 10, 4, 4);
          break;
          
        case 'running':
          // Track lanes
          ctx.fillStyle = '#c85a3a';
          ctx.fillRect(bx, by, bw, topH);
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(bx + 4, by + 3 + i * 4, bw - 8, 1);
          }
          break;
          
        default:
          ctx.fillStyle = accent;
          ctx.fillRect(bx, by, bw, topH);
      }

      // Building walls
      ctx.fillStyle = '#1a252f';
      ctx.fillRect(bx, by + topH, bw, bh - topH);

      // Door
      const dx = bx + bw/2 - 6;
      const dy = by + bh - 14;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(dx, dy, 12, 14);
      ctx.fillStyle = '#007744';
      ctx.fillRect(dx + 1, dy + 1, 10, 12);

      // Windows
      ctx.fillStyle = 'rgba(255,255,200,0.7)';
      ctx.fillRect(bx + 6, by + topH + 6, 8, 6);
      ctx.fillRect(bx + bw - 14, by + topH + 6, 8, 6);

      // Discovered border
      if (discovered) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
    };

    // Draw themed tile
    const drawThemedTile = (tx: number, ty: number, wx: number, wy: number, province: Province | null) => {
      if (!province) {
        // Default grass
        const isAlt = (tx + ty) % 2 === 0;
        ctx.fillStyle = isAlt ? '#2d6035' : '#3a7d44';
        ctx.fillRect(wx, wy, TILE, TILE);
        return;
      }

      const { ground, groundAlt } = province.palette;
      const isAlt = (tx + ty) % 2 === 0;
      ctx.fillStyle = isAlt ? groundAlt : ground;
      ctx.fillRect(wx, wy, TILE, TILE);

      // Theme-specific decorations
      const seed = (tx * 7 + ty * 13) % 100;
      
      switch (province.theme) {
        case 'urban':
          // Adoquines pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            ctx.strokeRect(wx + i * 8, wy, 8, 16);
            ctx.strokeRect(wx + i * 8 + 4, wy + 16, 8, 16);
          }
          // Faroles
          if (seed < 8 && tx % 4 === 0) {
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(wx + 14, wy + 2, 4, 20);
            ctx.fillStyle = '#ffdd88';
            ctx.fillRect(wx + 12, wy, 8, 6);
          }
          break;
          
        case 'sierras':
          // Piedritas
          if (seed < 30) {
            ctx.fillStyle = 'rgba(100,90,80,0.4)';
            ctx.fillRect(wx + (seed % 20), wy + (seed % 15), 4, 3);
          }
          break;
          
        case 'andes':
        case 'cuyo':
          // Cactus pequeños
          if (seed < 10 && tx % 6 === 0) {
            ctx.fillStyle = '#4a6a3a';
            ctx.fillRect(wx + 12, wy + 8, 4, 16);
            ctx.fillRect(wx + 8, wy + 12, 4, 8);
            ctx.fillRect(wx + 16, wy + 14, 4, 6);
          }
          break;
          
        case 'patagonia':
          // Manchas de nieve
          if (seed < 25) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(wx + 16, wy + 16, 6 + (seed % 4), 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'noa':
          // Cardones
          if (seed < 8 && tx % 5 === 0) {
            ctx.fillStyle = '#5a7a4a';
            ctx.fillRect(wx + 14, wy + 4, 4, 24);
            ctx.fillRect(wx + 10, wy + 8, 4, 10);
            ctx.fillRect(wx + 18, wy + 10, 4, 8);
          }
          break;
          
        case 'litoral':
          // Palmeras pequeñas
          if (seed < 6 && tx % 7 === 0) {
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(wx + 14, wy + 10, 4, 18);
            ctx.fillStyle = '#3a8a3a';
            ctx.fillRect(wx + 8, wy + 4, 16, 8);
          }
          break;
          
        case 'pampas':
          // Ondas de pasto
          ctx.strokeStyle = 'rgba(100,120,60,0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(wx, wy + 16 + (seed % 8));
          ctx.quadraticCurveTo(wx + 16, wy + 12, wx + 32, wy + 16 + (seed % 6));
          ctx.stroke();
          break;
          
        case 'noreste':
          // Flores de colores
          if (seed < 20) {
            const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'];
            ctx.fillStyle = colors[seed % 4];
            ctx.beginPath();
            ctx.arc(wx + 8 + (seed % 16), wy + 8 + (seed % 12), 3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'neuquen':
          // Araucarias
          if (seed < 5 && tx % 6 === 0) {
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(wx + 14, wy + 12, 4, 16);
            ctx.fillStyle = '#2a4a2a';
            for (let i = 0; i < 4; i++) {
              ctx.fillRect(wx + 10 - i, wy + 4 + i * 3, 12 + i * 2, 3);
            }
          }
          break;
      }
    };

    // Draw province streets
    const drawProvinceStreets = (province: Province, camX: number, camY: number) => {
      const px = province.worldX * TILE - camX;
      const py = province.worldY * TILE - camY;
      const pw = 14 * TILE;
      const ph = 12 * TILE;
      
      // Skip if out of viewport
      if (px > canvas.width + 64 || px + pw < -64 || py > canvas.height + 64 || py + ph < -64) return;
      
      const { path, accent } = province.palette;
      
      // === PROVINCE BORDER (subtle) ===
      ctx.strokeStyle = accent + '44';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, pw, ph);
      
      // === MAIN INTERNAL STREETS ===
      // Horizontal street at row 5 (middle-ish)
      ctx.fillStyle = path;
      ctx.fillRect(px, py + 5 * TILE, pw, 2 * TILE);
      
      // Vertical street at col 6 (middle)
      ctx.fillRect(px + 6 * TILE, py, 2 * TILE, ph);
      
      // === STREET DETAILS (sidewalk lines) ===
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py + 5 * TILE, pw, 2 * TILE);
      
      // === PROVINCE NAME SIGN (entrada) ===
      ctx.fillStyle = accent;
      ctx.fillRect(px + 6 * TILE + 4, py + 2, 56, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(province.name.toUpperCase(), px + 6 * TILE + 32, py + 15);
      
      // === THEME-SPECIFIC STREET DECORATIONS ===
      switch (province.theme) {
        case 'urban':
          // Crosswalk stripes at intersection
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          for (let i = 0; i < 5; i++) {
            ctx.fillRect(px + 6 * TILE, py + 5 * TILE + 4 + i * 7, 2 * TILE, 4);
          }
          // Street lamps at corners of intersection
          [[0,0],[1,0],[0,1],[1,1]].forEach(([c,r]) => {
            const lx = px + (6 + c * 2) * TILE - 4;
            const ly = py + (5 + r * 2) * TILE - 4;
            ctx.fillStyle = '#3a3a4a';
            ctx.fillRect(lx, ly, 3, 20);
            ctx.fillStyle = '#ffdd88aa';
            ctx.fillRect(lx - 3, ly, 9, 5);
          });
          break;
          
        case 'noa':
          // Colored arches / adobe style street markers
          ctx.fillStyle = accent + '88';
          ctx.fillRect(px + 5 * TILE, py + 5 * TILE - 8, 4 * TILE, 8);
          // Patterned border
          for (let i = 0; i < 7; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#cc4400' : '#ffaa00';
            ctx.fillRect(px + (i * 2) * TILE, py, 2 * TILE, 4);
          }
          break;
          
        case 'patagonia':
        case 'neuquen':
          // Dirt path style (dots/gravel)
          ctx.fillStyle = 'rgba(180,160,130,0.4)';
          for (let i = 0; i < pw / 8; i++) {
            ctx.fillRect(px + i * 8 + 2, py + 5 * TILE + 12, 4, 4);
            ctx.fillRect(px + i * 8 + 2, py + 6 * TILE + 4, 4, 4);
          }
          break;
          
        case 'litoral':
        case 'noreste':
          // Dirt path with flower dots on sides
          const flowerColors = ['#ff6b6b', '#ffd93d', '#ff8c42'];
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = flowerColors[i % 3];
            ctx.beginPath();
            ctx.arc(px + i * (pw/8) + 16, py + 5 * TILE - 8, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + i * (pw/8) + 16, py + 7 * TILE + 8, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'sierras':
        case 'andes':
        case 'cuyo':
          // Rocky path edges
          ctx.fillStyle = 'rgba(150,130,100,0.5)';
          for (let i = 0; i < 6; i++) {
            ctx.fillRect(px + i * (pw/6) + 4, py + 5 * TILE - 5, 8, 4);
            ctx.fillRect(px + i * (pw/6) + 4, py + 7 * TILE + 2, 8, 4);
          }
          break;
          
        case 'pampas':
          // Wide open path, fence posts
          ctx.fillStyle = '#8a6a4a';
          for (let i = 0; i < pw / TILE; i++) {
            ctx.fillRect(px + i * TILE + 14, py + 5 * TILE - 6, 4, 10);
            ctx.fillRect(px + i * TILE + 14, py + 7 * TILE - 4, 4, 10);
          }
          break;
      }
    };

    // Draw player
    const drawPlayer = (px: number, py: number) => {
      const player = playerRef.current;
      const x = Math.floor(px - player.w / 2);
      const y = Math.floor(py - player.h / 2);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + 8, y + player.h + 2, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      const bodyColor = '#2255aa';
      const skinColor = '#f5c89a';
      const hairColor = '#1a1a1a';
      const shoeColor = '#222';

      const legOff = player.moving ? Math.sin(player.frame * 0.8) * 3 : 0;

      // Shoes
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 3, y + 14, 4, 5);
      ctx.fillRect(x + 9, y + 14, 4, 5);

      // Legs
      ctx.fillStyle = '#1a3a7a';
      ctx.fillRect(x + 3, y + 11 + legOff, 4, 5);
      ctx.fillRect(x + 9, y + 11 - legOff, 4, 5);

      // Body
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 2, y + 7, 12, 7);

      // Arms
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x, y + 7 + legOff, 3, 6);
      ctx.fillStyle = skinColor;
      ctx.fillRect(x, y + 13 + legOff, 3, 3);

      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 13, y + 7 - legOff, 3, 6);
      ctx.fillStyle = skinColor;
      ctx.fillRect(x + 13, y + 13 - legOff, 3, 3);

      // Head
      ctx.fillStyle = skinColor;
      ctx.fillRect(x + 3, y + 1, 10, 9);

      // Hair/cap
      ctx.fillStyle = hairColor;
      ctx.fillRect(x + 3, y + 1, 10, 4);
      ctx.fillRect(x + 1, y + 3, 3, 2);
      ctx.fillRect(x + 12, y + 3, 3, 2);

      // Eyes
      ctx.fillStyle = '#222';
      if (player.dir === 'down' || player.dir === 'left' || player.dir === 'right') {
        ctx.fillRect(x + 5, y + 6, 2, 2);
        ctx.fillRect(x + 9, y + 6, 2, 2);
      }

      // ATC text on shirt
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 5px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('ATC', x + 8, y + 13);
    };

    // Draw stadium
    const drawStadium = (cx: number, cy: number) => {
      const sx = STADIUM.x * TILE - cx;
      const sy = STADIUM.y * TILE - cy;
      const sw = STADIUM.w * TILE;
      const sh = STADIUM.h * TILE;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(sx + sw/2 + 4, sy + sh/2 + 4, sw/2 + 8, sh/2 + 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.fillStyle = '#1a3a6b';
      ctx.beginPath();
      ctx.ellipse(sx + sw/2, sy + sh/2, sw/2 + 8, sh/2 + 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.fillStyle = '#2a4a7b';
      ctx.beginPath();
      ctx.ellipse(sx + sw/2, sy + sh/2, sw/2 - 4, sh/2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Field
      ctx.fillStyle = '#2d7a35';
      ctx.beginPath();
      ctx.ellipse(sx + sw/2, sy + sh/2, sw/2 - 16, sh/2 - 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // ATC Logo text
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 14px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('ATC', sx + sw/2, sy + sh/2 - 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "Courier New"';
      ctx.fillText('CAMPUS', sx + sw/2, sy + sh/2 + 4);

      // Entry points (4 cardinal)
      ctx.fillStyle = '#c8a96e';
      ctx.fillRect(sx + sw/2 - 8, sy - 12, 16, 16);
      ctx.fillRect(sx + sw/2 - 8, sy + sh - 4, 16, 16);
      ctx.fillRect(sx - 12, sy + sh/2 - 8, 16, 16);
      ctx.fillRect(sx + sw - 4, sy + sh/2 - 8, 16, 16);
    };

    // Main draw
    const drawWorld = (cx: number, cy: number) => {
      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const startTX = Math.floor(cx / TILE) - 2;
      const startTY = Math.floor(cy / TILE) - 2;
      const endTX = Math.ceil((cx + canvas.width) / TILE) + 2;
      const endTY = Math.ceil((cy + canvas.height) / TILE) + 2;

      // Draw tiles
      for (let ty = startTY; ty < endTY; ty++) {
        for (let tx = startTX; tx < endTX; tx++) {
          if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) continue;
          const wx = tx * TILE - cx;
          const wy = ty * TILE - cy;
          const province = getProvinceAt(tx * TILE + TILE/2, ty * TILE + TILE/2);
          drawThemedTile(tx, ty, wx, wy, province);
        }
      }

      // Draw paths between provinces
      ctx.fillStyle = '#c8a96e';
      const pathW = TILE * 2;
      const centerX = (WORLD_W / 2) * TILE - cx;
      const centerY = (WORLD_H / 2) * TILE - cy;
      
      // Main cross paths
      ctx.fillRect(-cx, centerY - pathW/2, WORLD_PX, pathW);
      ctx.fillRect(centerX - pathW/2, -cy, pathW, WORLD_PY);

      // Draw province streets BEFORE buildings
      PROVINCES.forEach(p => drawProvinceStreets(p, cx, cy));

      // Draw stadium
      drawStadium(cx, cy);

      // Draw buildings
      buildingsRef.current.forEach(b => {
        const bx = b.x * TILE - cx;
        const by = b.y * TILE - cy;
        const bw = b.w * TILE;
        const bh = b.h * TILE;

        if (bx > canvas.width + 50 || by > canvas.height + 50 || bx < -bw - 50 || by < -bh - 50) return;

        const discovered = discoveredRef.current.has(b.community.id);
        drawSportBuilding(bx, by, bw, bh, b.community.sport, b.province.palette.accent, discovered);

        // Building name
        ctx.fillStyle = discovered ? '#00ff88' : 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 7px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(b.community.name, bx + bw/2, by - 8);

        // Province badge
        ctx.fillStyle = b.province.palette.accent;
        ctx.fillRect(bx + bw - 20, by - 4, 18, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 5px "Courier New"';
        ctx.fillText(b.province.name.slice(0, 3).toUpperCase(), bx + bw - 11, by + 3);
      });
    };

    // Collision check with padding to prevent edge-sticking
    const collidesWithBuilding = (nx: number, ny: number): boolean => {
      const pad = 6; // pixels of padding
      
      // Stadium collision with padding
      const sx1 = STADIUM.x * TILE + pad;
      const sy1 = STADIUM.y * TILE + pad;
      const sx2 = (STADIUM.x + STADIUM.w) * TILE - pad;
      const sy2 = (STADIUM.y + STADIUM.h) * TILE - pad;
      if (nx > sx1 && nx < sx2 && ny > sy1 && ny < sy2) return true;

      // Buildings collision with padding
      for (const b of buildingsRef.current) {
        const bx1 = b.x * TILE + pad;
        const by1 = b.y * TILE + pad;
        const bx2 = (b.x + b.w) * TILE - pad;
        const by2 = (b.y + b.h) * TILE - pad;
        if (nx > bx1 && nx < bx2 && ny > by1 && ny < by2) return true;
      }
      return false;
    };

    // Check zone proximity
    const checkZoneProximity = () => {
      const player = playerRef.current;
      const px = player.x;
      const py = player.y;

      // Stadium check
      const sx1 = STADIUM.x * TILE;
      const sy1 = STADIUM.y * TILE;
      const sx2 = (STADIUM.x + STADIUM.w) * TILE;
      const sy2 = (STADIUM.y + STADIUM.h) * TILE;
      const margin = 20;
      
      if (px > sx1 - margin && px < sx2 + margin && py > sy1 - margin && py < sy2 + margin) {
        // Near stadium - no popup but update province
        setCurrentCommunity(null);
        return;
      }

      // Buildings check
      for (const b of buildingsRef.current) {
        const bx1 = b.x * TILE;
        const by1 = b.y * TILE;
        const bx2 = (b.x + b.w) * TILE;
        const by2 = (b.y + b.h) * TILE;
        
        if (px > bx1 - margin && px < bx2 + margin && py > by1 - margin && py < by2 + margin) {
          if (!discoveredRef.current.has(b.community.id)) {
            discoveredRef.current.add(b.community.id);
            setDiscoveredCount(discoveredRef.current.size);
            showToastMessage(`+1 comunidad descubierta!`);
          }
          setCurrentCommunity(b.community);
          setCurrentProvince(b.province);
          return;
        }
      }
      
      setCurrentCommunity(null);
    };

    // Update with wall sliding
    const update = () => {
      const player = playerRef.current;
      const cam = camRef.current;
      const keys = keysRef.current;
      const joy = joyRef.current;
      const fade = fadeRef.current;

      // Handle fade transition
      if (fade.active) {
        if (fade.phase === 'out') {
          fade.alpha += 0.05;
          if (fade.alpha >= 1) {
            fade.alpha = 1;
            player.x = fade.targetX;
            player.y = fade.targetY;
            cam.x = player.x - canvas.width / 2;
            cam.y = player.y - canvas.height / 2;
            fade.phase = 'in';
          }
        } else if (fade.phase === 'in') {
          fade.alpha -= 0.05;
          if (fade.alpha <= 0) {
            fade.alpha = 0;
            fade.active = false;
            fade.phase = 'none';
          }
        }
        return;
      }

      let dx = 0, dy = 0;

      if (keys['ArrowLeft'] || keys['a']) dx -= 1;
      if (keys['ArrowRight'] || keys['d']) dx += 1;
      if (keys['ArrowUp'] || keys['w']) dy -= 1;
      if (keys['ArrowDown'] || keys['s']) dy += 1;

      if (joy.active) {
        dx = joy.dx;
        dy = joy.dy;
      }

      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        dx /= Math.max(len, 1);
        dy /= Math.max(len, 1);
      }

      const spd = player.speed;
      
      // Slide along walls - check X and Y independently
      const newX = player.x + dx * spd;
      const newY = player.y + dy * spd;

      if (!collidesWithBuilding(newX, player.y) && newX > 16 && newX < WORLD_PX - 16) {
        player.x = newX;
      }
      if (!collidesWithBuilding(player.x, newY) && newY > 16 && newY < WORLD_PY - 16) {
        player.y = newY;
      }

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

      // Camera
      const targetCX = player.x - canvas.width / 2;
      const targetCY = player.y - canvas.height / 2;
      cam.x += (targetCX - cam.x) * 0.12;
      cam.y += (targetCY - cam.y) * 0.12;
      cam.x = Math.max(0, Math.min(WORLD_PX - canvas.width, cam.x));
      cam.y = Math.max(0, Math.min(WORLD_PY - canvas.height, cam.y));

      // Province update
      const prov = getProvinceAt(player.x, player.y);
      if (prov !== currentProvince) {
        setCurrentProvince(prov);
      }

      checkZoneProximity();
    };

    // Draw
    const draw = () => {
      const player = playerRef.current;
      const cam = camRef.current;
      const fade = fadeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWorld(Math.floor(cam.x), Math.floor(cam.y));

      const screenX = player.x - cam.x;
      const screenY = player.y - cam.y;
      drawPlayer(screenX, screenY);

      // Fade overlay
      if (fade.active && fade.alpha > 0) {
        ctx.fillStyle = `rgba(10,10,10,${fade.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Game loop
    let animationId: number;
    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [getProvinceAt, currentProvince, showToastMessage]);

  // Calculate total communities
  const totalCommunities = PROVINCES.reduce((acc, p) => acc + p.communities.length, 0);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden font-sans touch-none select-none">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-black/85 border-b-2 border-[#00564B]">
        <h1 className="text-[#09D85D] text-sm tracking-widest uppercase font-bold flex items-center gap-2">
          <span className="text-lg">⬡</span> ATC Campus
        </h1>
        <div className="flex items-center gap-3">
          {currentProvince && (
            <span 
              className="text-xs px-2 py-1 rounded transition-all duration-300"
              style={{ backgroundColor: currentProvince.palette.accent + '33', color: currentProvince.palette.accent, border: `1px solid ${currentProvince.palette.accent}` }}
            >
              {currentProvince.name}
            </span>
          )}
          <span className="text-[#09D85D] text-xs bg-[#09D85D20] border border-[#09D85D] px-3 py-1 rounded">
            {discoveredCount}/{totalCommunities} explorado
          </span>
          <button
            onClick={() => setShowMap(true)}
            className="text-[#09D85D] text-xs bg-[#09D85D20] border border-[#09D85D] px-3 py-1 rounded hover:bg-[#09D85D40] transition-colors"
          >
            MAPA
          </button>
        </div>
      </header>

      {/* Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" style={{ imageRendering: 'pixelated' }} />

      {/* Community Popup */}
      {currentCommunity && currentProvince && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0aee] border-2 border-[#09D85D] rounded-lg p-4 min-w-[240px] text-center animate-in slide-in-from-bottom-4 duration-300">
          <span 
            className="inline-block text-xs px-2 py-0.5 rounded mb-2"
            style={{ backgroundColor: currentProvince.palette.accent, color: '#fff' }}
          >
            {currentProvince.name}
          </span>
          <h3 className="text-[#09D85D] text-sm font-bold tracking-wide mb-1">
            {SPORT_EMOJI[currentCommunity.sport]} {currentCommunity.name}
          </h3>
          <p className="text-[#aaa] text-xs mb-3">{currentCommunity.members} jugadores activos</p>
          <a
            href={currentCommunity.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#09D85D] text-black font-bold text-xs px-4 py-2 rounded tracking-wide hover:bg-[#07c050] transition-colors"
          >
            UNIRSE AL GRUPO
          </a>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#09D85D] text-black font-bold text-sm px-4 py-2 rounded animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 text-[#aaa] text-xs text-center animate-in fade-in duration-500">
          Usa el joystick para moverte - Acercate a un club para descubrirlo - Presiona M para el mapa
        </div>
      )}

      {/* Joystick */}
      <JoystickControl onMove={(dx, dy) => {
        joyRef.current.active = dx !== 0 || dy !== 0;
        joyRef.current.dx = dx;
        joyRef.current.dy = dy;
      }} />

      {/* Interact button */}
      <button
        onClick={() => {
          if (currentCommunity) {
            window.open(currentCommunity.whatsapp, '_blank');
          }
        }}
        className="fixed bottom-11 right-8 w-14 h-14 rounded-full bg-[#09D85D26] border-2 border-[#09D85D] text-[#09D85D] font-bold text-lg z-50 active:scale-95 transition-transform"
      >
        A
      </button>

      {/* Fast Travel Map - IMPROVED DESIGN */}
{showMap && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    {/* Solid dark overlay */}
    <div 
      className="absolute inset-0 bg-[#0a0f0a]" 
      onClick={() => setShowMap(false)} 
    />
    
    {/* Map container */}
    <div className="relative z-10 w-full max-w-md bg-[#0d1210] border-2 border-[#00564B] rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#00564B]">
        <div>
          <h2 className="text-white text-base font-bold tracking-wide">
            ARGENTINA
          </h2>
          <p className="text-[#88ccaa] text-xs">Selecciona tu destino</p>
        </div>
        <button
          onClick={() => setShowMap(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#004038] text-white hover:bg-[#003530] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Map grid area */}
      <div className="p-5 bg-[#0d1210]">
        {/* Province grid - organized by region */}
        <div className="grid gap-2">
          {/* Norte */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-[#666] text-[10px] uppercase tracking-wider col-span-2 mb-1">Norte</div>
            {PROVINCES.filter(p => ['noa', 'noreste'].includes(p.id)).map((province) => {
              const discoveredInProvince = province.communities.filter(c => discoveredRef.current.has(c.id)).length;
              const allDiscovered = discoveredInProvince === province.communities.length;
              return (
                <button
                  key={province.id}
                  onClick={() => handleFastTravel(province)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#141a18',
                    border: `2px solid ${allDiscovered ? '#09D85D' : province.palette.accent}40`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: province.palette.accent }}
                    />
                    <span className="text-white text-sm font-medium">{province.name}</span>
                  </div>
                  <span className={`text-xs ${allDiscovered ? 'text-[#09D85D]' : 'text-[#666]'}`}>
                    {discoveredInProvince}/{province.communities.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Centro */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[#666] text-[10px] uppercase tracking-wider col-span-2 mb-1">Centro</div>
            {PROVINCES.filter(p => ['cordoba', 'litoral', 'pampas', 'caba'].includes(p.id)).map((province) => {
              const discoveredInProvince = province.communities.filter(c => discoveredRef.current.has(c.id)).length;
              const allDiscovered = discoveredInProvince === province.communities.length;
              return (
                <button
                  key={province.id}
                  onClick={() => handleFastTravel(province)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#141a18',
                    border: `2px solid ${allDiscovered ? '#09D85D' : province.palette.accent}40`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: province.palette.accent }}
                    />
                    <span className="text-white text-sm font-medium">{province.name}</span>
                  </div>
                  <span className={`text-xs ${allDiscovered ? 'text-[#09D85D]' : 'text-[#666]'}`}>
                    {discoveredInProvince}/{province.communities.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cuyo y Oeste */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[#666] text-[10px] uppercase tracking-wider col-span-2 mb-1">Oeste</div>
            {PROVINCES.filter(p => ['mendoza', 'cuyo'].includes(p.id)).map((province) => {
              const discoveredInProvince = province.communities.filter(c => discoveredRef.current.has(c.id)).length;
              const allDiscovered = discoveredInProvince === province.communities.length;
              return (
                <button
                  key={province.id}
                  onClick={() => handleFastTravel(province)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#141a18',
                    border: `2px solid ${allDiscovered ? '#09D85D' : province.palette.accent}40`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: province.palette.accent }}
                    />
                    <span className="text-white text-sm font-medium">{province.name}</span>
                  </div>
                  <span className={`text-xs ${allDiscovered ? 'text-[#09D85D]' : 'text-[#666]'}`}>
                    {discoveredInProvince}/{province.communities.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sur */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[#666] text-[10px] uppercase tracking-wider col-span-2 mb-1">Sur</div>
            {PROVINCES.filter(p => ['neuquen', 'patagonia'].includes(p.id)).map((province) => {
              const discoveredInProvince = province.communities.filter(c => discoveredRef.current.has(c.id)).length;
              const allDiscovered = discoveredInProvince === province.communities.length;
              return (
                <button
                  key={province.id}
                  onClick={() => handleFastTravel(province)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#141a18',
                    border: `2px solid ${allDiscovered ? '#09D85D' : province.palette.accent}40`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: province.palette.accent }}
                    />
                    <span className="text-white text-sm font-medium">{province.name}</span>
                  </div>
                  <span className={`text-xs ${allDiscovered ? 'text-[#09D85D]' : 'text-[#666]'}`}>
                    {discoveredInProvince}/{province.communities.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-4 pt-4 border-t border-[#222]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#888]">Comunidades descubiertas</span>
            <span className="text-[#09D85D] font-bold">{discoveredCount}/30</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 bg-[#0a0f0a] border-t border-[#1a1a1a] flex items-center justify-center gap-4">
        <span className="text-[#555] text-xs">Presiona</span>
        <kbd className="px-2 py-1 bg-[#1a1a1a] text-[#888] text-xs rounded border border-[#333]">M</kbd>
        <span className="text-[#555] text-xs">para cerrar</span>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// Joystick Component
function JoystickControl({ onMove }: { onMove: (dx: number, dy: number) => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current || !activeRef.current) return;
    
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const ox = clientX - centerX;
    const oy = clientY - centerY;
    const dist = Math.sqrt(ox * ox + oy * oy);
    const maxDist = 28;
    const clamped = Math.min(dist, maxDist);
    const angle = Math.atan2(oy, ox);
    
    const dx = Math.cos(angle) * clamped / maxDist;
    const dy = Math.sin(angle) * clamped / maxDist;
    
    setOffset({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped });
    onMove(dx, dy);
  }, [onMove]);

  const handleEnd = useCallback(() => {
    activeRef.current = false;
    setOffset({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  return (
    <div
      ref={baseRef}
      className="fixed bottom-8 left-8 z-50 w-[90px] h-[90px] rounded-full bg-[#09D85D15] border-2 border-[#09D85D50] flex items-center justify-center"
      onTouchStart={(e) => {
        e.preventDefault();
        activeRef.current = true;
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
      onTouchCancel={(e) => {
        e.preventDefault();
        handleEnd();
      }}
    >
      <div
        className="w-9 h-9 rounded-full bg-[#09D85D99] border-2 border-[#09D85D]"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      />
    </div>
  );
}
