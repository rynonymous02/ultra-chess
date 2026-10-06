// Map: (4) Plus-Lane (Classic 4-Player 14x14 Cross)
export const plusLaneMap = {
  id: 'plus-lane',
  name: '(4) Plus-Lane',
  playersCount: 4,
  boardSize: 14,
  isCross: true,
  desc: 'Papan salib 14x14 (4P). Debuff: jarak Benteng, Gajah, & Ratu maks 8 petak.',
  activeSpawns: [1, 2, 3, 4],
  initPieces(board, getInitialPos, BACK_RANK_ORDER) {
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 8; i++) {
        const [r0, c0] = [
          [13, 3 + i],
          [3 + i, 0],
          [0, 10 - i],
          [10 - i, 13]
        ][p];
        board[r0][c0] = { p, t: BACK_RANK_ORDER[i] };

        const [r1, c1] = [
          [12, 3 + i],
          [3 + i, 1],
          [1, 10 - i],
          [10 - i, 12]
        ][p];
        board[r1][c1] = { p, t: 'P' };
      }
    }
  }
};
