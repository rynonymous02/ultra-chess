// Pieces SVG Registry & Skin System
import kingSvg from './king.svg?raw';
import queenSvg from './queen.svg?raw';
import bishopSvg from './bishop.svg?raw';
import knightSvg from './knight.svg?raw';
import rookSvg from './rook.svg?raw';
import pawnSvg from './pawn.svg?raw';

export const PIECE_SKINS = {
  default: {
    id: 'default',
    name: 'Shadow Facet (Default)',
    pieces: {
      K: kingSvg,
      Q: queenSvg,
      B: bishopSvg,
      N: knightSvg,
      R: rookSvg,
      P: pawnSvg
    }
  }
};

/**
 * Mengambil markup SVG bidak sesuai tipe dan skin
 * @param {string} type - 'K' | 'Q' | 'B' | 'N' | 'R' | 'P'
 * @param {string} [skin='default']
 * @returns {string} Markup SVG string
 */
export function getPieceSvg(type, skin = 'default') {
  const t = (type || 'P').toUpperCase();
  const selectedSkin = PIECE_SKINS[skin] || PIECE_SKINS.default;
  return selectedSkin.pieces[t] || selectedSkin.pieces.P;
}

/**
 * Mendaftarkan custom skin baru dengan mudah
 * @param {string} id
 * @param {string} name
 * @param {{ K: string, Q: string, B: string, N: string, R: string, P: string }} pieces
 */
export function registerPieceSkin(id, name, pieces) {
  PIECE_SKINS[id] = { id, name, pieces };
}
