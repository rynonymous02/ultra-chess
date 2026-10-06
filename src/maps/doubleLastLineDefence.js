// Map: (5) Double-Last-Line Defence
// Fitur: Player 5 di tengah dengan dualapis bidak dan 2 Raja. Kalah jika kedua raja dimakan.
// Jarak simetris konsisten: 2 petak dari semua 4 kubu pemain (Utara, Selatan, Barat, Timur).

export const doubleLastLineDefenceMap = {
  id: 'double-last-line-defence',
  name: '(5) Double-Last-Line Defence',
  playersCount: 5,
  boardSize: 14,
  isCross: true,
  desc: 'Pertahanan tengah dualapis Player 5 (Buff 2x Turn). Debuff: jarak R/B/Q maks 8 petak.',
  activeSpawns: [1, 2, 3, 4, 5],
  hasDualKing: true,
  initPieces(board, getInitialPos, BACK_RANK_ORDER) {
    // 4 Pemain Luar (P0 Merah, P1 Biru, P2 Kuning, P3 Hijau)
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

    // Player 5: Benteng Simetris 6x6 di Tengah (Baris 4-9, Kolom 4-9)
    // Jarak buffer konsisten: tepat 2 petak dari pion ke-4 kubu pemain!
    const P5 = 4;

    // Lapisan 1 (Outer Perimeter Pawns): Baris 4, Baris 9, Kolom 4, Kolom 9
    for (let c = 4; c <= 9; c++) {
      board[4][c] = { p: P5, t: 'P' };
      board[9][c] = { p: P5, t: 'P' };
    }
    for (let r = 5; r <= 8; r++) {
      board[r][4] = { p: P5, t: 'P' };
      board[r][9] = { p: P5, t: 'P' };
    }

    // Lapisan 2 (Inner Ring):
    // Sudut benteng dalam
    board[5][5] = { p: P5, t: 'R' };
    board[5][8] = { p: P5, t: 'R' };
    board[8][5] = { p: P5, t: 'R' };
    board[8][8] = { p: P5, t: 'R' };

    // Kuda pengawal
    board[5][6] = { p: P5, t: 'N' };
    board[5][7] = { p: P5, t: 'N' };
    board[8][6] = { p: P5, t: 'N' };
    board[8][7] = { p: P5, t: 'N' };

    // Gajah pengawal sisi
    board[6][5] = { p: P5, t: 'B' };
    board[7][5] = { p: P5, t: 'B' };
    board[6][8] = { p: P5, t: 'B' };
    board[7][8] = { p: P5, t: 'B' };

    // Inti Pusat (2 Raja & 2 Ratu):
    // Dua Raja: (6, 7) dan (7, 6)
    board[6][6] = { p: P5, t: 'Q' };
    board[6][7] = { p: P5, t: 'K' }; // Raja 1
    board[7][6] = { p: P5, t: 'K' }; // Raja 2
    board[7][7] = { p: P5, t: 'Q' };
  }
};
