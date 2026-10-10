// Maps Registry & Custom Maps Storage
import { plusLaneMap } from './plusLane.js';
import { defaultLaneMap } from './defaultLane.js';
import { doubleLastLineDefenceMap } from './doubleLastLineDefence.js';
import { humanWaveMap } from './human-wave.js';
import { mapKustom752Map } from './map-kustom-752.js';

const BUILTIN_MAPS = [
  plusLaneMap,
  defaultLaneMap,
  doubleLastLineDefenceMap,
  humanWaveMap,
  mapKustom752Map
];

const STORAGE_KEY = 'ultra_catur_custom_maps';

export function isBuiltinMap(id) {
  if (!id) return false;
  return BUILTIN_MAPS.some(m => m.id === id);
}

export function getCustomMaps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    // Bersihkan map official/built-in yang mungkin sempat tersimpan ke localStorage
    const filtered = list.filter(m => m && m.id && !isBuiltinMap(m.id));
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    return [];
  }
}

export function saveCustomMap(mapData) {
  if (!mapData || !mapData.id || isBuiltinMap(mapData.id)) {
    return;
  }
  try {
    const list = getCustomMaps();
    const idx = list.findIndex(m => m.id === mapData.id);
    if (idx >= 0) {
      list[idx] = mapData;
    } else {
      list.push(mapData);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Gagal menyimpan custom map ke localStorage:', e);
  }
}

export function saveMultipleCustomMaps(mapsArray) {
  try {
    const list = getCustomMaps();
    let changed = false;
    for (const mapData of mapsArray) {
      if (!mapData || !mapData.id || isBuiltinMap(mapData.id)) continue;
      const idx = list.findIndex(m => m.id === mapData.id);
      if (idx >= 0) {
        list[idx] = mapData;
      } else {
        list.push(mapData);
      }
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Gagal menyimpan beberapa custom map ke localStorage:', e);
  }
}

export function deleteCustomMap(id) {
  try {
    const list = getCustomMaps().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Gagal menghapus custom map:', e);
  }
}

export function getAllMaps() {
  const custom = getCustomMaps();
  const seen = new Set();
  const result = [];
  for (const m of [...BUILTIN_MAPS, ...custom]) {
    if (m && m.id && !seen.has(m.id)) {
      seen.add(m.id);
      result.push(m);
    }
  }
  return result;
}

export function getMapById(id) {
  return getAllMaps().find(m => m.id === id) || plusLaneMap;
}
