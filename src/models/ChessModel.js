// MVC Architecture - MODEL
// Model: Pure business logic supporting 14x14 Plus, 8x8 Standard, and Double-Last-Line Defence (5P)
import { getMapById, getAllMaps } from '../maps/index.js';

export const BOARD_SIZE = 14;

export const BOARD_SKINS = {
  'merah-putih': {
    name: 'Merah Putih',
    color1: '#e11d48',
    color2: '#ffffff',
    light: '#fff1f2',
    dark: '#e11d48',
    sel: '#fde047',
    last: '#fecdd3',
    check: '#fb7185'
  },
  'hitam-putih': {
    name: 'Hitam Putih',
    color1: '#1e293b',
    color2: '#ffffff',
    light: '#f8fafc',
    dark: '#1e293b',
    sel: '#facc15',
    last: '#64748b',
    check: '#ef4444'
  },
  'biru-putih': {
    name: 'Biru Putih',
    color1: '#0284c7',
    color2: '#ffffff',
    light: '#f0f9ff',
    dark: '#0284c7',
    sel: '#38bdf8',
    last: '#bae6fd',
    check: '#ef4444'
  },
  'hijau-putih': {
    name: 'Hijau Putih',
    color1: '#15803d',
    color2: '#ffffff',
    light: '#f0fdf4',
    dark: '#15803d',
    sel: '#86efac',
    last: '#bbf7d0',
    check: '#ef4444'
  },
  'klasik-kayu': {
    name: 'Klasik Kayu',
    color1: '#b45309',
    color2: '#fef3c7',
    light: '#fef3c7',
    dark: '#b45309',
    sel: '#fde047',
    last: '#fed7aa',
    check: '#ef4444'
  },
  'ungu-neon': {
    name: 'Ungu Neon',
    color1: '#7e22ce',
    color2: '#faf5ff',
    light: '#faf5ff',
    dark: '#7e22ce',
    sel: '#c084fc',
    last: '#e9d5ff',
    check: '#ef4444'
  }
};

export const COLOR_PRESETS = [
  { id: 'red', name: 'Merah', color: '#f43f5e', bgPastel: '#ffe4e6', borderPastel: '#fda4af', textPastel: '#9f1239' },
  { id: 'blue', name: 'Biru', color: '#0ea5e9', bgPastel: '#e0f2fe', borderPastel: '#7dd3fc', textPastel: '#0369a1' },
  { id: 'yellow', name: 'Kuning', color: '#eab308', bgPastel: '#fef9c3', borderPastel: '#fde047', textPastel: '#854d0e' },
  { id: 'green', name: 'Hijau', color: '#10b981', bgPastel: '#dcfce7', borderPastel: '#86efac', textPastel: '#166534' },
  { id: 'dark', name: 'Hitam', color: '#334155', bgPastel: '#e2e8f0', borderPastel: '#94a3b8', textPastel: '#0f172a' },
  { id: 'purple', name: 'Ungu', color: '#a855f7', bgPastel: '#f3e8ff', borderPastel: '#d8b4fe', textPastel: '#6b21a8' },
  { id: 'orange', name: 'Oranye', color: '#f97316', bgPastel: '#ffedd5', borderPastel: '#fdba74', textPastel: '#9a3412' },
  { id: 'cyan', name: 'Sian', color: '#06b6d4', bgPastel: '#cffafe', borderPastel: '#67e8f9', textPastel: '#155e75' }
];

