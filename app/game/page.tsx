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
  isMain?: boolean; // Es la comunidad principal (plaza central)
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
const WORLD_W = 100;
const WORLD_H = 100;
const WORLD_PX = WORLD_W * TILE;
const WORLD_PY = WORLD_H * TILE;

// Regiones - posicionadas con mas espacio
const REGIONS: Region[] = [
  {
    id: 'caba',
    name: 'CABA',
    theme: 'urban',
    palette: { ground: '#4a4a5a', groundAlt: '#5a5a6a', path: '#6a6a7a', accent: '#ff6b35' },
    description: 'Asfalto, jacarandas, palomas, adoquines portenos',
    worldX: 55, worldY: 55,
    mapX: 72, mapY: 52,
    communities: [
      { id: 'caba-main', name: 'Comunidad CABA', sport: 'padel', members: 1704, whatsapp: 'https://chat.whatsapp.com/KmzpxJFG31g8H0EC2rwUDp', city: 'Capital Federal', isMain: true },
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
    worldX: 75, worldY: 30,
    mapX: 75, mapY: 48,
    communities: [
      { id: 'gba-norte-main', name: 'Comunidad GBA Norte', sport: 'padel', members: 172, whatsapp: 'https://chat.whatsapp.com/BXQTG9HXbng4MY101ILOZW', city: 'Zona Norte', isMain: true },
      { id: 'babolat-remeros', name: 'Babolat Remeros', sport: 'padel', members: 140, whatsapp: 'https://chat.whatsapp.com/Jr4UHt6wgWG3wtkZLgE1Rj', city: 'Tigre' },
      { id: 'olivos-padel', name: 'Olivos Padel Club', sport: 'padel', members: 95, whatsapp: 'https://chat.whatsapp.com/EMD9VE3TojJ3y7S0YAUXCP', city: 'Olivos' },
      { id: 'wpc-nordelta', name: 'WPC Nordelta', sport: 'padel', members: 130, whatsapp: 'https://chat.whatsapp.com/IcExqgDCt6L3KPz1FhnqX6', city: 'Nordelta' },
      { id: 'head-hindu', name: 'Head Hindu', sport: 'padel', members: 105, whatsapp: 'https://chat.whatsapp.com/IlcHtKsFYYMIUoK34RWGmZ', city: 'Don Torcuato' },
    ]
  },
  {
    id: 'gba-sur',
    name: 'GBA Sur',
    theme: 'industrial',
    palette: { ground: '#5a5a5a', groundAlt: '#4a4a4a', path: '#7a7a7a', accent: '#ff5722' },
    description: 'Zona industrial, estadios, comunidad pujante',
    worldX: 75, worldY: 55,
    mapX: 73, mapY: 58,
    communities: [
      { id: 'gba-sur-main', name: 'Comunidad GBA Sur', sport: 'padel', members: 183, whatsapp: 'https://chat.whatsapp.com/H3VoDuisgC7HO23B0Cdlra', city: 'Zona Sur', isMain: true },
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
    worldX: 20, worldY: 55,
    mapX: 68, mapY: 52,
    communities: [
      { id: 'gba-oeste-main', name: 'Comunidad GBA Oeste', sport: 'padel', members: 129, whatsapp: 'https://chat.whatsapp.com/H4EqXrAuya47flouWTno4o', city: 'Zona Oeste', isMain: true },
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
    worldX: 20, worldY: 30,
    mapX: 58, mapY: 42,
    communities: [
      { id: 'cordoba-main', name: 'Comunidad Cordoba', sport: 'padel', members: 727, whatsapp: 'https://chat.whatsapp.com/EvEGd0DuKlb1aPREiktK0Z', city: 'Ciudad de Cordoba', isMain: true },
      { id: 'padel-poligono', name: 'Padel Poligono', sport: 'padel', members: 85, whatsapp: 'https://chat.whatsapp.com/KO3B0Z02DmWDMBEAEzOJbM', city: 'Ciudad de Cordoba' },
      { id: 'sacala-x4', name: 'Sacala x4', sport: 'padel', members: 70, whatsapp: 'https://chat.whatsapp.com/JHDHaowLeAp1EaBKojytpg', city: 'Ciudad de Cordoba' },
      { id: 'p60-espacio', name: 'P60 Espacio', sport: 'football', members: 55, whatsapp: 'https://chat.whatsapp.com/LLd0ubiCi8N672jKSXgP2K', city: 'Las Perdices' },
    ]
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    theme: 'andes',
    palette: { ground: '#8a6a4a', groundAlt: '#9a7a5a', path: '#d4a96e', accent: '#9c27b0' },
    description: 'Vinedos, Andes nevados, sol y buen vino',
    worldX: 2, worldY: 45,
    mapX: 42, mapY: 48,
    communities: [
      { id: 'mendoza-main', name: 'Comunidad Mendoza', sport: 'padel', members: 771, whatsapp: 'https://chat.whatsapp.com/GW4KNeUH8Br8FJyLBAM53e', city: 'Ciudad de Mendoza', isMain: true },
      { id: 'azcuenaga', name: 'Azcuenaga Padel', sport: 'padel', members: 65, whatsapp: 'https://chat.whatsapp.com/Ezb5h5oXQWHIzl0jU5SH8J', city: 'Lujan de Cuyo' },
    ]
  },
  {
    id: 'rosario',
    name: 'Rosario',
    theme: 'litoral',
    palette: { ground: '#3a6a3a', groundAlt: '#4a7a4a', path: '#8ab46e', accent: '#4caf50' },
    description: 'Cuna de la bandera, rio Parana, pasion futbolera',
    worldX: 55, worldY: 10,
    mapX: 62, mapY: 42,
    communities: [
      { id: 'rosario-main', name: 'Comunidad Rosario', sport: 'padel', members: 27, whatsapp: 'https://chat.whatsapp.com/KI7lpPqzTqUFetILZN5eqb', city: 'Rosario', isMain: true },
      { id: 'el-92', name: 'El 92', sport: 'padel', members: 45, whatsapp: 'https://chat.whatsapp.com/Ib7g29qdF6eJcqAkAdUDYy', city: 'San Jose de la Esquina' },
      { id: 'km8-club', name: 'KM8 Club', sport: 'padel', members: 60, whatsapp: 'https://chat.whatsapp.com/Ir6iKlVtG8d3pUeRene2TP', city: 'Santa Fe' },
    ]
  },
  {
    id: 'tucuman',
    name: 'Tucuman',
    theme: 'noa',
    palette: { ground: '#8a5a2a', groundAlt: '#9a6a3a', path: '#d4956e', accent: '#ff9800' },
    description: 'Jardin de la Republica, empanadas, cerros verdes',
    worldX: 35, worldY: 2,
    mapX: 56, mapY: 22,
    communities: [
      { id: 'tucuman-main', name: 'Comunidad Tucuman', sport: 'padel', members: 188, whatsapp: 'https://chat.whatsapp.com/G9cNLJr7Xgo4lZQSVpCSuO', city: 'San Miguel de Tucuman', isMain: true },
      { id: 'padel-point', name: 'Padel Point', sport: 'padel', members: 75, whatsapp: 'https://chat.whatsapp.com/ERrMBTFheMdCfSe2rt55SQ', city: 'Yerba Buena' },
    ]
  },
  {
    id: 'neuquen',
    name: 'Neuquen',
    theme: 'patagonia',
    palette: { ground: '#4a6a5a', groundAlt: '#3a5a4a', path: '#8ab4a4', accent: '#26a69a' },
    description: 'Lagos, volcanes, dinosaurios, petroleo',
    worldX: 2, worldY: 75,
    mapX: 45, mapY: 68,
    communities: [
      { id: 'neuquen-main', name: 'Comunidad Neuquen', sport: 'padel', members: 202, whatsapp: 'https://chat.whatsapp.com/JWNVHHrCouGJWPDChGZJnH', city: 'Ciudad de Neuquen', isMain: true },
      { id: 'efecto-padel', name: 'Efecto Padel', sport: 'padel', members: 45, whatsapp: 'https://chat.whatsapp.com/HgGsPWQ1eQI3PojipWNHNa', city: '25 de Mayo' },
    ]
  },
  {
    id: 'mar-del-plata',
    name: 'Mar del Plata',
    theme: 'coastal',
    palette: { ground: '#3a5a6a', groundAlt: '#4a6a7a', path: '#aaccdd', accent: '#00bcd4' },
    description: 'La Feliz, playas, lobos marinos, alfajores',
    worldX: 75, worldY: 75,
    mapX: 70, mapY: 62,
    communities: [
      { id: 'mdp-main', name: 'Comunidad Mar del Plata', sport: 'padel', members: 338, whatsapp: 'https://chat.whatsapp.com/Jw12EFJM8jzKtMd6GAUSJI', city: 'Mar del Plata', isMain: true },
    ]
  },
  {
    id: 'la-plata',
    name: 'La Plata',
    theme: 'urban',
    palette: { ground: '#5a5a6a', groundAlt: '#4a4a5a', path: '#7a7a8a', accent: '#2196f3' },
    description: 'Ciudad de las diagonales, estudiantes, pincha y lobo',
    worldX: 55, worldY: 75,
    mapX: 73, mapY: 55,
    communities: [
      { id: 'la-plata-main', name: 'Comunidad La Plata', sport: 'padel', members: 66, whatsapp: 'https://chat.whatsapp.com/KwKWxXXg5Th1NkZJyTj2bS', city: 'La Plata', isMain: true },
    ]
  },
  {
    id: 'salta',
    name: 'Salta',
    theme: 'noa',
    palette: { ground: '#9a6a3a', groundAlt: '#8a5a2a', path: '#c89a6e', accent: '#e65100' },
    description: 'La linda, empanadas saltenas, cerros multicolores',
    worldX: 15, worldY: 2,
    mapX: 52, mapY: 18,
    communities: [
      { id: 'salta-main', name: 'Comunidad Salta', sport: 'padel', members: 83, whatsapp: 'https://chat.whatsapp.com/ICWGzwEwftsFVniDWHTKCa', city: 'Ciudad de Salta', isMain: true },
    ]
  },
  {
    id: 'san-juan',
    name: 'San Juan',
    theme: 'cuyo',
    palette: { ground: '#9a7a4a', groundAlt: '#aa8a5a', path: '#c8a96e', accent: '#795548' },
    description: 'Sol, vino, Valle de la Luna, dique',
    worldX: 2, worldY: 25,
    mapX: 45, mapY: 42,
    communities: [
      { id: 'san-juan-main', name: 'Comunidad San Juan', sport: 'padel', members: 92, whatsapp: 'https://chat.whatsapp.com/DStJHwaCHt9BTz2TotcQw3', city: 'San Juan', isMain: true },
    ]
  },
  {
    id: 'formosa',
    name: 'Formosa',
    theme: 'noreste',
    palette: { ground: '#2a6a2a', groundAlt: '#1a5a1a', path: '#6ab46a', accent: '#00e676' },
    description: 'Calor, rio, monte, banados del chaco',
    worldX: 75, worldY: 2,
    mapX: 62, mapY: 22,
    communities: [
      { id: 'formosa-main', name: 'Comunidad Formosa', sport: 'padel', members: 151, whatsapp: 'https://chat.whatsapp.com/EevdhvdJji4J6AeFsJyp1G', city: 'Formosa', isMain: true },
    ]
  },
  {
    id: 'misiones',
    name: 'Misiones',
    theme: 'noreste',
    palette: { ground: '#1a5a1a', groundAlt: '#2a6a2a', path: '#5aa45a', accent: '#4caf50' },
    description: 'Cataratas, selva, yerba mate, tierra colorada',
    worldX: 90, worldY: 10,
    mapX: 72, mapY: 28,
    communities: [
      { id: 'blue-padel', name: 'Blue Padel Quincho', sport: 'padel', members: 55, whatsapp: 'https://chat.whatsapp.com/K6p7ZDy1XSp9a3tRirtBQr', city: 'El Dorado', isMain: true },
      { id: 'libertad-padel', name: 'Libertad Padel', sport: 'padel', members: 65, whatsapp: 'https://chat.whatsapp.com/EkXVjqJ1KAC9WIfsBin0pL', city: 'Leandro N. Alem' },
    ]
  },
  {
    id: 'resistencia',
    name: 'Resistencia',
    theme: 'noreste',
    palette: { ground: '#3a7a3a', groundAlt: '#2a6a2a', path: '#7ab47a', accent: '#66bb6a' },
    description: 'Ciudad de las esculturas, calor, chamame',
    worldX: 55, worldY: 2,
    mapX: 62, mapY: 28,
    communities: [
      { id: 'resistencia-main', name: 'Comunidad Resistencia', sport: 'padel', members: 66, whatsapp: 'https://chat.whatsapp.com/EtV8Kkfrfa22i5yFMo4XyQ', city: 'Resistencia', isMain: true },
    ]
  },
  {
    id: 'jujuy',
    name: 'Jujuy',
    theme: 'noa',
    palette: { ground: '#aa6a3a', groundAlt: '#9a5a2a', path: '#d4956e', accent: '#ff6f00' },
    description: 'Quebrada de Humahuaca, cerros de colores, pachamama',
    worldX: 2, worldY: 2,
    mapX: 52, mapY: 12,
    communities: [
      { id: 'jujuy-main', name: 'Comunidad Jujuy', sport: 'padel', members: 7, whatsapp: 'https://chat.whatsapp.com/LRkWKmcuB7iIqyUFy4IX43', city: 'San Salvador de Jujuy', isMain: true },
    ]
  },
  {
    id: 'la-rioja',
    name: 'La Rioja',
    theme: 'cuyo',
    palette: { ground: '#8a6a3a', groundAlt: '#9a7a4a', path: '#c8a96e', accent: '#a1887f' },
    description: 'Talampaya, sol, olivos, vino torrontes',
    worldX: 2, worldY: 60,
    mapX: 48, mapY: 35,
    communities: [
      { id: 'la-rioja-main', name: 'Comunidad La Rioja', sport: 'padel', members: 48, whatsapp: 'https://chat.whatsapp.com/Jg3tYcaz0660zoky0EapQZ', city: 'La Rioja', isMain: true },
      { id: 'camping-medico', name: 'Camping Medico', sport: 'padel', members: 35, whatsapp: 'https://chat.whatsapp.com/ExIEUKkHkVs2aBJj6rrMXx', city: 'Cochangasta' },
    ]
  },
  {
    id: 'tandil',
    name: 'Tandil',
    theme: 'pampas',
    palette: { ground: '#6a8a3a', groundAlt: '#7a9a4a', path: '#c8b46e', accent: '#cddc39' },
    description: 'Sierras bonaerenses, piedra movediza, salame',
    worldX: 35, worldY: 75,
    mapX: 68, mapY: 62,
    communities: [
      { id: 'tandil-main', name: 'Comunidad Tandil', sport: 'padel', members: 40, whatsapp: 'https://chat.whatsapp.com/HMCaMmFIili1UR6du3dZIQ', city: 'Tandil', isMain: true },
    ]
  },
  {
    id: 'entre-rios',
    name: 'Entre Rios',
    theme: 'litoral',
    palette: { ground: '#4a7a4a', groundAlt: '#3a6a3a', path: '#9ab49a', accent: '#81c784' },
    description: 'Termas, carnaval, arroyos, citrus',
    worldX: 55, worldY: 30,
    mapX: 68, mapY: 38,
    communities: [
      { id: 'la-quinta', name: 'La Quinta', sport: 'padel', members: 50, whatsapp: 'https://chat.whatsapp.com/ElJNSQdjww1JctOUBrb0ai', city: 'Islas Malvinas', isMain: true },
    ]
  },
  {
    id: 'buenos-aires',
    name: 'Interior BsAs',
    theme: 'pampas',
    palette: { ground: '#7a9a4a', groundAlt: '#6a8a3a', path: '#d4c46e', accent: '#dce775' },
    description: 'Llanura pampeana, estancias, campo infinito',
    worldX: 20, worldY: 75,
    mapX: 65, mapY: 58,
    communities: [
      { id: 'la-nave', name: 'La Nave Padel', sport: 'padel', members: 55, whatsapp: 'https://chat.whatsapp.com/JULhsyntLtmEXjh3Aynray', city: 'Azul', isMain: true },
      { id: 'bejota', name: 'Bejota Padel', sport: 'padel', members: 45, whatsapp: 'https://chat.whatsapp.com/EQOy4OqySIt87de0hDEphU', city: 'Azul' },
      { id: 'fultito-padel', name: 'Fultito Padel', sport: 'padel', members: 65, whatsapp: 'https://chat.whatsapp.com/BrNcS2B41ba3mtWdLqBaJt', city: 'Pergamino' },
      { id: 'fultito-futbol', name: 'Fultito Futbol', sport: 'football', members: 80, whatsapp: 'https://chat.whatsapp.com/H2mqgjyBNpsAp7UqgLOFhf', city: 'Pergamino' },
      { id: 'circuito-club', name: 'Circuito Club', sport: 'padel', members: 70, whatsapp: 'https://chat.whatsapp.com/Bo3alCpQoWB2nT7ewnMwZL', city: 'Ciudad Evita' },
    ]
  },
];

// Total communities count
const TOTAL_COMMUNITIES = REGIONS.reduce((acc, r) => acc + r.communities.length, 0);

// Terminal log entry
interface LogEntry {
  id: number;
  type: 'discovery' | 'travel' | 'info' | 'action';
  message: string;
  timestamp: Date;
  link?: string;
  community?: Community;
}

// Hub buildings with positions relative to region
interface Building {
  community: Community;
  region: Region;
  x: number;
  y: number;
  w: number;
  h: number;
  isPlaza: boolean; // Es la plaza central
}

// Calcular tamano de region segun cantidad de comunidades
function getRegionSize(communityCount: number): { w: number; h: number } {
  const clubs = communityCount - 1; // Sin contar la plaza
  // Tamanos mas grandes para evitar solapamiento
  if (clubs <= 2) return { w: 16, h: 14 };
  if (clubs <= 4) return { w: 20, h: 18 };
  return { w: 24, h: 20 };
}

// Build all buildings - plaza central + clubes alrededor
function generateBuildings(): Building[] {
  const buildings: Building[] = [];
  
  REGIONS.forEach(region => {
    const mainCommunity = region.communities.find(c => c.isMain);
    const clubs = region.communities.filter(c => !c.isMain);
    const size = getRegionSize(region.communities.length);
    
    // Plaza central (mas grande)
    if (mainCommunity) {
      const plazaSize = 5;
      buildings.push({
        community: mainCommunity,
        region,
        x: region.worldX + Math.floor(size.w / 2) - Math.floor(plazaSize / 2),
        y: region.worldY + Math.floor(size.h / 2) - Math.floor(plazaSize / 2),
        w: plazaSize,
        h: plazaSize,
        isPlaza: true,
      });
    }
    
    // Clubes alrededor de la plaza con mas separacion
    // La plaza es 5x5, los clubes son 5x4, necesitamos al menos 1 tile de separacion
    const positions = [
      { dx: -7, dy: -5 },  // arriba-izq
      { dx: 5, dy: -5 },   // arriba-der
      { dx: -7, dy: 5 },   // abajo-izq
      { dx: 5, dy: 5 },    // abajo-der
      { dx: -7, dy: 0 },   // izq
      { dx: 5, dy: 0 },    // der
    ];
    
    clubs.forEach((community, idx) => {
      if (idx >= positions.length) return;
      const pos = positions[idx];
      const centerX = region.worldX + Math.floor(size.w / 2);
      const centerY = region.worldY + Math.floor(size.h / 2);
      
      buildings.push({
        community,
        region,
        x: centerX + pos.dx,
        y: centerY + pos.dy,
        w: 5,
        h: 4,
        isPlaza: false,
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
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Initialize logs only on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    logIdRef.current = 2;
    setTerminalLogs([
      { id: 0, type: 'info', message: 'Bienvenido a ATC Campus', timestamp: new Date() },
      { id: 1, type: 'info', message: 'Explora las comunidades de Argentina', timestamp: new Date() },
    ]);
  }, []);
  const [terminalMode, setTerminalMode] = useState<'mini' | 'normal' | 'full'>('normal'); // mini=minimizado, normal=3 lineas, full=pantalla completa
  const [pendingAction, setPendingAction] = useState<{ community: Community; region: Region } | null>(null); // Comunidad esperando accion
  const [joyPos, setJoyPos] = useState({ x: 0, y: 0 }); // Posicion visual del joystick
  const terminalRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);
  
  // Game state refs - spawn EAST of stadium on the road
  // Stadium is at (48-53, 48-53), so spawn at x=55 (outside)
  const playerRef = useRef({
    x: 56 * TILE,
    y: 50 * TILE,
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

  // Add log entry
  const addLog = useCallback((type: LogEntry['type'], message: string, link?: string, community?: Community) => {
    const newLog: LogEntry = {
      id: logIdRef.current++,
      type,
      message,
      timestamp: new Date(),
      link,
      community,
    };
    setTerminalLogs(prev => [...prev.slice(-50), newLog]); // Keep last 50 entries
    
    // Auto scroll terminal
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 50);
  }, []);

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

  // Get region at position
  const getRegionAt = useCallback((x: number, y: number): Region | null => {
    for (const r of REGIONS) {
      const size = getRegionSize(r.communities.length);
      const rx = r.worldX * TILE;
      const ry = r.worldY * TILE;
      const rw = size.w * TILE;
      const rh = size.h * TILE;
      if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) {
        return r;
      }
    }
    return null;
  }, []);

  // Fast travel handler
const handleFastTravel = useCallback((region: Region) => {
  const size = getRegionSize(region.communities.length);
  // Spawn a la DERECHA de la plaza central (en el camino), no dentro
  // La plaza esta en el centro, asi que spawneamos +4 tiles a la derecha
  fadeRef.current = {
  active: true,
  alpha: 0,
  targetX: (region.worldX + size.w / 2 + 4) * TILE,
  targetY: (region.worldY + size.h / 2) * TILE,
  phase: 'out'
  };
  setShowMap(false);
  setSearchQuery('');
  addLog('travel', `Viajando a ${region.name}...`);
  }, [addLog]);

  // Hide hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Terminal minimizada en mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setTerminalMode('mini');
    }
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
      if (e.key === 't' || e.key === 'T') setTerminalMode(prev => prev === 'mini' ? 'normal' : 'mini');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Stadium center
    const STADIUM = {
      x: 48,
      y: 48,
      w: 5,
      h: 5,
    };

    // Draw plaza (comunidad principal)
    const drawPlaza = (
      bx: number, by: number, bw: number, bh: number,
      accent: string, discovered: boolean, name: string
    ) => {
      // Fondo de plaza - cesped
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(bx, by, bw, bh);
      
      // Bordes decorativos
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(bx, by, bw, 3);
      ctx.fillRect(bx, by + bh - 3, bw, 3);
      ctx.fillRect(bx, by, 3, bh);
      ctx.fillRect(bx + bw - 3, by, 3, bh);
      
      // Fuente central
      ctx.fillStyle = '#6ab4d4';
      ctx.beginPath();
      ctx.arc(bx + bw/2, by + bh/2, bw/4, 0, Math.PI * 2);
      ctx.fill();
      
      // Borde de la fuente
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Bancos (rectangulos pequenos)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(bx + 8, by + 8, 12, 4);
      ctx.fillRect(bx + bw - 20, by + 8, 12, 4);
      ctx.fillRect(bx + 8, by + bh - 12, 12, 4);
      ctx.fillRect(bx + bw - 20, by + bh - 12, 12, 4);
      
      // Faroles
      ctx.fillStyle = '#333';
      ctx.fillRect(bx + 6, by + 6, 2, 8);
      ctx.fillRect(bx + bw - 8, by + 6, 2, 8);
      ctx.fillStyle = '#ffff88';
      ctx.fillRect(bx + 5, by + 4, 4, 3);
      ctx.fillRect(bx + bw - 9, by + 4, 4, 3);
      
      // Indicador de descubierto
      if (discovered) {
        ctx.strokeStyle = '#09D85D';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      } else {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
    };

    // Draw club building
    const drawClubBuilding = (
      bx: number, by: number, bw: number, bh: number,
      sport: SportType, accent: string, discovered: boolean
    ) => {
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(bx + 4, by + 4, bw, bh);

      // Edificio base
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(bx, by, bw, bh);

      const topH = bh * 0.4;
      
      // Cancha segun deporte
      switch (sport) {
        case 'padel':
          ctx.fillStyle = '#1a5a9a';
          ctx.fillRect(bx + 2, by + 2, bw - 4, topH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + bw/2 - 1, by + 4, 2, topH - 6);
          break;
          
        case 'football':
          ctx.fillStyle = '#2d7a35';
          ctx.fillRect(bx + 2, by + 2, bw - 4, topH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 6, by + 4, bw - 12, 1);
          ctx.fillRect(bx + 6, by + topH - 2, bw - 12, 1);
          ctx.fillRect(bx + bw/2 - 1, by + 4, 1, topH - 6);
          break;
          
        case 'tennis':
          ctx.fillStyle = '#c85a2a';
          ctx.fillRect(bx + 2, by + 2, bw - 4, topH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 4, by + 4, bw - 8, 1);
          ctx.fillRect(bx + bw/2 - 1, by + 4, 1, topH - 6);
          break;
          
        default:
          ctx.fillStyle = accent;
          ctx.fillRect(bx + 2, by + 2, bw - 4, topH);
      }

      // Parte inferior
      ctx.fillStyle = '#1a252f';
      ctx.fillRect(bx, by + topH, bw, bh - topH);

      // Puerta
      const dx = bx + bw/2 - 6;
      const dy = by + bh - 14;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(dx, dy, 12, 14);
      ctx.fillStyle = '#007744';
      ctx.fillRect(dx + 1, dy + 1, 10, 12);

      // Ventanas
      ctx.fillStyle = 'rgba(255,255,200,0.7)';
      ctx.fillRect(bx + 6, by + topH + 6, 8, 6);
      ctx.fillRect(bx + bw - 14, by + topH + 6, 8, 6);

      if (discovered) {
        ctx.strokeStyle = '#09D85D';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
    };

    // Hash for random
    const hash = (x: number, y: number): number => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    // Draw themed tile
    const drawThemedTile = (tx: number, ty: number, wx: number, wy: number, region: Region | null) => {
      const h = hash(tx, ty);
      const h2 = hash(tx + 100, ty + 100);
      const h3 = hash(tx * 3, ty * 3);
      
      if (!region) {
        const baseGreen = 58 + Math.floor(h * 12);
        const greenVariation = 125 + Math.floor(h2 * 20);
        ctx.fillStyle = `rgb(${baseGreen}, ${greenVariation}, ${50 + Math.floor(h * 10)})`;
        ctx.fillRect(wx, wy, TILE, TILE);
        
        if (h3 > 0.7) {
          ctx.fillStyle = 'rgba(30,80,30,0.4)';
          const gx = Math.floor(h * 24);
          const gy = Math.floor(h2 * 24);
          ctx.fillRect(wx + gx, wy + gy, 2, 5);
          ctx.fillRect(wx + gx + 3, wy + gy + 1, 2, 4);
        }
        if (h > 0.85) {
          ctx.fillStyle = 'rgba(100,160,80,0.5)';
          const gx = Math.floor(h2 * 20) + 4;
          const gy = Math.floor(h3 * 20) + 4;
          ctx.fillRect(wx + gx, wy + gy, 3, 6);
        }
        return;
      }

      const { ground, groundAlt } = region.palette;
      ctx.fillStyle = h > 0.5 ? ground : groundAlt;
      ctx.fillRect(wx, wy, TILE, TILE);
      ctx.fillStyle = `rgba(${h > 0.5 ? '255,255,255' : '0,0,0'},${0.02 + h2 * 0.04})`;
      ctx.fillRect(wx, wy, TILE, TILE);

      switch (region.theme) {
        case 'urban':
        case 'suburban':
        case 'industrial':
          if (h > 0.3) {
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(wx + Math.floor(h * 28), wy + Math.floor(h2 * 28), 4, 4);
          }
          break;
        case 'sierras':
          if (h > 0.85) {
            ctx.fillStyle = 'rgba(100,90,80,0.5)';
            ctx.fillRect(wx + Math.floor(h2 * 20) + 4, wy + Math.floor(h3 * 20) + 4, 6, 4);
          }
          break;
        case 'patagonia':
          if (h > 0.75) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            const size = 4 + Math.floor(h2 * 6);
            ctx.fillRect(wx + Math.floor(h3 * 20) + 4, wy + Math.floor(h * 20) + 4, size, size);
          }
          break;
        case 'noa':
          if (h > 0.92) {
            ctx.fillStyle = '#4a6a3a';
            ctx.fillRect(wx + 14, wy + 8, 3, 16);
            ctx.fillRect(wx + 11, wy + 12, 3, 4);
          }
          break;
        case 'litoral':
        case 'noreste':
          if (h > 0.8) {
            ctx.fillStyle = 'rgba(40,100,40,0.4)';
            ctx.fillRect(wx + Math.floor(h2 * 22) + 2, wy + Math.floor(h3 * 18) + 4, 4, 7);
          }
          break;
        case 'pampas':
          if (h > 0.6) {
            ctx.fillStyle = 'rgba(100,130,60,0.35)';
            ctx.fillRect(wx + Math.floor(h2 * 24), wy + Math.floor(h3 * 22), 3, 6);
          }
          break;
      }
    };

    // Draw player with animations
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

      // legOff crea la animación de caminar
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

      // Arms (se mueven opuestas a las piernas)
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

      // Eyes (solo visibles de frente/costado)
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

    // Game loop
    let animId: number;
    let lastDiscoveredCount = discoveredRef.current.size;
    
    const gameLoop = () => {
      const player = playerRef.current;
      const cam = camRef.current;
      const keys = keysRef.current;
      const joy = joyRef.current;
      const buildings = buildingsRef.current;
      const fade = fadeRef.current;

      // Fade transition
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

      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }

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

      if (!checkCollision(newX, player.y)) player.x = newX;
      if (!checkCollision(player.x, newY)) player.y = newY;

      player.x = Math.max(0, Math.min(WORLD_PX - player.w, player.x));
      player.y = Math.max(0, Math.min(WORLD_PY - player.h, player.y));

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

      cam.x = player.x - canvas.width / 2 + player.w / 2;
      cam.y = player.y - canvas.height / 2 + player.h / 2;
      cam.x = Math.max(0, Math.min(WORLD_PX - canvas.width, cam.x));
      cam.y = Math.max(0, Math.min(WORLD_PY - canvas.height, cam.y));

      const reg = getRegionAt(player.x, player.y);
      if (reg !== currentRegion) {
        setCurrentRegion(reg);
        if (reg) {
          addLog('info', `Entraste a ${reg.name}`);
        }
      }

      // Check building proximity
      let nearCommunity: Community | null = null;
      for (const b of buildings) {
        const bx = b.x * TILE;
        const by = b.y * TILE;
        const bw = b.w * TILE;
        const bh = b.h * TILE;
        const dist = 20;
        if (player.x + player.w > bx - dist && player.x < bx + bw + dist &&
            player.y + player.h > by - dist && player.y < by + bh + dist) {
          nearCommunity = b.community;
          
          if (!discoveredRef.current.has(b.community.id)) {
            discoveredRef.current.add(b.community.id);
            setDiscoveredCount(discoveredRef.current.size);
            addLog('discovery', `Descubriste ${b.community.name}!`, b.community.whatsapp, b.community);
          }
          break;
        }
      }
      // Si estamos cerca de una comunidad descubierta, mostrarla como accion pendiente en terminal
  if (nearCommunity && discoveredRef.current.has(nearCommunity.id)) {
    const comm = nearCommunity; // Capturar en variable local
    const nearRegion = REGIONS.find(r => r.communities.some(c => c.id === comm.id));
    if (nearRegion) {
      setPendingAction({ community: comm, region: nearRegion });
    }
  } else {
    setPendingAction(null);
  }

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
      ctx.fillRect(-cam.x, (WORLD_H / 2 - 1.5) * TILE - cam.y, WORLD_PX, roadW);
      ctx.fillRect((WORLD_W / 2 - 1.5) * TILE - cam.x, -cam.y, roadW, WORLD_PY);

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
        
        if (b.isPlaza) {
          drawPlaza(bx, by, bw, bh, b.region.palette.accent, discovered, b.community.name);
        } else {
          drawClubBuilding(bx, by, bw, bh, b.community.sport, b.region.palette.accent, discovered);
        }
        
        // Name label
        ctx.fillStyle = b.isPlaza ? 'rgba(0,86,75,0.9)' : 'rgba(0,0,0,0.7)';
        const labelText = b.community.name.length > 18 ? b.community.name.substring(0, 16) + '...' : b.community.name;
        const textWidth = ctx.measureText(labelText).width + 16;
        ctx.fillRect(bx + bw/2 - textWidth/2, by - 18, textWidth, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = b.isPlaza ? 'bold 10px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labelText, bx + bw/2, by - 6);
      }

      // Draw player
      const px = player.x - cam.x;
      const py = player.y - cam.y;
      drawPlayer(px, py);

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
  }, [currentRegion, getRegionAt, addLog]);

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
    
    // Normalizar para que no se salga del circulo
    const normalizedX = Math.max(-1, Math.min(1, dx));
    const normalizedY = Math.max(-1, Math.min(1, dy));
    
    // Actualizar posicion visual del joystick
    setJoyPos({ x: normalizedX, y: normalizedY });
    
    if (len > 0.2) {
      joyRef.current.dx = normalizedX;
      joyRef.current.dy = normalizedY;
    } else {
      joyRef.current.dx = 0;
      joyRef.current.dy = 0;
    }
  }, []);

  const handleJoyEnd = useCallback(() => {
    joyRef.current.active = false;
    joyRef.current.dx = 0;
    joyRef.current.dy = 0;
    setJoyPos({ x: 0, y: 0 });
  }, []);

  return (
    <div className="fixed inset-0 bg-[#1a2a1a] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" style={{ touchAction: 'none', display: 'block' }} />
      
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
  {discoveredCount}/{TOTAL_COMMUNITIES}
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
          WASD para moverte | M mapa | T terminal
        </div>
      )}

      {/* Terminal */}
  <div className={`fixed transition-all duration-300 ${
    terminalMode === 'full' 
      ? 'inset-4 md:inset-8' 
      : terminalMode === 'mini'
        ? 'bottom-0 left-4 right-4 md:left-auto md:right-4 md:w-72'
        : 'bottom-0 left-4 right-4 md:left-auto md:right-4 md:w-80'
  } bg-[#0a0f0a] border border-[#1a2a1a] ${terminalMode === 'full' ? 'rounded-lg' : 'rounded-t-lg'} overflow-hidden shadow-2xl z-50 flex flex-col`}>
    
    {/* Header */}
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#00564B] shrink-0">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${pendingAction ? 'bg-[#ff9800] animate-pulse' : 'bg-[#09D85D]'}`} />
        <span className="text-white text-[10px] font-bold font-mono">TERMINAL</span>
        {terminalMode === 'mini' && terminalLogs.length > 0 && (
          <span className="text-white/60 text-[10px] truncate max-w-[120px]">
            {terminalLogs[terminalLogs.length - 1]?.message.substring(0, 25)}...
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {/* Minimizar */}
        <button
          onClick={() => setTerminalMode(terminalMode === 'mini' ? 'normal' : 'mini')}
          className="p-1 text-white/60 hover:text-white transition-colors"
          title={terminalMode === 'mini' ? 'Expandir' : 'Minimizar'}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={terminalMode === 'mini' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
          </svg>
        </button>
        {/* Fullscreen */}
        <button
          onClick={() => setTerminalMode(terminalMode === 'full' ? 'normal' : 'full')}
          className="p-1 text-white/60 hover:text-white transition-colors"
          title={terminalMode === 'full' ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {terminalMode === 'full' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
        </button>
      </div>
    </div>
    
    {/* Content - visible si no esta minimizado */}
    {terminalMode !== 'mini' && (
      <>
        {/* Logs */}
        <div
          ref={terminalRef}
          className={`overflow-y-auto p-2 font-mono text-[10px] space-y-1 ${terminalMode === 'full' ? 'flex-1' : 'h-16'}`}
        >
          {(terminalMode === 'full' ? terminalLogs : terminalLogs.slice(-3)).map((log) => (
            <div key={log.id} className="flex items-start gap-1.5">
              <span className="text-[#555] shrink-0 text-[9px]">
                {log.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={`flex-1 ${
                log.type === 'discovery' ? 'text-[#09D85D]' :
                log.type === 'travel' ? 'text-[#00bcd4]' :
                log.type === 'info' ? 'text-[#777]' :
                'text-[#ff9800]'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
        
        {/* Accion pendiente - comunidad descubierta */}
        {pendingAction && (
          <div className="px-2 py-2 bg-[#0d1a0d] border-t border-[#1a2a1a]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">{SPORT_EMOJI[pendingAction.community.sport]}</span>
                <div className="min-w-0">
                  <p className="text-[#09D85D] text-[10px] font-bold truncate">{pendingAction.community.name}</p>
                  <p className="text-[#666] text-[8px]">{pendingAction.community.members} miembros</p>
                </div>
              </div>
              <a
                href={pendingAction.community.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[9px] font-bold rounded transition-colors"
              >
                Unirme
              </a>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="px-2 py-1 bg-[#060a06] border-t border-[#1a2a1a] flex items-center gap-1 shrink-0">
          <span className="text-[#09D85D] text-[10px]">$</span>
          <span className="text-[#444] text-[10px] animate-pulse">_</span>
          <span className="text-[#333] text-[8px] ml-auto">T: ocultar</span>
        </div>
      </>
    )}
  </div>

      {/* Boton mapa flotante - mobile */}
      <button
        onClick={() => setShowMap(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-[#00564B] border-2 border-[#09D85D] flex items-center justify-center text-[#09D85D] font-bold text-xs md:hidden"
      >
        M
      </button>

      {/* Joystick (mobile) - visible en pantallas pequenas */}
      <div
        className="fixed bottom-8 left-8 w-28 h-28 rounded-full bg-black/40 border-2 border-white/20 md:hidden touch-none z-40"
        onTouchStart={handleJoyStart}
        onTouchMove={handleJoyMove}
        onTouchEnd={handleJoyEnd}
        onMouseDown={handleJoyStart}
        onMouseMove={handleJoyMove}
        onMouseUp={handleJoyEnd}
        onMouseLeave={handleJoyEnd}
      >
        <div
          className="absolute w-10 h-10 rounded-full bg-white/30 border-2 border-white/50 pointer-events-none"
          style={{
            left: `${50 + joyPos.x * 35}%`,
            top: `${50 + joyPos.y * 35}%`,
            transform: 'translate(-50%, -50%)',
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
            <div className="flex items-center justify-between px-5 py-3 bg-[#00564B] shrink-0">
              <div>
                <h2 className="text-white text-lg font-bold">ARGENTINA</h2>
                <p className="text-[#88ccaa] text-xs">{discoveredCount}/{TOTAL_COMMUNITIES} comunidades</p>
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

            {/* Tabs */}
            <div className="flex border-b border-[#1a2a1a] shrink-0">
              <button
                onClick={() => setMapView('map')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  mapView === 'map' 
                    ? 'bg-[#1a2a1a] text-[#09D85D] border-b-2 border-[#09D85D]' 
                    : 'text-[#888] hover:text-white'
                }`}
              >
                Mapa
              </button>
              <button
                onClick={() => setMapView('list')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  mapView === 'list' 
                    ? 'bg-[#1a2a1a] text-[#09D85D] border-b-2 border-[#09D85D]' 
                    : 'text-[#888] hover:text-white'
                }`}
              >
                Lista
              </button>
            </div>

            {/* Content */}
            {mapView === 'map' ? (
              /* Vista Mapa Visual estilo Pokemon */
              <div className="flex-1 overflow-hidden p-3 bg-[#0a0f0a]">
                <div className="relative w-full aspect-[3/4] max-h-[60vh] mx-auto rounded-lg overflow-hidden border-4 border-[#2a3a2a]" style={{ background: 'linear-gradient(135deg, #1a3a6a 0%, #2a4a8a 50%, #1a3a6a 100%)' }}>
                  {/* Water pattern overlay */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)'
                  }} />
                  
                  {/* Argentina landmass shape - simplified */}
                  <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full">
                    {/* Main landmass */}
                    <path
                      d="M30 8 L55 5 L70 10 L75 20 L72 35 L70 50 L68 65 L65 80 L60 95 L55 110 L50 125 L45 135 L42 125 L38 110 L35 95 L32 80 L30 65 L28 50 L30 35 L32 20 Z"
                      fill="#3a7a3a"
                      stroke="#2a5a2a"
                      strokeWidth="1"
                    />
                    {/* Lighter grass patches */}
                    <path d="M35 15 L50 12 L60 18 L55 30 L40 28 Z" fill="#4a9a4a" opacity="0.6" />
                    <path d="M38 50 L55 48 L58 60 L45 65 Z" fill="#4a9a4a" opacity="0.5" />
                    <path d="M40 85 L55 82 L52 98 L42 95 Z" fill="#4a9a4a" opacity="0.4" />
                  </svg>
                  
                  {/* Regions as clickable squares */}
                  {REGIONS.map((region) => {
                    const discoveredInRegion = region.communities.filter(c => discoveredRef.current.has(c.id)).length;
                    const allDiscovered = discoveredInRegion === region.communities.length;
                    const hasDiscovery = discoveredInRegion > 0;
                    
                    // Map coordinates based on mapX/mapY (normalized to 0-100 range)
                    const x = ((region.mapX - 40) / 40) * 70 + 15; // 15-85% range
                    const y = ((region.mapY - 10) / 60) * 85 + 5;  // 5-90% range
                    
                    return (
                      <button
                        key={region.id}
                        onClick={() => handleFastTravel(region)}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 hover:scale-125 hover:z-10"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                        title={`${region.name} (${discoveredInRegion}/${region.communities.length})`}
                      >
                        {/* Building icon */}
                        <div 
                          className={`w-5 h-5 md:w-6 md:h-6 rounded-sm border-2 ${
                            allDiscovered 
                              ? 'border-[#09D85D] bg-[#09D85D]' 
                              : hasDiscovery 
                                ? 'border-[#ff9800] bg-[#8a4a00]'
                                : 'border-[#5a3a1a] bg-[#3a2a1a]'
                          }`}
                          style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
                        >
                          {/* Inner square detail */}
                          <div className={`w-full h-full flex items-center justify-center ${
                            allDiscovered ? 'bg-[#006607]' : hasDiscovery ? 'bg-[#5a3000]' : 'bg-[#2a1a0a]'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              allDiscovered ? 'bg-[#09D85D]' : hasDiscovery ? 'bg-[#ff9800]' : 'bg-[#4a3a2a]'
                            }`} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* Hub central marker */}
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8"
                    style={{ left: '50%', top: '55%' }}
                  >
                    <div className="w-full h-full rounded-full bg-[#00564B] border-2 border-[#09D85D] flex items-center justify-center animate-pulse">
                      <span className="text-[6px] md:text-[8px] font-bold text-[#09D85D]">ATC</span>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-2 left-2 bg-[#0a0f0a]/90 rounded px-2 py-1 text-[8px] space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#09D85D] rounded-sm" />
                      <span className="text-[#888]">Completa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#ff9800] rounded-sm" />
                      <span className="text-[#888]">En progreso</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#3a2a1a] border border-[#5a3a1a] rounded-sm" />
                      <span className="text-[#888]">Sin explorar</span>
                    </div>
                  </div>
                  
                  {/* Region name on hover - shown at top */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0a0f0a]/90 rounded px-3 py-1">
                    <span className="text-[#09D85D] text-xs font-bold">Toca una ciudad para viajar</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Vista Lista */
              <>
                <div className="px-4 py-3 bg-[#0d1210] border-b border-[#1a2a1a] shrink-0">
                  <input
                    type="text"
                    placeholder="Buscar region o comunidad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a2a1a] border border-[#2a3a2a] rounded-lg text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00564B]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                          <span className={`text-sm font-bold ${allDiscovered ? 'text-[#09D85D]' : 'text-[#888]'}`}>
                            {discoveredInRegion}/{region.communities.length}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
            
            {/* Footer */}
            <div className="px-5 py-3 bg-[#0a0f0a] border-t border-[#1a1a1a] flex items-center justify-center gap-4 shrink-0">
              <kbd className="px-2 py-1 bg-[#1a1a1a] text-[#888] text-xs rounded border border-[#333]">M</kbd>
              <span className="text-[#555] text-xs">para cerrar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
