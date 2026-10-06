// Map: (2) Default-Lane (Standard 8x8 1v1 Chess)
export const defaultLaneMap = {
  id: 'default-lane',
  name: '(2) Default-Lane (1 vs 1)',
  playersCount: 2,
  boardSize: 8,
  isCross: false,
  desc: 'Papan catur normal standar 8x8 untuk 2 pemain.',
  activeSpawns: [1, 2],
  initPieces(board, _, BACK_RANK_ORDER) {
    // Player 1 (Top / Black): rows 0 and 1
    for (let i = 0; i < 8; i++) {
      board[0][i] = { p: 1, t: BACK_RANK_ORDER[i] };
      board[1][i] = { p: 1, t: 'P' };
    }
    // Player 0 (Bottom / White): rows 6 and 7
    for (let i = 0; i < 8; i++) {
      board[6][i] = { p: 0, t: 'P' };
      board[7][i] = { p: 0, t: BACK_RANK_ORDER[i] };
    }
  }
};