export const PLAYERS = [
  {
    id: 0,
    name: 'Merah',
    color: '#f43f5e',
    bgPastel: '#ffe4e6',
    borderPastel: '#fda4af',
    textPastel: '#9f1239',
    zone: 'Selatan'
  },
  {
    id: 1,
    name: 'Biru',
    color: '#0ea5e9',
    bgPastel: '#e0f2fe',
    borderPastel: '#7dd3fc',
    textPastel: '#0369a1',
    zone: 'Barat'
  },
  {
    id: 2,
    name: 'Kuning',
    color: '#eab308',
    bgPastel: '#fef9c3',
    borderPastel: '#fde047',
    textPastel: '#854d0e',
    zone: 'Utara'
  },
  {
    id: 3,
    name: 'Hijau',
    color: '#10b981',
    bgPastel: '#dcfce7',
    borderPastel: '#86efac',
    textPastel: '#166534',
    zone: 'Timur'
  },
  {
    id: 4,
    name: 'Hitam (P5)',
    color: '#334155',
    bgPastel: '#e2e8f0',
    borderPastel: '#94a3b8',
    textPastel: '#0f172a',
    zone: 'Benteng Pusat'
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
  [0, -1], // Green: Left
  [-1, 0]  // P5: Up/Flexible
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
  if (boardSize !== 14) return true;
  return !((r < 3 || r > 10) && (c < 3 || c > 10));
}

export function toAlgebraic(r, c, boardSize = 14) {
  return String.fromCharCode(97 + c) + (boardSize - r);
}

export class ChessModel {
  constructor(options = {}) {
    this.mode = options.mode || 'team';
    this.lone = options.lone !== undefined ? options.lone : 0;
    this.slots = options.slots ? [...options.slots] : ['human', 'easy', 'easy', 'easy', 'hard'];
    this.mapId = options.mapId || 'plus-lane';
    this.mapData = getMapById(this.mapId);
    this.boardSize = this.mapData.boardSize || 14;
    this.players = options.players ? options.players.map(p => ({ ...p })) : PLAYERS.map(p => ({ ...p }));
    this.reset();
  }

  reset() {
    this.mapData = getMapById(this.mapId);
    this.boardSize = this.mapData.boardSize || 14;
    const N = this.boardSize;
    this.board = Array.from({ length: N }, () => Array(N).fill(null));

    const totalP = this.mapData.playersCount || 4;
    this.alive = Array.from({ length: 5 }, (_, i) => i < totalP);

    if (this.mapId === 'default-lane') {
      this.team = [0, 1, 1, 1, 1];
    } else if (this.mapId === 'double-last-line-defence') {
      if (this.mode === 'ffa') {
        this.team = [0, 1, 2, 3, 4];
      } else {
        // 4 vs 1: Koalisi 4 pemain (indeks 0-3) vs Player 5 (indeks 4)
        this.team = [0, 0, 0, 0, 1];
      }
    } else {
      if (this.mode === 'team') {
        this.team = [0, 1, 0, 1, 2];
      } else if (this.mode === 'ffa') {
        this.team = [0, 1, 2, 3, 4];
      } else {
        this.team = [0, 1, 2, 3, 4].map(i => (i === this.lone ? 0 : 1));
      }
    }

    // Panggil inisialisasi bidak dari modul map
    if (this.mapData.initPieces) {
      this.mapData.initPieces(this.board, null, BACK_RANK_ORDER);
    } else if (this.mapData.customPieces) {
      // Custom map dari map editor
      for (const item of this.mapData.customPieces) {
        if (this.isValid(item.r, item.c)) {
          this.board[item.r][item.c] = { p: item.p, t: item.t };
        }
      }
    }

    this.cur = 0;
    this.p5TurnCount = 0;
    this.over = null;
    this.last = null;
    this.hist = [];
    this.msg = '';
  }

  cloneBoard(board = this.board) {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  }

  isValid(r, c) {
    if (r < 0 || c < 0 || r >= this.boardSize || c >= this.boardSize) return false;
    if (this.mapData?.tiles) {
      const tile = this.mapData.tiles[r]?.[c];
      if (tile === 'void' || tile === 'omitted' || tile === 'wall' || tile === 'obstacle') {
        return false;
      }
      if (tile === 'normal') {
        return true;
      }
    }
    return isValidCell(r, c, this.boardSize);
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
          // Pawn moves
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
          } else if (p === 4) {
            // Player 5 (Fortress pawn): can attack in 4 diagonal directions or advance outwards
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
              const a = r + dr, d = c + dc;
              if (this.isValid(a, d) && !board[a][d]) add(a, d);
            }
            for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
              const a = r + dr, d = c + dc;
              if (this.isValid(a, d)) {
                const y = board[a][d];
                if (y && this.team[y.p] !== this.team[p]) add(a, d);
              }
            }
          } else {
            // Standard 4P Pawns
            const f = DIRECTIONS_4P[p];
            const a = r + f[0], d = c + f[1];

            if (this.isValid(a, d) && !board[a][d]) {
              add(a, d);
              const a2 = a + f[0], d2 = d + f[1];
              const isStart = (p === 0 && r === 12) || (p === 1 && c === 1) || (p === 2 && r === 1) || (p === 3 && c === 12);
              if (isStart && this.isValid(a2, d2) && !board[a2][d2]) {
                add(a2, d2);
              }
            }

            const diagonals = f[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
            for (const s of diagonals) {
              const a3 = a + s[0], d3 = d + s[1];
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

          const isDebuffed = (this.mapId === 'plus-lane' || this.mapId === 'double-last-line-defence') &&
            (x.t === 'R' || x.t === 'B' || x.t === 'Q');
          const maxDist = x.t === 'K' ? 1 : (isDebuffed ? 8 : 99);

          for (const [a, d] of ds) {
            let i = 1;
            while (i <= maxDist && tr(r + a * i, c + d * i)) {
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
    const total = this.mapData.playersCount || 4;
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

  getKingPositions(board, player) {
    const N = this.boardSize;
    const kings = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = board[r][c];
        if (x && x.p === player && x.t === 'K') kings.push([r, c]);
      }
    }
    return kings;
  }

  isInCheck(board, player) {
    const kings = this.getKingPositions(board, player);
    if (!kings.length) return false;
    const foes = this.getFoes(player);
    const attacks = this.getAttacks(board, foes);
    // Skak jika setidaknya salah satu raja diancam
    return kings.some(k => attacks.has(k[0] * this.boardSize + k[1]));
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
    const total = this.mapData.playersCount || 4;
    const active = Array.from({ length: total }, (_, i) => i).filter(i => this.alive[i]);
    const activeTeams = new Set(active.map(i => this.team[i]));

    if (activeTeams.size === 0) {
      this.over = 'Seri';
    } else if (activeTeams.size === 1) {
      const winningTeam = [...activeTeams][0];
      const winners = Array.from({ length: total }, (_, i) => i).filter(i => this.team[i] === winningTeam);
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

    const scores = legalMoves.map(m => {
      const target = this.board[m[2]][m[3]];
      return target ? PIECE_VALUES[target.t] * 3 : 0;
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

    // ATURAN KHUSUS RAJA:
    // Jika bidak raja dimakan:
    if (captured && captured.t === 'K') {
      const remainingKings = this.getKingPositions(this.board, captured.p);
      // Pemain 5 (atau yang punya dual king) kalah HANYA jika SEMUA rajanya sudah dimakan!
      if (remainingKings.length === 0) {
        this.eliminatePlayer(captured.p);
      }
    }

    this.checkWin();

    // BUFF: Player 5 di Double-Last-Line Defence bisa 2 turn langsung
    const isP5DoubleTurn = this.mapId === 'double-last-line-defence' && player === 4 && !this.over && this.alive[4];

    if (isP5DoubleTurn && this.p5TurnCount === 0) {
      const nextMovesP5 = this.getLegalMoves(this.board, 4);
      if (nextMovesP5.length > 0) {
        this.p5TurnCount = 1;
        this.msg = 'Player 5: Aksi ke-2 (Buff 2x Turn)!';
      } else {
        this.p5TurnCount = 0;
        this.msg = '';
        this.advanceTurn();
      }
    } else {
      this.p5TurnCount = 0;
      this.msg = '';
      this.advanceTurn();
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

  advanceTurn() {
    const totalPlayers = this.mapData.playersCount || 4;
    let loops = 0;

    while (true) {
      this.checkWin();
      if (this.over) break;

      this.cur = (this.cur + 1) % totalPlayers;
      if (!this.alive[this.cur]) continue;

      const nextMoves = this.getLegalMoves(this.board, this.cur);
      if (nextMoves.length) break;

      // Jika tidak ada langkah legal, cek sisa raja
      const kings = this.getKingPositions(this.board, this.cur);
      if (kings.length <= 1) {
        this.eliminatePlayer(this.cur);
      }

      loops++;
      if (loops > 12) {
        this.over = 'Seri';
        break;
      }
    }
  }

  getState() {
    const totalPlayers = this.mapData.playersCount || 4;
    const checks = Array.from({ length: 5 }, (_, i) => i < totalPlayers && !!this.alive[i] && this.isInCheck(this.board, i));
    const inCheckNames = Array.from({ length: totalPlayers }, (_, i) => i)
      .filter(i => checks[i])
      .map(i => this.players?.[i]?.name || PLAYERS[i]?.name || `Pemain ${i + 1}`);

    return {
      mode: this.mode,
      mapId: this.mapId,
      boardSize: this.boardSize,
      cur: this.cur,
      p5TurnCount: this.p5TurnCount,
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
