// Maps Registry & Custom Maps Storage
import { plusLaneMap } from './plusLane.js';
import { defaultLaneMap } from './defaultLane.js';
import { doubleLastLineDefenceMap } from './doubleLastLineDefence.js';

const BUILTIN_MAPS = [
  plusLaneMap,
  defaultLaneMap,
  doubleLastLineDefenceMap
];

const STORAGE_KEY = 'ultra_catur_custom_maps';

export function getCustomMaps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomMap(mapData) {
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
    for (const mapData of mapsArray) {
      if (!mapData || !mapData.id) continue;
      const idx = list.findIndex(m => m.id === mapData.id);
      if (idx >= 0) {
        list[idx] = mapData;
      } else {
        list.push(mapData);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
  return [...BUILTIN_MAPS, ...getCustomMaps()];
}

export function getMapById(id) {
  return getAllMaps().find(m => m.id === id) || plusLaneMap;
}
