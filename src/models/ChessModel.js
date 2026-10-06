// MVC Architecture - MODEL
// Model: Pure business logic supporting 14x14 Plus (4P) and 8x8 Standard (1v1)

export const BOARD_SIZE = 14;

export const COLOR_PRESETS = [
  { id: 'red', name: 'Merah', color: '#f43f5e', bgPastel: '#ffe4e6', borderPastel: '#fda4af', textPastel: '#9f1239' },
  { id: 'blue', name: 'Biru', color: '#0ea5e9', bgPastel: '#e0f2fe', borderPastel: '#7dd3fc', textPastel: '#0369a1' },
  { id: 'yellow', name: 'Kuning', color: '#eab308', bgPastel: '#fef9c3', borderPastel: '#fde047', textPastel: '#854d0e' },
  { id: 'green', name: 'Hijau', color: '#10b981', bgPastel: '#dcfce7', borderPastel: '#86efac', textPastel: '#166534' },
  { id: 'purple', name: 'Ungu', color: '#a855f7', bgPastel: '#f3e8ff', borderPastel: '#d8b4fe', textPastel: '#6b21a8' },
  { id: 'orange', name: 'Oranye', color: '#f97316', bgPastel: '#ffedd5', borderPastel: '#fdba74', textPastel: '#9a3412' },
  { id: 'cyan', name: 'Sian', color: '#06b6d4', bgPastel: '#cffafe', borderPastel: '#67e8f9', textPastel: '#155e75' },
  { id: 'pink', name: 'Pink', color: '#ec4899', bgPastel: '#fce7f3', borderPastel: '#f472b6', textPastel: '#9d174d' }
];

export const PLAYERS = [
  {
    id: 0,
    name: 'Merah',
    color: '#f43f5e',
    bgPastel: '#ffe4e6',
    borderPastel: '#fda4af',
    textPastel: '#9f1239',
    zone: 'Selatan',
    baseCoord: 'd1 – k2'
  },
  {
    id: 1,
    name: 'Biru',
    color: '#0ea5e9',
    bgPastel: '#e0f2fe',
    borderPastel: '#7dd3fc',
    textPastel: '#0369a1',
    zone: 'Barat',
    baseCoord: 'a4 – b11'
  },
  {
    id: 2,
    name: 'Kuning',
    color: '#eab308',
    bgPastel: '#fef9c3',
    borderPastel: '#fde047',
    textPastel: '#854d0e',
    zone: 'Utara',
    baseCoord: 'd13 – k14'
  },
  {
    id: 3,
    name: 'Hijau',
    color: '#10b981',
    bgPastel: '#dcfce7',
    borderPastel: '#86efac',
    textPastel: '#166534',
    zone: 'Timur',
    baseCoord: 'm4 – n11'
  }
];

export const MAP_PRESETS = [
  {
    id: 'plus-lane',
    name: '(4) Plus-Lane',
    playersCount: 4,
    size: '14x14 Salib',
    boardSize: 14,
    isCross: true,
    desc: 'Papan salib klasik 4 pemain.'
  },
  {
    id: 'default-lane',
    name: '(2) Default-Lane (1 vs 1)',
    playersCount: 2,
    size: '8x8 Normal',
    boardSize: 8,
    isCross: false,
    desc: 'Papan normal 8x8 standar 1 vs 1 tanpa tanda plus.'
  }
];

export const PIECE_SYMBOLS = {
  K: '♚',
  Q: '♛',
  R: '♜',
  B: '♝',
  N: '♞',
  P: '♟'
};

export const PIECE_VALUES = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
  K: 100
};

export const BACK_RANK_ORDER = 'RNBQKBNR';

export const DIRECTIONS_4P = [
  [-1, 0], // Red: Up
  [0, 1],  // Blue: Right
  [1, 0],  // Yellow: Down
  [0, -1]  // Green: Left
];

export const DIFFICULTY_LABELS = {
  human: 'Human',
  easy: 'Bot Santai',
  med: 'Bot Taktis',
  hard: 'Bot Master'
};

