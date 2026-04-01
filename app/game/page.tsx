'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ==================== DATOS REALES ====================

interface Community {
  id: string;
  name: string;
  sport: SportType;
  members: number;
  whatsapp: string;
  city?: string;
  discovered?: boolean;
}

interface Region {
  id: string;
  name: string;
  theme: string;
  palette: { ground: string; groundAlt: string; path: string; accent: string };
  description: string;
  worldX: number;
  worldY: number;
  communities: Community[];
  // For map positioning
  mapX: number;
  mapY: number;
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

// World configuration
const TILE = 32;
const WORLD_W = 80;
const WORLD_H = 80;
const WORLD_PX = WORLD_W * TILE;
const WORLD_PY = WORLD_H * TILE;

// Regiones con datos reales de las comunidades ATC
// Mapa 80x80, regiones de 14x12 tiles, espaciadas para no solapar
// Centro del mapa (40,40) reservado para Stadium y cruces de caminos
const REGIONS: Region[] = [
  {
    id: 'caba',
    name: 'CABA',
    theme: 'urban',
    palette: { ground: '#4a4a5a', groundAlt: '#5a5a6a', path: '#6a6a7a', accent: '#ff6b35' },
    description: 'Asfalto, jacarandas, palomas, adoquines portenos',
    worldX: 46, worldY: 46, // Sureste del centro
    mapX: 72, mapY: 52,
    communities: [
      { id: 'caba-main', name: 'Comunidad CABA', sport: 'padel', members: 1704, whatsapp: 'https://chat.whatsapp.com/KmzpxJFG31g8H0EC2rwUDp', city: 'Capital Federal' },
      { id: 'distrito-padel', name: 'Distrito Padel', sport: 'padel', members: 120, whatsapp: 'https://chat.whatsapp.com/CG2DLwQ1MRmA3I6IIAcK4N', city: 'Palermo' },
      { id: 'padel-noble', name: 'Padel Noble', sport: 'padel', members: 85, whatsapp: 'https://chat.whatsapp.com/C5marc2or5zL1D84OuQbg5', city: 'Palermo' },
      { id: 'village-club', name: 'Village Club', sport: 'padel', members: 95, whatsapp: 'https://chat.whatsapp.com/Fox8s4ToXr1LS3jl4X6gfO', city: 'Flores' },
      { id: 'centenario', name: 'Centenario Padel Club', sport: 'padel', members: 110, whatsapp: 'https://chat.whatsapp.com/Dsq5ncFAdrV6JWrCxXL6hB', city: 'Caballito' },
    ]
  },
  {
    id: 'gba-norte',
    name: 'GBA Norte',
    theme: 'suburban',
    palette: { ground: '#5a6a4a', groundAlt: '#4a5a3a', path: '#8a9a6a', accent: '#4caf50' },
    description: 'Quintas, countries, verde del conurbano norte',
    worldX: 62, worldY: 26, // Noreste
    mapX: 75, mapY: 48,
    communities: [
      { id: 'gba-norte-main', name: 'Comunidad GBA Norte', sport: 'padel', members: 172, whatsapp: 'https://chat.whatsapp.com/BXQTG9HXbng4MY101ILOZW', city: 'Zona Norte' },
      { id: 'babolat-remeros', name: 'Babolat Remeros', sport: 'padel', members: 140, whatsapp: 'https://chat.whatsapp.com/Jr4UHt6wgWG3wtkZLgE1Rj', city: 'Tigre' },
      { id: 'olivos-padel', name: 'Olivos Padel Club', sport: 'padel', members: 95, whatsapp: 'https://chat.whatsapp.com/EMD9VE3TojJ3y7S0YAUXCP', city: 'Olivos' },
      { id: 'wpc-nordelta', name: 'WPC Nordelta', sport: 'padel', members: 130, whatsapp: 'https://chat.whatsapp.com/IcExqgDCt6L3KPz1FhnqX6', city: 'Nordelta' },
      { id: 'head-hindu', name: 'Head Padel Club Hindu', sport: 'padel', members: 105, whatsapp: 'https://chat.whatsapp.com/IlcHtKsFYYMIUoK34RWGmZ', city: 'Don Torcuato' },
    ]
  },
  {
    id: 'gba-sur',
    name: 'GBA Sur',
    theme: 'industrial',
    palette: { ground: '#5a5a5a', groundAlt: '#4a4a4a', path: '#7a7a7a', accent: '#ff5722' },
    description: 'Zona industrial, estadios, comunidad pujante',
    worldX: 62, worldY: 46, // Este
    mapX: 73, mapY: 58,
    communities: [
      { id: 'gba-sur-main', name: 'Comunidad GBA Sur', sport: 'padel', members: 183, whatsapp: 'https://chat.whatsapp.com/H3VoDuisgC7HO23B0Cdlra', city: 'Zona Sur' },
      { id: 'gm-sports', name: 'GM Sports', sport: 'padel', members: 75, whatsapp: 'https://chat.whatsapp.com/CX0IA6ID1dxAM5c2BUo25s', city: 'Berazategui' },
      { id: 'fun-padel', name: 'Fun Padel', sport: 'padel', members: 90, whatsapp: 'https://chat.whatsapp.com/B4m3gFQmHVABf5yABNOhRA', city: 'Canning' },
      { id: 'meca-avellaneda', name: 'La MECA Avellaneda', sport: 'padel', members: 120, whatsapp: 'https://chat.whatsapp.com/FHCJIMb9CR24x4i7WI5D1M', city: 'Avellaneda' },
      { id: 'meca-quilmes', name: 'La MECA Quilmes', sport: 'padel', members: 110, whatsapp: 'https://chat.whatsapp.com/IiilU7rcEJNB5H73vUYnJC', city: 'Quilmes' },
    ]
  },
  {
    id: 'gba-oeste',
    name: 'GBA Oeste',
    theme: 'suburban',
    palette: { ground: '#6a7a5a', groundAlt: '#5a6a4a', path: '#9aaa7a', accent: '#8bc34a' },
    description: 'Barrios tradicionales, clubes de barrio',
    worldX: 20, worldY: 46, // Suroeste
    mapX: 68, mapY: 52,
    communities: [
      { id: 'gba-oeste-main', name: 'Comunidad GBA Oeste', sport: 'padel', members: 129, whatsapp: 'https://chat.whatsapp.com/H4EqXrAuya47flouWTno4o', city: 'Zona Oeste' },
      { id: 'flow-red', name: 'Flow en Red', sport: 'padel', members: 85, whatsapp: 'https://chat.whatsapp.com/CPYf4K0aiWF0TNVzRjDmIe', city: 'Malvinas Argentinas' },
      { id: 'club-melian', name: 'Club Melian', sport: 'padel', members: 70, whatsapp: 'https://chat.whatsapp.com/DyonVGnUGR5FWQmzqbVu2M', city: 'Martin Coronado' },
      { id: 'parador-57', name: 'Parador 57', sport: 'padel', members: 60, whatsapp: 'https://chat.whatsapp.com/Cn36RmkWHGs4TsZQ6Ki2vi', city: 'Moreno' },
      { id: 'container-fc', name: 'Container FC', sport: 'football', members: 95, whatsapp: 'https://chat.whatsapp.com/C9ZMOrjAPcT2usDe6NCNJ5', city: 'Ramos Mejia' },
    ]
  },
  {
    id: 'cordoba',
    name: 'Cordoba',
    theme: 'sierras',
    palette: { ground: '#5a7a3a', groundAlt: '#4a6a2a', path: '#c8a96e', accent: '#8bc34a' },
    description: 'Sierras, fernet, cuarteto, corazon del pais',
    worldX: 20, worldY: 26, // Noroeste del centro
    mapX: 58, mapY: 42,
    communities: [
      { id: 'cordoba-main', name: 'Comunidad Cordoba', sport: 'padel', members: 727, whatsapp: 'https://chat.whatsapp.com/EvEGd0DuKlb1aPREiktK0Z', city: 'Ciudad de Cordoba' },
      { id: 'padel-poligono', name: 'Padel Poligono', sport: 'padel', members: 85, whatsapp: 'https://chat.whatsapp.com/KO3B0Z02DmWDMBEAEzOJbM', city: 'Ciudad de Cordoba' },
      { id: 'sacala-x4', name: 'Sacala x4', sport: 'padel', members: 70, whatsapp: 'https://chat.whatsapp.com/JHDHaowLeAp1EaBKojytpg', city: 'Ciudad de Cordoba' },
      { id: 'p60-espacio', name: 'P60 Espacio Recreativo', sport: 'football', members: 55, whatsapp: 'https://chat.whatsapp.com/LLd0ubiCi8N672jKSXgP2K', city: 'Las Perdices' },
    ]
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    theme: 'andes',
    palette: { ground: '#8a6a4a', groundAlt: '#9a7a5a', path: '#d4a96e', accent: '#9c27b0' },
    description: 'Vinedos, Andes nevados, sol y buen vino',
    worldX: 2, worldY: 36, // Oeste
    mapX: 42, mapY: 48,
    communities: [
      { id: 'mendoza-main', name: 'Comunidad Mendoza', sport: 'padel', members: 771, whatsapp: 'https://chat.whatsapp.com/GW4KNeUH8Br8FJyLBAM53e', city: 'Ciudad de Mendoza' },
      { id: 'azcuenaga', name: 'Azcuenaga Padel', sport: 'padel', members: 65, whatsapp: 'https://chat.whatsapp.com/Ezb5h5oXQWHIzl0jU5SH8J', city: 'Lujan de Cuyo' },
    ]
  },
  {
    id: 'rosario',
    name: 'Rosario',
    theme: 'litoral',
    palette: { ground: '#3a6a3a', groundAlt: '#4a7a4a', path: '#8ab46e', accent: '#4caf50' },
    description: 'Cuna de la bandera, rio Parana, pasion futbolera',
    worldX: 46, worldY: 10, // Norte-centro
    mapX: 62, mapY: 42,
    communities: [
      { id: 'rosario-main', name: 'Comunidad Rosario', sport: 'padel', members: 27, whatsapp: 'https://chat.whatsapp.com/KI7lpPqzTqUFetILZN5eqb', city: 'Rosario' },
      { id: 'el-92', name: 'El 92', sport: 'padel', members: 45, whatsapp: 'https://chat.whatsapp.com/Ib7g29qdF6eJcqAkAdUDYy', city: 'San Jose de la Esquina' },
      { id: 'km8-club', name: 'KM8 Club de Padel', sport: 'padel', members: 60, whatsapp: 'https://chat.whatsapp.com/Ir6iKlVtG8d3pUeRene2TP', city: 'Santa Fe' },
    ]
  },
  {
    id: 'tucuman',
    name: 'Tucuman',
    theme: 'noa',
    palette: { ground: '#8a5a2a', groundAlt: '#9a6a3a', path: '#d4956e', accent: '#ff9800' },
    description: 'Jardin de la Republica, empanadas, cerros verdes',
    worldX: 30, worldY: 2, // Norte
    mapX: 56, mapY: 22,
    communities: [
      { id: 'tucuman-main', name: 'Comunidad Tucuman', sport: 'padel', members: 188, whatsapp: 'https://chat.whatsapp.com/G9cNLJr7Xgo4lZQSVpCSuO', city: 'San Miguel de Tucuman' },
      { id: 'padel-point', name: 'Padel Point', sport: 'padel', members: 75, whatsapp: 'https://chat.whatsapp.com/ERrMBTFheMdCfSe2rt55SQ', city: 'Yerba Buena' },
    ]
  },
  {
    id: 'neuquen',
    name: 'Neuquen',
    theme: 'patagonia',
    palette: { ground: '#4a6a5a', groundAlt: '#3a5a4a', path: '#8ab4a4', accent: '#26a69a' },
    description: 'Lagos, volcanes, dinosaurios, petroleo',
    worldX: 2, worldY: 60, // Suroeste extremo
    mapX: 45, mapY: 68,
    communities: [
      { id: 'neuquen-main', name: 'Comunidad Neuquen', sport: 'padel', members: 202, whatsapp: 'https://chat.whatsapp.com/JWNVHHrCouGJWPDChGZJnH', city: 'Ciudad de Neuquen' },
      { id: 'efecto-padel', name: 'Efecto Padel', sport: 'padel', members: 45, whatsapp: 'https://chat.whatsapp.com/HgGsPWQ1eQI3PojipWNHNa', city: '25 de Mayo' },
    ]
  },
  {
    id: 'mar-del-plata',
    name: 'Mar del Plata',
    theme: 'coastal',
    palette: { ground: '#3a5a6a', groundAlt: '#4a6a7a', path: '#aaccdd', accent: '#00bcd4' },
    description: 'La Feliz, playas, lobos marinos, alfajores',
    worldX: 62, worldY: 60, // Sureste
    mapX: 70, mapY: 62,
    communities: [
      { id: 'mdp-main', name: 'Comunidad Mar del Plata', sport: 'padel', members: 338, whatsapp: 'https://chat.whatsapp.com/Jw12EFJM8jzKtMd6GAUSJI', city: 'Mar del Plata' },
    ]
  },
  {
    id: 'la-plata',
    name: 'La Plata',
    theme: 'urban',
    palette: { ground: '#5a5a6a', groundAlt: '#4a4a5a', path: '#7a7a8a', accent: '#2196f3' },
    description: 'Ciudad de las diagonales, estudiantes, pincha y lobo',
    worldX: 46, worldY: 62, // Sur centro
    mapX: 73, mapY: 55,
    communities: [
      { id: 'la-plata-main', name: 'Comunidad La Plata', sport: 'padel', members: 66, whatsapp: 'https://chat.whatsapp.com/KwKWxXXg5Th1NkZJyTj2bS', city: 'La Plata' },
    ]
  },
  {
    id: 'salta',
    name: 'Salta',
    theme: 'noa',
    palette: { ground: '#9a6a3a', groundAlt: '#8a5a2a', path: '#c89a6e', accent: '#e65100' },
    description: 'La linda, empanadas saltenas, cerros multicolores',
    worldX: 14, worldY: 2, // Noroeste extremo
    mapX: 52, mapY: 18,
    communities: [
      { id: 'salta-main', name: 'Comunidad Salta', sport: 'padel', members: 83, whatsapp: 'https://chat.whatsapp.com/ICWGzwEwftsFVniDWHTKCa', city: 'Ciudad de Salta' },
    ]
  },
  {
    id: 'san-juan',
    name: 'San Juan',
    theme: 'cuyo',
    palette: { ground: '#9a7a4a', groundAlt: '#aa8a5a', path: '#c8a96e', accent: '#795548' },
    description: 'Sol, vino, Valle de la Luna, dique',
    worldX: 2, worldY: 20, // Oeste norte
    mapX: 45, mapY: 42,
    communities: [
      { id: 'san-juan-main', name: 'Comunidad San Juan', sport: 'padel', members: 92, whatsapp: 'https://chat.whatsapp.com/DStJHwaCHt9BTz2TotcQw3', city: 'San Juan' },
    ]
  },
  {
    id: 'formosa',
    name: 'Formosa',
    theme: 'noreste',
    palette: { ground: '#2a6a2a', groundAlt: '#1a5a1a', path: '#6ab46a', accent: '#00e676' },
    description: 'Calor, rio, monte, banados del chaco',
    worldX: 62, worldY: 2, // Noreste extremo
    mapX: 62, mapY: 22,
    communities: [
      { id: 'formosa-main', name: 'Comunidad Formosa', sport: 'padel', members: 151, whatsapp: 'https://chat.whatsapp.com/EevdhvdJji4J6AeFsJyp1G', city: 'Formosa' },
    ]
  },
  {
    id: 'misiones',
    name: 'Misiones',
    theme: 'noreste',
    palette: { ground: '#1a5a1a', groundAlt: '#2a6a2a', path: '#5aa45a', accent: '#4caf50' },
    description: 'Cataratas, selva, yerba mate, tierra colorada',
    worldX: 62, worldY: 12, // Noreste
    mapX: 72, mapY: 28,
    communities: [
      { id: 'blue-padel', name: 'Blue Padel Quincho', sport: 'padel', members: 55, whatsapp: 'https://chat.whatsapp.com/K6p7ZDy1XSp9a3tRirtBQr', city: 'El Dorado' },
      { id: 'libertad-padel', name: 'Libertad Padel Center', sport: 'padel', members: 65, whatsapp: 'https://chat.whatsapp.com/EkXVjqJ1KAC9WIfsBin0pL', city: 'Leandro N. Alem' },
    ]
  },
  {
    id: 'resistencia',
    name: 'Resistencia',
    theme: 'noreste',
    palette: { ground: '#3a7a3a', groundAlt: '#2a6a2a', path: '#7ab47a', accent: '#66bb6a' },
    description: 'Ciudad de las esculturas, calor, chamame',
    worldX: 46, worldY: 2, // Norte centro-este
    mapX: 62, mapY: 28,
    communities: [
      { id: 'resistencia-main', name: 'Comunidad Resistencia', sport: 'padel', members: 66, whatsapp: 'https://chat.whatsapp.com/EtV8Kkfrfa22i5yFMo4XyQ', city: 'Resistencia' },
    ]
  },
  {
    id: 'jujuy',
    name: 'Jujuy',
    theme: 'noa',
    palette: { ground: '#aa6a3a', groundAlt: '#9a5a2a', path: '#d4956e', accent: '#ff6f00' },
    description: 'Quebrada de Humahuaca, cerros de colores, pachamama',
    worldX: 2, worldY: 2, // Noroeste extremo extremo
    mapX: 52, mapY: 12,
    communities: [
      { id: 'jujuy-main', name: 'Comunidad Jujuy', sport: 'padel', members: 7, whatsapp: 'https://chat.whatsapp.com/LRkWKmcuB7iIqyUFy4IX43', city: 'San Salvador de Jujuy' },
    ]
  },
  {
    id: 'la-rioja',
    name: 'La Rioja',
    theme: 'cuyo',
    palette: { ground: '#8a6a3a', groundAlt: '#9a7a4a', path: '#c8a96e', accent: '#a1887f' },
    description: 'Talampaya, sol, olivos, vino torrontes',
    worldX: 2, worldY: 50, // Oeste sur
    mapX: 48, mapY: 35,
    communities: [
      { id: 'la-rioja-main', name: 'Comunidad La Rioja', sport: 'padel', members: 48, whatsapp: 'https://chat.whatsapp.com/Jg3tYcaz0660zoky0EapQZ', city: 'La Rioja' },
      { id: 'camping-medico', name: 'Camping Colegio Medico', sport: 'padel', members: 35, whatsapp: 'https://chat.whatsapp.com/ExIEUKkHkVs2aBJj6rrMXx', city: 'Cochangasta' },
    ]
  },
  {
    id: 'tandil',
    name: 'Tandil',
    theme: 'pampas',
    palette: { ground: '#6a8a3a', groundAlt: '#7a9a4a', path: '#c8b46e', accent: '#cddc39' },
    description: 'Sierras bonaerenses, piedra movediza, salame',
    worldX: 30, worldY: 62, // Sur centro
    mapX: 68, mapY: 62,
    communities: [
      { id: 'tandil-main', name: 'Comunidad Tandil', sport: 'padel', members: 40, whatsapp: 'https://chat.whatsapp.com/HMCaMmFIili1UR6du3dZIQ', city: 'Tandil' },
    ]
  },
  {
    id: 'entre-rios',
    name: 'Entre Rios',
    theme: 'litoral',
    palette: { ground: '#4a7a4a', groundAlt: '#3a6a3a', path: '#9ab49a', accent: '#81c784' },
    description: 'Termas, carnaval, arroyos, citrus',
    worldX: 46, worldY: 26, // Noreste del centro
    mapX: 68, mapY: 38,
    communities: [
      { id: 'la-quinta', name: 'La Quinta', sport: 'padel', members: 50, whatsapp: 'https://chat.whatsapp.com/ElJNSQdjww1JctOUBrb0ai', city: 'Islas Malvinas' },
    ]
  },
  {
    id: 'buenos-aires',
    name: 'Interior BsAs',
    theme: 'pampas',
    palette: { ground: '#7a9a4a', groundAlt: '#6a8a3a', path: '#d4c46e', accent: '#dce775' },
    description: 'Llanura pampeana, estancias, campo infinito',
    worldX: 20, worldY: 62, // Sur
    mapX: 65, mapY: 58,
    communities: [
      { id: 'la-nave', name: 'La Nave Padel', sport: 'padel', members: 55, whatsapp: 'https://chat.whatsapp.com/JULhsyntLtmEXjh3Aynray', city: 'Azul' },
      { id: 'bejota', name: 'Bejota Padel', sport: 'padel', members: 45, whatsapp: 'https://chat.whatsapp.com/EQOy4OqySIt87de0hDEphU', city: 'Azul' },
      { id: 'fultito-padel', name: 'Fultito Padel', sport: 'padel', members: 65, whatsapp: 'https://chat.whatsapp.com/BrNcS2B41ba3mtWdLqBaJt', city: 'Pergamino' },
      { id: 'fultito-futbol', name: 'Fultito Futbol', sport: 'football', members: 80, whatsapp: 'https://chat.whatsapp.com/H2mqgjyBNpsAp7UqgLOFhf', city: 'Pergamino' },
      { id: 'circuito-club', name: 'Circuito Club de Padel', sport: 'padel', members: 70, whatsapp: 'https://chat.whatsapp.com/Bo3alCpQoWB2nT7ewnMwZL', city: 'Ciudad Evita' },
    ]
  },
];

// Total communities count
const TOTAL_COMMUNITIES = REGIONS.reduce((acc, r) => acc + r.communities.length, 0);

// Hub buildings with positions relative to region
interface Building {
  community: Community;
  region: Region;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Build all buildings from regions with proper grid layout - SPACED OUT
function generateBuildings(): Building[] {
  const buildings: Building[] = [];
  
  REGIONS.forEach(region => {
    // Layout: cada region tiene 14x12 tiles, edificios de 5x4
    // Usar grid de 2 columnas max con buen espaciado
    const maxCols = 2;
    const spacingX = 7; // Espacio horizontal entre edificios
    const spacingY = 5; // Espacio vertical entre edificios
    
    region.communities.forEach((community, idx) => {
      const col = idx % maxCols;
      const row = Math.floor(idx / maxCols);
      // Offset inicial + espaciado
      const buildingX = region.worldX + 2 + col * spacingX;
      const buildingY = region.worldY + 2 + row * spacingY;
      buildings.push({
        community,
        region,
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
  const [mapView, setMapView] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Game state refs - spawn on main road east of stadium
  const playerRef = useRef({
    x: 44 * TILE, // East of stadium (38-42), on the main road
    y: 40 * TILE, // Center of world vertically
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

  // Filter regions/communities based on search
  const filteredRegions = searchQuery.trim() === '' 
    ? REGIONS 
    : REGIONS.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.communities.some(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );

  // Toast helper
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  // Get region at position
  const getRegionAt = useCallback((x: number, y: number): Region | null => {
    for (const r of REGIONS) {
      const rx = r.worldX * TILE;
      const ry = r.worldY * TILE;
      const rw = 14 * TILE;
      const rh = 12 * TILE;
      if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) {
        return r;
      }
    }
    return null;
  }, []);

  // Fast travel handler
  const handleFastTravel = useCallback((region: Region) => {
    fadeRef.current = {
      active: true,
      alpha: 0,
      targetX: (region.worldX + 7) * TILE,
      targetY: (region.worldY + 6) * TILE,
      phase: 'out'
    };
    setShowMap(false);
    setSearchQuery('');
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

    // Stadium center - positioned at world center (40,40) in the crossroads
    // Regions are positioned to avoid this area
    const STADIUM = {
      x: 38,
      y: 40,
      w: 4,
      h: 4,
    };

    // Draw sport-specific building design
    const drawSportBuilding = (
      bx: number, by: number, bw: number, bh: number,
      sport: SportType, accent: string, discovered: boolean
    ) => {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(bx + 4, by + 4, bw, bh);

      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(bx, by, bw, bh);

      const topH = bh * 0.35;
      
      switch (sport) {
        case 'padel':
          ctx.fillStyle = '#1a5a9a';
          ctx.fillRect(bx, by, bw, topH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + bw/2 - 1, by + 2, 2, topH - 4);
          break;
          
        case 'football':
          ctx.fillStyle = '#2d7a35';
          ctx.fillRect(bx, by, bw, topH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 4, by + 2, bw - 8, 1);
          ctx.fillRect(bx + 4, by + topH - 3, bw - 8, 1);
          ctx.fillRect(bx + bw/2 - 1, by + 2, 1, topH - 4);
          break;
          
        case 'tennis':
          ctx.fillStyle = '#c85a2a';
          ctx.fillRect(bx, by, bw, topH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 3, by + 2, bw - 6, 1);
          ctx.fillRect(bx + bw/2 - 1, by + 2, 1, topH - 4);
          break;
          
        default:
          ctx.fillStyle = accent;
          ctx.fillRect(bx, by, bw, topH);
      }

      ctx.fillStyle = '#1a252f';
      ctx.fillRect(bx, by + topH, bw, bh - topH);

      const dx = bx + bw/2 - 6;
      const dy = by + bh - 14;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(dx, dy, 12, 14);
      ctx.fillStyle = '#007744';
      ctx.fillRect(dx + 1, dy + 1, 10, 12);

      ctx.fillStyle = 'rgba(255,255,200,0.7)';
      ctx.fillRect(bx + 6, by + topH + 6, 8, 6);
      ctx.fillRect(bx + bw - 14, by + topH + 6, 8, 6);

      if (discovered) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
    };

    // Simple hash for pseudo-random based on position
    const hash = (x: number, y: number): number => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    // Draw themed tile - Pokemon style organic grass
    const drawThemedTile = (tx: number, ty: number, wx: number, wy: number, region: Region | null) => {
      const h = hash(tx, ty);
      const h2 = hash(tx + 100, ty + 100);
      const h3 = hash(tx * 3, ty * 3);
      
      if (!region) {
        // Base grass color con variacion sutil (NO cuadrille)
        const baseGreen = 58 + Math.floor(h * 12); // 58-70
        const greenVariation = 125 + Math.floor(h2 * 20); // 125-145
        ctx.fillStyle = `rgb(${baseGreen}, ${greenVariation}, ${50 + Math.floor(h * 10)})`;
        ctx.fillRect(wx, wy, TILE, TILE);
        
        // Detalles de pasto estilo Pokemon
        // Briznas de pasto oscuro
        if (h3 > 0.7) {
          ctx.fillStyle = 'rgba(30,80,30,0.4)';
          const gx = Math.floor(h * 24);
          const gy = Math.floor(h2 * 24);
          ctx.fillRect(wx + gx, wy + gy, 2, 5);
          ctx.fillRect(wx + gx + 3, wy + gy + 1, 2, 4);
        }
        // Briznas claras ocasionales
        if (h > 0.85) {
          ctx.fillStyle = 'rgba(100,160,80,0.5)';
          const gx = Math.floor(h2 * 20) + 4;
          const gy = Math.floor(h3 * 20) + 4;
          ctx.fillRect(wx + gx, wy + gy, 3, 6);
        }
        // Manchas mas claras para variedad
        if (h2 > 0.9) {
          ctx.fillStyle = 'rgba(90,150,70,0.3)';
          ctx.fillRect(wx + Math.floor(h * 16), wy + Math.floor(h3 * 16), 8, 8);
        }
        return;
      }

      // Themed regions - tambien con variacion organica
      const { ground, groundAlt } = region.palette;
      // Parsear colores y mezclar con variacion
      const blend = 0.85 + h * 0.15; // 85%-100% del color base
      ctx.fillStyle = h > 0.5 ? ground : groundAlt;
      ctx.fillRect(wx, wy, TILE, TILE);
      
      // Overlay de variacion
      ctx.fillStyle = `rgba(${h > 0.5 ? '255,255,255' : '0,0,0'},${0.02 + h2 * 0.04})`;
      ctx.fillRect(wx, wy, TILE, TILE);

      // Detalles por tema
      switch (region.theme) {
        case 'urban':
        case 'suburban':
        case 'industrial':
          // Adoquines/baldosas - solo sombras sutiles, no grid completo
          if (h > 0.3) {
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(wx + Math.floor(h * 28), wy + Math.floor(h2 * 28), 4, 4);
          }
          break;
          
        case 'sierras':
          // Piedras y pastito de sierra
          if (h > 0.85) {
            ctx.fillStyle = 'rgba(100,90,80,0.5)';
            ctx.fillRect(wx + Math.floor(h2 * 20) + 4, wy + Math.floor(h3 * 20) + 4, 6, 4);
          }
          if (h3 > 0.8) {
            ctx.fillStyle = 'rgba(80,120,60,0.4)';
            ctx.fillRect(wx + Math.floor(h * 24), wy + Math.floor(h2 * 20), 3, 5);
          }
          break;
          
        case 'andes':
        case 'cuyo':
          // Arena y rocas
          if (h > 0.88) {
            ctx.fillStyle = 'rgba(80,80,70,0.4)';
            ctx.fillRect(wx + Math.floor(h2 * 22) + 2, wy + Math.floor(h3 * 22) + 2, 5, 4);
          }
          break;
          
        case 'patagonia':
          // Nieve y hielo
          if (h > 0.75) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            const size = 4 + Math.floor(h2 * 6);
            ctx.fillRect(wx + Math.floor(h3 * 20) + 4, wy + Math.floor(h * 20) + 4, size, size);
          }
          break;
          
        case 'noa':
          // Tierra roja y cactus ocasional
          if (h > 0.92) {
            ctx.fillStyle = '#4a6a3a';
            ctx.fillRect(wx + 14, wy + 8, 3, 16);
            ctx.fillRect(wx + 11, wy + 12, 3, 4);
            ctx.fillRect(wx + 17, wy + 14, 3, 4);
          }
          break;
          
        case 'litoral':
        case 'noreste':
          // Selva - vegetacion densa
          if (h > 0.8) {
            ctx.fillStyle = 'rgba(40,100,40,0.4)';
            ctx.fillRect(wx + Math.floor(h2 * 22) + 2, wy + Math.floor(h3 * 18) + 4, 4, 7);
          }
          if (h3 > 0.85) {
            ctx.fillStyle = 'rgba(30,80,30,0.5)';
            ctx.fillRect(wx + Math.floor(h * 20) + 6, wy + Math.floor(h2 * 20) + 6, 3, 5);
          }
          break;
          
        case 'pampas':
          // Pasto pampeano alto
          if (h > 0.6) {
            ctx.fillStyle = 'rgba(100,130,60,0.35)';
            ctx.fillRect(wx + Math.floor(h2 * 24), wy + Math.floor(h3 * 22), 3, 6);
          }
          if (h3 > 0.75) {
            ctx.fillStyle = 'rgba(80,110,50,0.4)';
            ctx.fillRect(wx + Math.floor(h * 20) + 8, wy + Math.floor(h2 * 18) + 6, 2, 7);
          }
          break;
          
        case 'coastal':
          // Arena de playa
          if (h > 0.7) {
            ctx.fillStyle = 'rgba(220,210,180,0.25)';
            ctx.fillRect(wx + Math.floor(h2 * 20) + 4, wy + Math.floor(h3 * 20) + 4, 6, 4);
          }
          break;
      }
    };

    // Draw player
    const drawPlayer = (px: number, py: number, dir: string, frame: number) => {
      const colors = {
        skin: '#f4c7a8',
        hair: '#2a1a0a',
        shirt: '#00564B',
        pants: '#1a2a3a',
        shoes: '#1a1a1a',
      };

      ctx.fillStyle = colors.shoes;
      ctx.fillRect(px + 2, py + 18, 5, 2);
      ctx.fillRect(px + 9, py + 18, 5, 2);

      ctx.fillStyle = colors.pants;
      ctx.fillRect(px + 3, py + 12, 10, 7);

      ctx.fillStyle = colors.shirt;
      ctx.fillRect(px + 2, py + 6, 12, 7);

      ctx.fillStyle = colors.skin;
      ctx.fillRect(px + 4, py, 8, 7);

      ctx.fillStyle = colors.hair;
      ctx.fillRect(px + 4, py, 8, 3);

      ctx.fillStyle = '#ffffff';
      if (dir === 'down') {
        ctx.fillRect(px + 5, py + 3, 2, 2);
        ctx.fillRect(px + 9, py + 3, 2, 2);
      }
    };

    // Game loop
    let animId: number;
    const gameLoop = () => {
      const player = playerRef.current;
      const cam = camRef.current;
      const keys = keysRef.current;
      const joy = joyRef.current;
      const buildings = buildingsRef.current;
      const fade = fadeRef.current;

      // Handle fade transition
      if (fade.active) {
        if (fade.phase === 'out') {
          fade.alpha += 0.08;
          if (fade.alpha >= 1) {
            fade.alpha = 1;
            player.x = fade.targetX;
            player.y = fade.targetY;
            fade.phase = 'in';
          }
        } else if (fade.phase === 'in') {
          fade.alpha -= 0.08;
          if (fade.alpha <= 0) {
            fade.alpha = 0;
            fade.active = false;
            fade.phase = 'none';
          }
        }
      }

      // Movement
      let dx = 0, dy = 0;
      if (keys['ArrowUp'] || keys['w'] || keys['W']) dy = -1;
      if (keys['ArrowDown'] || keys['s'] || keys['S']) dy = 1;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx = -1;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx = 1;

      if (joy.active) {
        dx = joy.dx;
        dy = joy.dy;
      }

      // Normalize diagonal
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }

      // Apply movement
      const newX = player.x + dx * player.speed;
      const newY = player.y + dy * player.speed;

      // Collision check
      const checkCollision = (px: number, py: number): boolean => {
        const pad = 4;
        for (const b of buildings) {
          const bx = b.x * TILE;
          const by = b.y * TILE;
          const bw = b.w * TILE;
          const bh = b.h * TILE;
          if (px + player.w > bx + pad && px < bx + bw - pad &&
              py + player.h > by + pad && py < by + bh - pad) {
            return true;
          }
        }
        // Stadium collision
        const sx = STADIUM.x * TILE;
        const sy = STADIUM.y * TILE;
        const sw = STADIUM.w * TILE;
        const sh = STADIUM.h * TILE;
        if (px + player.w > sx && px < sx + sw &&
            py + player.h > sy && py < sy + sh) {
          return true;
        }
        return false;
      };

      // Sliding collision
      if (!checkCollision(newX, player.y)) {
        player.x = newX;
      }
      if (!checkCollision(player.x, newY)) {
        player.y = newY;
      }

      // Clamp to world
      player.x = Math.max(0, Math.min(WORLD_PX - player.w, player.x));
      player.y = Math.max(0, Math.min(WORLD_PY - player.h, player.y));

      // Direction
      player.moving = dx !== 0 || dy !== 0;
      if (player.moving) {
        if (Math.abs(dx) > Math.abs(dy)) {
          player.dir = dx > 0 ? 'right' : 'left';
        } else {
          player.dir = dy > 0 ? 'down' : 'up';
        }
        player.frameTimer++;
        if (player.frameTimer >= player.frameDelay) {
          player.frameTimer = 0;
          player.frame = (player.frame + 1) % 4;
        }
      }

      // Camera
      cam.x = player.x - canvas.width / 2 + player.w / 2;
      cam.y = player.y - canvas.height / 2 + player.h / 2;
      cam.x = Math.max(0, Math.min(WORLD_PX - canvas.width, cam.x));
      cam.y = Math.max(0, Math.min(WORLD_PY - canvas.height, cam.y));

      // Update current region
      const reg = getRegionAt(player.x, player.y);
      if (reg !== currentRegion) {
        setCurrentRegion(reg);
      }

      // Check building proximity
      let nearCommunity: Community | null = null;
      let nearRegion: Region | null = null;
      for (const b of buildings) {
        const bx = b.x * TILE;
        const by = b.y * TILE;
        const bw = b.w * TILE;
        const bh = b.h * TILE;
        const dist = 20;
        if (player.x + player.w > bx - dist && player.x < bx + bw + dist &&
            player.y + player.h > by - dist && player.y < by + bh + dist) {
          nearCommunity = b.community;
          nearRegion = b.region;
          
          if (!discoveredRef.current.has(b.community.id)) {
            discoveredRef.current.add(b.community.id);
            setDiscoveredCount(discoveredRef.current.size);
            showToastMessage(`Descubriste ${b.community.name}!`);
          }
          break;
        }
      }
      setCurrentCommunity(nearCommunity);

      // Clear
      ctx.fillStyle = '#1a2a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw tiles
      const startTX = Math.floor(cam.x / TILE);
      const startTY = Math.floor(cam.y / TILE);
      const endTX = Math.ceil((cam.x + canvas.width) / TILE);
      const endTY = Math.ceil((cam.y + canvas.height) / TILE);

      for (let ty = startTY; ty <= endTY; ty++) {
        for (let tx = startTX; tx <= endTX; tx++) {
          if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) continue;
          const wx = tx * TILE - cam.x;
          const wy = ty * TILE - cam.y;
          const tileRegion = getRegionAt(tx * TILE, ty * TILE);
          drawThemedTile(tx, ty, wx, wy, tileRegion);
        }
      }

      // Draw main roads
      ctx.fillStyle = '#4a4a4a';
      const roadW = 3 * TILE;
      // Horizontal road
      ctx.fillRect(-cam.x, (WORLD_H / 2 - 1.5) * TILE - cam.y, WORLD_PX, roadW);
      // Vertical road
      ctx.fillRect((WORLD_W / 2 - 1.5) * TILE - cam.x, -cam.y, roadW, WORLD_PY);

      // Road markings
      ctx.fillStyle = '#ffff00';
      for (let i = 0; i < WORLD_W; i += 4) {
        ctx.fillRect(i * TILE - cam.x, WORLD_H / 2 * TILE - cam.y - 2, TILE * 2, 4);
      }
      for (let i = 0; i < WORLD_H; i += 4) {
        ctx.fillRect(WORLD_W / 2 * TILE - cam.x - 2, i * TILE - cam.y, 4, TILE * 2);
      }

      // Draw stadium
      const stadX = STADIUM.x * TILE - cam.x;
      const stadY = STADIUM.y * TILE - cam.y;
      const stadW = STADIUM.w * TILE;
      const stadH = STADIUM.h * TILE;
      
      ctx.fillStyle = '#00564B';
      ctx.beginPath();
      ctx.ellipse(stadX + stadW/2, stadY + stadH/2, stadW/2, stadH/2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#09D85D';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ATC', stadX + stadW/2, stadY + stadH/2 - 4);
      ctx.font = '10px sans-serif';
      ctx.fillText('CAMPUS', stadX + stadW/2, stadY + stadH/2 + 10);

      // Draw buildings
      for (const b of buildings) {
        const bx = b.x * TILE - cam.x;
        const by = b.y * TILE - cam.y;
        const bw = b.w * TILE;
        const bh = b.h * TILE;
        
        if (bx > canvas.width || by > canvas.height || bx + bw < 0 || by + bh < 0) continue;
        
        const discovered = discoveredRef.current.has(b.community.id);
        drawSportBuilding(bx, by, bw, bh, b.community.sport, b.region.palette.accent, discovered);
        
        // Name label
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(bx - 10, by - 18, bw + 20, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.community.name.substring(0, 20), bx + bw/2, by - 6);
      }

      // Draw player
      const px = player.x - cam.x;
      const py = player.y - cam.y;
      drawPlayer(px, py, player.dir, player.frame);

      // Fade overlay
      if (fade.active) {
        ctx.fillStyle = `rgba(0,0,0,${fade.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentRegion, getRegionAt, showToastMessage]);

  // Joystick handlers
  const handleJoyStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    joyRef.current.active = true;
  }, []);

  const handleJoyMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!joyRef.current.active) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const dx = (clientX - centerX) / (rect.width / 2);
    const dy = (clientY - centerY) / (rect.height / 2);
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0.2) {
      joyRef.current.dx = Math.max(-1, Math.min(1, dx));
      joyRef.current.dy = Math.max(-1, Math.min(1, dy));
    } else {
      joyRef.current.dx = 0;
      joyRef.current.dy = 0;
    }
  }, []);

  const handleJoyEnd = useCallback(() => {
    joyRef.current.active = false;
    joyRef.current.dx = 0;
    joyRef.current.dy = 0;
  }, []);

  return (
    <div className="fixed inset-0 bg-[#1a2a1a] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Header UI */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00564B] rounded-full">
            <div className="w-2 h-2 bg-[#09D85D] rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">ATC CAMPUS</span>
          </div>
          {currentRegion && (
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: currentRegion.palette.accent }}
            >
              {currentRegion.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 bg-black/50 rounded-full text-white text-sm">
            {discoveredCount}/{TOTAL_COMMUNITIES} exploradas
          </div>
          <button
            onClick={() => setShowMap(true)}
            className="px-4 py-1.5 bg-[#00564B] hover:bg-[#00463B] text-white text-sm font-medium rounded-full transition-colors"
          >
            MAPA
          </button>
        </div>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 rounded-lg text-white text-sm animate-pulse">
          Usa las flechas o WASD para moverte. M para el mapa.
        </div>
      )}

      {/* Community popup */}
      {currentCommunity && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-[#00564B]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{SPORT_EMOJI[currentCommunity.sport]}</span>
                <span className="text-white font-bold">{currentCommunity.name}</span>
              </div>
              <span className="text-[#88ccaa] text-sm">{currentCommunity.members} miembros</span>
            </div>
            {currentCommunity.city && (
              <p className="text-[#aaddbb] text-xs mt-1">{currentCommunity.city}</p>
            )}
          </div>
          <div className="p-4">
            <a
              href={currentCommunity.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-center font-bold rounded-lg transition-colors"
            >
              Unirme al WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#09D85D] text-[#00564B] font-bold rounded-full shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Joystick (mobile) */}
      <div
        className="fixed bottom-8 right-8 w-28 h-28 rounded-full bg-black/40 border-2 border-white/30 md:hidden touch-none"
        onTouchStart={handleJoyStart}
        onTouchMove={handleJoyMove}
        onTouchEnd={handleJoyEnd}
        onMouseDown={handleJoyStart}
        onMouseMove={handleJoyMove}
        onMouseUp={handleJoyEnd}
        onMouseLeave={handleJoyEnd}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50"
          style={{
            transform: `translate(calc(-50% + ${joyRef.current.dx * 20}px), calc(-50% + ${joyRef.current.dy * 20}px))`
          }}
        />
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0a0f0a]" 
            onClick={() => { setShowMap(false); setSearchQuery(''); }} 
          />
          
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] bg-[#0d1210] border-2 border-[#00564B] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#00564B] shrink-0">
              <div>
                <h2 className="text-white text-lg font-bold">ARGENTINA</h2>
                <p className="text-[#88ccaa] text-xs">{discoveredCount}/{TOTAL_COMMUNITIES} comunidades descubiertas</p>
              </div>
              <button
                onClick={() => { setShowMap(false); setSearchQuery(''); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#004038] text-white hover:bg-[#003530] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search & View Toggle */}
            <div className="px-4 py-3 bg-[#0d1210] border-b border-[#1a2a1a] shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Buscar region o comunidad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-[#1a2a1a] border border-[#2a3a2a] rounded-lg text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00564B]"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex bg-[#1a2a1a] rounded-lg p-1">
                  <button
                    onClick={() => setMapView('list')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mapView === 'list' ? 'bg-[#00564B] text-white' : 'text-[#888] hover:text-white'}`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setMapView('map')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mapView === 'map' ? 'bg-[#00564B] text-white' : 'text-[#888] hover:text-white'}`}
                  >
                    Mapa
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {mapView === 'list' ? (
                /* List View */
                <div className="p-4 space-y-2">
                  {filteredRegions.length === 0 ? (
                    <p className="text-center text-[#666] py-8">No se encontraron resultados</p>
                  ) : (
                    filteredRegions.map((region) => {
                      const discoveredInRegion = region.communities.filter(c => discoveredRef.current.has(c.id)).length;
                      const allDiscovered = discoveredInRegion === region.communities.length;
                      
                      return (
                        <button
                          key={region.id}
                          onClick={() => handleFastTravel(region)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-150 hover:scale-[1.01]"
                          style={{
                            backgroundColor: '#141a18',
                            border: `2px solid ${allDiscovered ? '#09D85D' : region.palette.accent}40`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: region.palette.accent }}
                            />
                            <div className="text-left">
                              <span className="text-white font-medium">{region.name}</span>
                              <p className="text-[#666] text-xs">{region.communities.length} comunidades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${allDiscovered ? 'text-[#09D85D]' : 'text-[#888]'}`}>
                              {discoveredInRegion}/{region.communities.length}
                            </span>
                            {region.communities[0] && (
                              <p className="text-[#666] text-xs">{region.communities[0].members} miembros</p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Map View - Argentina silhouette with pins */
                <div className="relative p-4">
                  <div className="relative w-full aspect-[3/4] bg-[#0a1510] rounded-lg overflow-hidden">
                    {/* Argentina shape outline */}
                    <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full opacity-20">
                      <path
                        d="M45 2 L55 2 L60 5 L65 10 L68 15 L70 25 L72 35 L73 45 L72 55 L70 65 L68 75 L65 85 L60 95 L55 105 L50 115 L45 125 L42 120 L40 110 L38 100 L36 90 L34 80 L33 70 L34 60 L36 50 L38 40 L40 30 L42 20 L44 10 Z"
                        fill="#00564B"
                        stroke="#09D85D"
                        strokeWidth="0.5"
                      />
                    </svg>
                    
                    {/* Region pins */}
                    {filteredRegions.map((region) => {
                      const discoveredInRegion = region.communities.filter(c => discoveredRef.current.has(c.id)).length;
                      const allDiscovered = discoveredInRegion === region.communities.length;
                      
                      return (
                        <button
                          key={region.id}
                          onClick={() => handleFastTravel(region)}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                          style={{
                            left: `${region.mapX}%`,
                            top: `${region.mapY}%`,
                          }}
                        >
                          {/* Pin */}
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-150"
                            style={{ 
                              backgroundColor: allDiscovered ? '#09D85D' : region.palette.accent,
                            }}
                          />
                          {/* Label on hover */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <div className="px-2 py-1 bg-black/90 rounded text-[10px] text-white font-medium">
                              {region.name}
                              <span className="text-[#888] ml-1">({discoveredInRegion}/{region.communities.length})</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    
                    {/* Hub indicator */}
                    <div 
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#00564B] border-2 border-[#09D85D] flex items-center justify-center"
                      style={{ left: '60%', top: '50%' }}
                    >
                      <span className="text-[#09D85D] text-[6px] font-bold">HUB</span>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#666]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#888]" />
                      <span>Por explorar</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#09D85D]" />
                      <span>Completada</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 bg-[#0a0f0a] border-t border-[#1a1a1a] flex items-center justify-center gap-4 shrink-0">
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
