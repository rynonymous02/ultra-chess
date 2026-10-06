// 4-Player Chess Engine (Catur 4 Pemain)
// Modular Engine for Vue 3 UI and Model Context Protocol (MCP) Server

export const BOARD_SIZE = 14;

export const PLAYERS = [
  { id: 0, name: 'Merah', color: '#ef4444', textLight: '#fecaca', bgSoft: 'rgba(239,68,68,0.15)' },
  { id: 1, name: 'Biru', color: '#3b82f6', textLight: '#bfdbfe', bgSoft: 'rgba(59,130,246,0.15)' },
  { id: 2, name: 'Kuning', color: '#eab308', textLight: '#fef08a', bgSoft: 'rgba(234,179,8,0.15)' },
  { id: 3, name: 'Hijau', color: '#22c55e', textLight: '#bbf7d0', bgSoft: 'rgba(34,197,94,0.15)' }
];

export const PIECE_SYMBOLS = {
  K: '♚',
  Q: '♛',
  R: '♜',
  B: '♝',
  N: '♞',
  P: '♟'
};

export const PIECE_NAMES = {
  K: 'Raja (King)',
  Q: 'Ratu (Queen)',
  R: 'Benteng (Rook)',
  B: 'Gajah (Bishop)',
  N: 'Kuda (Knight)',
  P: 'Pion (Pawn)'
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

export const DIRECTIONS = [
  [-1, 0], // Red moves Up
  [0, 1],  // Blue moves Right
  [1, 0],  // Yellow moves Down
  [0, -1]  // Green moves Left
];

export const DIFFICULTY_LABELS = {
  human: 'Human',
  easy: 'Bot Easy',
  med: 'Bot Medium',
  hard: 'Bot Hard'
};

export const RATING_BADGES = {
  genius: { label: 'Genius', color: '#8b5cf6', desc: 'Langkah terbaik yang sangat unggul' },
  good: { label: 'Bagus', color: '#10b981', desc: 'Langkah solid dan akurat' },
  blunder: { label: 'Blunder', color: '#ef4444', desc: 'Langkah merugikan besar' }
};

/**
 * Check if a cell coordinate (r, c) is within the playable cross-shaped 14x14 board.
 * The four 3x3 corners are omitted.
 */
export function isValidCell(r, c) {
  return r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE &&
    !((r < 3 || r > 10) && (c < 3 || c > 10));
}

/**
 * Returns player's relative rank from 0 to 13.
 */
export function getRankOf(player, r, c) {
  return [13 - r, c, r, 13 - c][player];
}

/**
 * Computes coordinate for player's initial piece setup:
 * i: index 0..7 along row/column
 * k: rank offset (0 = back rank, 1 = pawn rank)
 */
export function getInitialPos(player, i, k) {
  return [
    [13 - k, 3 + i],
    [3 + i, k],
    [k, 10 - i],
    [10 - i, 13 - k]
  ][player];
}

/**
 * Converts row and column to algebraic notation (e.g. 13,3 => d1).
 */
export function toAlgebraic(r, c) {
  return String.fromCharCode(97 + c) + (BOARD_SIZE - r);
}

/**
 * Parses algebraic notation (e.g. "d1") to [row, col].
 */
export function fromAlgebraic(notation) {
  if (!notation || notation.length < 2) return null;
  const colChar = notation[0].toLowerCase();
  const c = colChar.charCodeAt(0) - 97;
  const r = BOARD_SIZE - parseInt(notation.slice(1), 10);
  if (isValidCell(r, c)) return [r, c];
  return null;
}

export class FourPlayerChess {
  constructor(options = {}) {
    this.mode = options.mode || 'team'; // 'team' | 'ffa' | 'solo'
    this.lone = options.lone !== undefined ? options.lone : 0;
    this.slots = options.slots ? [...options.slots] : ['human', 'easy', 'easy', 'easy'];
    this.initGame();
  }

  initGame() {
    // Setup team assignments
    if (this.mode === 'team') {
      this.team = [0, 1, 0, 1]; // Team A: Red & Yellow, Team B: Blue & Green
    } else if (this.mode === 'ffa') {
      this.team = [0, 1, 2, 3];
    } else {
      // Solo: lone player is Team 0, others are Team 1
      this.team = [0, 1, 2, 3].map(i => (i === this.lone ? 0 : 1));
    }

    // Initialize 14x14 board
    this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    // Place initial pieces
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 8; i++) {
        // Back rank
        const [r0, c0] = getInitialPos(p, i, 0);
        this.board[r0][c0] = { p, t: BACK_RANK_ORDER[i] };
        // Pawns
        const [r1, c1] = getInitialPos(p, i, 1);
        this.board[r1][c1] = { p, t: 'P' };
      }
    }

    this.alive = [true, true, true, true];
    this.cur = 0;
    this.over = null;
    this.last = null;
    this.sel = null;
    this.moves = [];
    this.hist = [];
    this.msg = '';
  }

  /**
   * Clone board state deeply
   */
  cloneBoard(board = this.board) {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  }

  /**
   * Generates pseudo-legal moves for a player on a given board
   */
  genMoves(board, p) {
    const m = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const x = board[r][c];
        if (!x || x.p !== p) continue;

        const add = (a, d) => m.push([r, c, a, d]);
        const tr = (a, d) => {
          if (!isValidCell(a, d)) return 0;
          const y = board[a][d];
          if (!y) {
            add(a, d);
            return 1;
          }
          if (this.team[y.p] !== this.team[p]) add(a, d);
          return 0;
        };

        if (x.t === 'P') {
          const f = DIRECTIONS[p];
          const rk = getRankOf(p, r, c);
          const a = r + f[0];
          const d = c + f[1];

          // Forward 1 step
          if (isValidCell(a, d) && !board[a][d]) {
            add(a, d);
            // Forward 2 steps from starting pawn rank
            const a2 = a + f[0];
            const d2 = d + f[1];
            if (rk === 1 && isValidCell(a2, d2) && !board[a2][d2]) {
              add(a2, d2);
            }
          }

          // Diagonal captures
          const diagonals = f[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
          for (const s of diagonals) {
            const a3 = a + s[0];
            const d3 = d + s[1];
            if (isValidCell(a3, d3)) {
              const y = board[a3][d3];
              if (y && this.team[y.p] !== this.team[p]) add(a3, d3);
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
          // B, R, Q, K
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

  /**
   * Executes a move on a board, returns captured piece if any
   */
  makeMove(board, m) {
    const [r, c, a, d] = m;
    const x = board[r][c];
    const cap = board[a][d];

    // Promotion: Pawn reaching rank >= 7 promotes to Queen
    board[a][d] = x.t === 'P' && getRankOf(x.p, a, d) >= 7 ? { p: x.p, t: 'Q' } : x;
    board[r][c] = null;
    return cap;
  }

  /**
   * Simulates a move and evaluates callback function, then rolls back
   */
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
    return [0, 1, 2, 3].filter(i => this.alive[i] && this.team[i] !== this.team[player]);
  }

  getAttacks(board, foes) {
    const s = new Set();
    for (const e of foes) {
      for (const m of this.genMoves(board, e)) {
        const x = board[m[0]][m[1]];
        if (x.t === 'P' && (m[1] === m[3] || m[0] === m[2])) continue; // Pawns only attack diagonally
        s.add(m[2] * BOARD_SIZE + m[3]);
      }
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const x = board[r][c];
          if (x && x.p === e && x.t === 'P') {
            const f = DIRECTIONS[e];
            const diagonals = f[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
            for (const q of diagonals) {
              const a = r + f[0] + q[0];
              const d = c + f[1] + q[1];
              if (isValidCell(a, d)) s.add(a * BOARD_SIZE + d);
            }
          }
        }
      }
    }
    return s;
  }

  getKingPos(board, player) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
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
    return this.getAttacks(board, foes).has(k[0] * BOARD_SIZE + k[1]);
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
    const activeTeams = new Set(
      [0, 1, 2, 3].filter(i => this.alive[i]).map(i => this.team[i])
    );

    if (activeTeams.size === 0) {
      this.over = 'Seri (Draw)';
    } else if (activeTeams.size === 1) {
      const winningTeam = [...activeTeams][0];
      const winners = [0, 1, 2, 3].filter(i => this.team[i] === winningTeam);
      if (this.mode === 'ffa') {
        this.over = 'Pemenang: ' + PLAYERS[winners[0]].name;
      } else {
        this.over = 'Pemenang: ' + winners.map(i => PLAYERS[i].name).join(' & ');
      }
    }
  }

  evaluateZone(board, player, attackSet) {
    const k = this.getKingPos(board, player);
    if (!k) return [0, 0];
    let attackers = 0;
    let defenders = 0;

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const r = k[0] + i;
        const c = k[1] + j;
        if (!isValidCell(r, c) || (!i && !j)) continue;
        if (Math.abs(i) < 2 && Math.abs(j) < 2 && attackSet.has(r * BOARD_SIZE + c)) {
          attackers++;
        }
        const x = board[r][c];
        if (x && x.p === player) defenders++;
      }
    }
    return [attackers, defenders];
  }

  scoreMoves(player, moves, hard = false) {
    const w = hard ? 2.5 : 1.4;
    const foes = this.getFoes(player);
    const chk = this.isInCheck(this.board, player);
    const at0 = this.getAttacks(this.board, foes);
    const [a0, d0] = this.evaluateZone(this.board, player, at0);
    const k0 = this.getKingPos(this.board, player);

    return moves.map(m => {
      const x = this.board[m[0]][m[1]];
      const y = this.board[m[2]][m[3]];
      const [hang, a, d] = this.simulate(this.board, m, () => {
        const at = this.getAttacks(this.board, foes);
        const z = this.evaluateZone(this.board, player, at);
        return [at.has(m[2] * BOARD_SIZE + m[3]), z[0], z[1]];
      });

      let score = (y ? (y.t === 'K' ? 500 : PIECE_VALUES[y.t]) : 0) * (hard ? 1.2 : 3);
      score -= (a - a0) * w + a * w * 0.6;
      score += (d - d0) * w * 0.8;
      if (hang) score -= PIECE_VALUES[x.t] * (hard ? 0.9 : 0.5);
      if (hard && at0.has(m[0] * BOARD_SIZE + m[1]) && !hang) {
        score += PIECE_VALUES[x.t] * 0.5;
      }
      if (x.t === 'K' && !chk) score -= w;
      if (y && k0 && Math.max(Math.abs(m[2] - k0[0]), Math.abs(m[3] - k0[1])) <= 3) {
        score += 2 * w;
      }
      if (x.t === 'P' && k0 && Math.max(Math.abs(m[0] - k0[0]), Math.abs(m[1] - k0[1])) > 3) {
        score += 0.25;
      }
      return score;
    });
  }

  rateMove(player, move) {
    const legalMoves = this.getLegalMoves(this.board, player);
    if (legalMoves.length < 2) return null;
    const idx = legalMoves.findIndex(
      q => q[0] === move[0] && q[1] === move[1] && q[2] === move[2] && q[3] === move[3]
    );
    if (idx < 0) return null;

    const scores = this.scoreMoves(player, legalMoves, true);
    const sorted = [...scores].sort((a, b) => b - a);
    const diff = sorted[0] - scores[idx];

    if (diff < 0.01 && sorted[0] - sorted[1] >= 4) return 'genius';
    if (diff <= 1) return 'good';
    if (diff >= 3) return 'blunder';
    return null;
  }

  getBestBotMove(player, level = 'med') {
    const legalMoves = this.getLegalMoves(this.board, player);
    if (!legalMoves.length) return null;
    const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

    if (level === 'easy') {
      const captures = legalMoves.filter(m => this.board[m[2]][m[3]]);
      return Math.random() < 0.4 && captures.length ? rnd(captures) : rnd(legalMoves);
    }

    const scores = this.scoreMoves(player, legalMoves, level === 'hard');
    let best = -1e9;
    let pick = null;
    legalMoves.forEach((m, i) => {
      const s = scores[i] + Math.random() * 0.4;
      if (s > best) {
        best = s;
        pick = m;
      }
    });
    return pick;
  }

  /**
   * Execute move in the game and advance turns
   */
  playMove(move) {
    if (this.over) return { success: false, reason: 'Game over' };

    const player = this.cur;
    const piece = this.board[move[0]][move[1]];
    if (!piece || piece.p !== player) {
      return { success: false, reason: 'Bukan bidak pemain aktif' };
    }

    let rating = this.rateMove(player, move);
    const captured = this.makeMove(this.board, move);
    this.last = move;
    this.sel = null;
    this.moves = [];
    this.msg = '';

    if (captured && captured.t === 'K') {
      this.eliminatePlayer(captured.p);
      this.msg = `${PLAYERS[captured.p].name} kehilangan raja!`;
      rating = 'genius';
    }

    // Advance turn to next alive player with legal moves
    let loops = 0;
    while (true) {
      this.checkWin();
      if (this.over) break;

      this.cur = (this.cur + 1) % 4;
      if (!this.alive[this.cur]) continue;

      const nextMoves = this.getLegalMoves(this.board, this.cur);
      if (nextMoves.length) break;

      // Player has no moves: Checkmate or Stale
      if (this.isInCheck(this.board, this.cur)) {
        this.msg = `${PLAYERS[this.cur].name} skakmat!`;
        rating = 'genius';
        this.eliminatePlayer(this.cur);
      } else {
        // Stalemate elimination
        this.msg = `${PLAYERS[this.cur].name} kehabisan langkah legal!`;
        this.eliminatePlayer(this.cur);
      }

      loops++;
      if (loops > 12) {
        this.over = 'Seri: tidak ada langkah tersisa';
        break;
      }
    }

    const record = {
      p: player,
      t: piece.t,
      m: move,
      fromNotation: toAlgebraic(move[0], move[1]),
      toNotation: toAlgebraic(move[2], move[3]),
      cap: captured ? captured.t : null,
      capPlayer: captured ? captured.p : null,
      promo: piece.t === 'P' && getRankOf(player, move[2], move[3]) >= 7,
      rating
    };

    this.hist.push(record);

    return {
      success: true,
      record,
      cur: this.cur,
      over: this.over,
      msg: this.msg
    };
  }

  /**
   * Export complete snapshot for UI or MCP
   */
  getState() {
    const checks = [0, 1, 2, 3].map(i => this.alive[i] && this.isInCheck(this.board, i));
    const inCheckNames = [0, 1, 2, 3].filter(i => checks[i]).map(i => PLAYERS[i].name);

    return {
      mode: this.mode,
      cur: this.cur,
      curPlayer: PLAYERS[this.cur],
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

  /**
   * Generates ASCII representation of current board for MCP and logging
   */
  toAscii() {
    let out = '    ' + Array.from({ length: 14 }, (_, i) => String.fromCharCode(97 + i)).join(' ') + '\n';
    out += '   +' + '-'.repeat(28) + '+\n';
    for (let r = 0; r < BOARD_SIZE; r++) {
      const rowNum = (BOARD_SIZE - r).toString().padStart(2, ' ');
      out += `${rowNum} |`;
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!isValidCell(r, c)) {
          out += '  ';
        } else {
          const piece = this.board[r][c];
          if (!piece) {
            out += ' .';
          } else {
            const code = ['R', 'B', 'Y', 'G'][piece.p] + piece.t;
            out += code;
          }
        }
      }
      out += ' |\n';
    }
    out += '   +' + '-'.repeat(28) + '+\n';
    return out;
  }
}