export const RATING_BADGES = {
  genius: { label: 'Genius', color: '#c084fc', desc: 'Langkah brilian' },
  good: { label: 'Bagus', color: '#86efac', desc: 'Langkah akurat' },
  blunder: { label: 'Blunder', color: '#fca5a5', desc: 'Langkah merugikan' }
};

export function isValidCell(r, c, boardSize = 14) {
  if (r < 0 || c < 0 || r >= boardSize || c >= boardSize) return false;
  if (boardSize === 8) return true; // Normal 8x8: all squares valid
  return !((r < 3 || r > 10) && (c < 3 || c > 10)); // 14x14 cross
}

export function toAlgebraic(r, c, boardSize = 14) {
  return String.fromCharCode(97 + c) + (boardSize - r);
}

export class ChessModel {
  constructor(options = {}) {
    this.mode = options.mode || 'team';
    this.lone = options.lone !== undefined ? options.lone : 0;
    this.slots = options.slots ? [...options.slots] : ['human', 'easy', 'easy', 'easy'];
    this.mapId = options.mapId || 'plus-lane';
    this.boardSize = this.mapId === 'default-lane' ? 8 : 14;
    this.players = options.players ? options.players.map(p => ({ ...p })) : PLAYERS.map(p => ({ ...p }));
    this.reset();
  }

  reset() {
    this.boardSize = this.mapId === 'default-lane' ? 8 : 14;
    const N = this.boardSize;
    this.board = Array.from({ length: N }, () => Array(N).fill(null));

    if (this.mapId === 'default-lane') {
      // 1 VS 1 NORMAL 8x8
      this.team = [0, 1, 1, 1];
      this.alive = [true, true, false, false];

      // Player 0 (Bottom): rows 6 and 7
      for (let i = 0; i < 8; i++) {
        this.board[7][i] = { p: 0, t: BACK_RANK_ORDER[i] };
        this.board[6][i] = { p: 0, t: 'P' };
      }

      // Player 1 (Top): rows 0 and 1
      for (let i = 0; i < 8; i++) {
        this.board[0][i] = { p: 1, t: BACK_RANK_ORDER[i] };
        this.board[1][i] = { p: 1, t: 'P' };
      }
    } else {
      // 4 PLAYER CROSS 14x14
      if (this.mode === 'team') {
        this.team = [0, 1, 0, 1];
      } else if (this.mode === 'ffa') {
        this.team = [0, 1, 2, 3];
      } else {
        this.team = [0, 1, 2, 3].map(i => (i === this.lone ? 0 : 1));
      }

      this.alive = [true, true, true, true];

      for (let p = 0; p < 4; p++) {
        for (let i = 0; i < 8; i++) {
          const [r0, c0] = [
            [13, 3 + i],
            [3 + i, 0],
            [0, 10 - i],
            [10 - i, 13]
          ][p];
          this.board[r0][c0] = { p, t: BACK_RANK_ORDER[i] };

          const [r1, c1] = [
            [12, 3 + i],
            [3 + i, 1],
            [1, 10 - i],
            [10 - i, 12]
          ][p];
          this.board[r1][c1] = { p, t: 'P' };
        }
      }
    }

    this.cur = 0;
    this.over = null;
    this.last = null;
    this.hist = [];
    this.msg = '';
  }

  cloneBoard(board = this.board) {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  }

  isValid(r, c) {
    return isValidCell(r, c, this.boardSize);
  }

  isPawnPromo(player, r) {
    if (this.mapId === 'default-lane') {
      return player === 0 ? r === 0 : r === 7;
    }
    const rank = [13 - r, null, r, null][player];
    return player === 0 ? r <= 6 : player === 1 ? r >= 7 : player === 2 ? r >= 7 : r <= 6;
  }

  genMoves(board, p) {
    const m = [];
    const N = this.boardSize;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = board[r][c];
        if (!x || x.p !== p) continue;

        const add = (a, d) => m.push([r, c, a, d]);
        const tr = (a, d) => {
          if (!this.isValid(a, d)) return 0;
          const y = board[a][d];
          if (!y) {
            add(a, d);
            return 1;
          }
          if (this.team[y.p] !== this.team[p]) add(a, d);
          return 0;
        };

        if (x.t === 'P') {
          // Pawns
          if (this.mapId === 'default-lane') {
            const dir = p === 0 ? -1 : 1;
            const startRow = p === 0 ? 6 : 1;
            const a = r + dir;

            if (this.isValid(a, c) && !board[a][c]) {
              add(a, c);
              const a2 = r + dir * 2;
              if (r === startRow && this.isValid(a2, c) && !board[a2][c]) {
                add(a2, c);
              }
            }

            for (const dc of [1, -1]) {
              const d = c + dc;
              if (this.isValid(a, d)) {
                const y = board[a][d];
                if (y && this.team[y.p] !== this.team[p]) add(a, d);
              }
            }
          } else {
            // 14x14 Plus 4P
            const f = DIRECTIONS_4P[p];
            const a = r + f[0];
            const d = c + f[1];

            if (this.isValid(a, d) && !board[a][d]) {
              add(a, d);
              const a2 = a + f[0];
              const d2 = d + f[1];
              const isStartRank = (p === 0 && r === 12) || (p === 1 && c === 1) || (p === 2 && r === 1) || (p === 3 && c === 12);
              if (isStartRank && this.isValid(a2, d2) && !board[a2][d2]) {
                add(a2, d2);
              }
            }

            const diagonals = f[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
            for (const s of diagonals) {
              const a3 = a + s[0];
              const d3 = d + s[1];
              if (this.isValid(a3, d3)) {
                const y = board[a3][d3];
                if (y && this.team[y.p] !== this.team[p]) add(a3, d3);
              }
            }
          }
        } else if (x.t === 'N') {
          for (const [a, d] of [[1, 2], [2, 1]]) {
            for (const s of [1, -1]) {
              for (const u of [1, -1]) {
                tr(r + a * s, c + d * u);
              }
            }
          }
        } else {
          const dg = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
          const og = [[1, 0], [-1, 0], [0, 1], [0, -1]];
          const ds = x.t === 'B' ? dg : x.t === 'R' ? og : dg.concat(og);

          for (const [a, d] of ds) {
            let i = 1;
            while (tr(r + a * i, c + d * i)) {
              if (x.t === 'K') break;
              i++;
            }
          }
        }
      }
    }
    return m;
  }

  makeMove(board, m) {
    const [r, c, a, d] = m;
    const x = board[r][c];
    const cap = board[a][d];

    const isPromo = x.t === 'P' && (
      this.mapId === 'default-lane'
        ? (x.p === 0 ? a === 0 : a === 7)
        : (x.p === 0 ? a <= 6 : x.p === 1 ? d >= 7 : x.p === 2 ? a >= 7 : d <= 6)
    );

    board[a][d] = isPromo ? { p: x.p, t: 'Q' } : x;
    board[r][c] = null;
    return cap;
  }

  simulate(board, m, fn) {
    const x = board[m[0]][m[1]];
    const y = board[m[2]][m[3]];
    this.makeMove(board, m);
    const result = fn();
    board[m[0]][m[1]] = x;
    board[m[2]][m[3]] = y;
    return result;
  }

  getFoes(player) {
    const total = this.mapId === 'default-lane' ? 2 : 4;
    return Array.from({ length: total }, (_, i) => i).filter(i => this.alive[i] && this.team[i] !== this.team[player]);
  }

  getAttacks(board, foes) {
    const s = new Set();
    const N = this.boardSize;

    for (const e of foes) {
      for (const m of this.genMoves(board, e)) {
        const x = board[m[0]][m[1]];
        if (x.t === 'P' && (m[1] === m[3] || m[0] === m[2])) continue;
        s.add(m[2] * N + m[3]);
      }
    }
    return s;
  }

  getKingPos(board, player) {
    const N = this.boardSize;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = board[r][c];
        if (x && x.p === player && x.t === 'K') return [r, c];
      }
    }
    return null;
  }

  isInCheck(board, player) {
    const k = this.getKingPos(board, player);
    if (!k) return false;
    const foes = this.getFoes(player);
    return this.getAttacks(board, foes).has(k[0] * this.boardSize + k[1]);
  }

  getLegalMoves(board = this.board, player = this.cur) {
    return this.genMoves(board, player).filter(m =>
      this.simulate(board, m, () => !this.isInCheck(board, player))
    );
  }

  eliminatePlayer(player) {
    this.alive[player] = false;
    for (const row of this.board) {
      row.forEach((cell, i) => {
        if (cell && cell.p === player) row[i] = null;
      });
    }
  }

  checkWin() {
    const active = (this.mapId === 'default-lane' ? [0, 1] : [0, 1, 2, 3]).filter(i => this.alive[i]);
    const activeTeams = new Set(active.map(i => this.team[i]));

    if (activeTeams.size === 0) {
      this.over = 'Seri';
    } else if (activeTeams.size === 1) {
      const winningTeam = [...activeTeams][0];
      const winners = (this.mapId === 'default-lane' ? [0, 1] : [0, 1, 2, 3]).filter(i => this.team[i] === winningTeam);
      this.over = 'Pemenang: ' + winners.map(i => this.players[i].name).join(' & ');
    }
  }

  getBestBotMove(player, level = 'med') {
    const legalMoves = this.getLegalMoves(this.board, player);
    if (!legalMoves.length) return null;
    const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

    if (level === 'easy') {
      const captures = legalMoves.filter(m => this.board[m[2]][m[3]]);
      return Math.random() < 0.4 && captures.length ? rnd(captures) : rnd(legalMoves);
    }

    // Material greedy score
    const scores = legalMoves.map(m => {
      const target = this.board[m[2]][m[3]];
      let score = target ? PIECE_VALUES[target.t] * 3 : 0;
      return score;
    });

    let best = -1e9;
    let pick = legalMoves[0];
    legalMoves.forEach((m, i) => {
      const s = scores[i] + Math.random() * 0.5;
      if (s > best) {
        best = s;
        pick = m;
      }
    });
    return pick;
  }

  executeMove(move) {
    if (this.over) return { success: false };

    const player = this.cur;
    const piece = this.board[move[0]][move[1]];
    if (!piece || piece.p !== player) return { success: false };

    const captured = this.makeMove(this.board, move);
    this.last = move;

    if (captured && captured.t === 'K') {
      this.eliminatePlayer(captured.p);
    }

    const totalPlayers = this.mapId === 'default-lane' ? 2 : 4;
    let loops = 0;

    while (true) {
      this.checkWin();
      if (this.over) break;

      this.cur = (this.cur + 1) % totalPlayers;
      if (!this.alive[this.cur]) continue;

      const nextMoves = this.getLegalMoves(this.board, this.cur);
      if (nextMoves.length) break;

      if (this.isInCheck(this.board, this.cur)) {
        this.eliminatePlayer(this.cur);
      } else {
        this.eliminatePlayer(this.cur);
      }

      loops++;
      if (loops > 10) {
        this.over = 'Seri';
        break;
      }
    }

    const record = {
      p: player,
      t: piece.t,
      m: move,
      fromNotation: toAlgebraic(move[0], move[1], this.boardSize),
      toNotation: toAlgebraic(move[2], move[3], this.boardSize),
      cap: captured ? captured.t : null
    };

    this.hist.push(record);

    return {
      success: true,
      record,
      cur: this.cur,
      over: this.over
    };
  }

  getState() {
    const totalPlayers = this.mapId === 'default-lane' ? 2 : 4;
    const checks = Array.from({ length: 4 }, (_, i) => i < totalPlayers && this.alive[i] && this.isInCheck(this.board, i));
    const inCheckNames = Array.from({ length: totalPlayers }, (_, i) => i).filter(i => checks[i]).map(i => this.players[i].name);

    return {
      mode: this.mode,
      mapId: this.mapId,
      boardSize: this.boardSize,
      isCross: this.mapId === 'plus-lane',
      cur: this.cur,
      players: this.players,
      curPlayer: this.players[this.cur],
      slots: this.slots,
      alive: this.alive,
      team: this.team,
      over: this.over,
      msg: this.msg,
      last: this.last,
      checks,
      inCheckNames,
      historyCount: this.hist.length,
      history: this.hist,
      board: this.board
    };
  }
}
