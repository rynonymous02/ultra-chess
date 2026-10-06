// MVC Architecture - CONTROLLER
// Controller: Coordinates Model actions, user inputs, bot decisions, and sound effects

import { ChessModel, PLAYERS } from '../models/ChessModel.js';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playWinSound
} from '../utils/sound.js';

export class GameController {
  constructor(options = {}) {
    this.model = new ChessModel(options);
    this.listeners = new Set();
    this.selectedCell = null;
    this.legalMoves = [];
    this.isBotThinking = false;
    this.botTimer = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getControllerState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  getControllerState() {
    const modelState = this.model.getState();
    return {
      ...modelState,
      selectedCell: this.selectedCell,
      legalMoves: this.legalMoves,
      isBotThinking: this.isBotThinking,
      isHumanTurn: !modelState.over && modelState.slots[modelState.cur] === 'human'
    };
  }

  startNewGame(config = {}) {
    clearTimeout(this.botTimer);
    this.isBotThinking = false;
    this.selectedCell = null;
    this.legalMoves = [];

    this.model = new ChessModel({
      mode: config.mode || 'team',
      lone: config.lone !== undefined ? config.lone : 0,
      slots: config.slots || ['human', 'easy', 'easy', 'easy'],
      mapId: config.mapId || 'plus-lane',
      players: config.players
    });

    this.notify();
    this.checkAndTriggerBot();
  }

  restart() {
    clearTimeout(this.botTimer);
    this.isBotThinking = false;
    this.selectedCell = null;
    this.legalMoves = [];
    this.model.reset();
    this.notify();
    this.checkAndTriggerBot();
  }

  selectCell(r, c) {
    const state = this.model.getState();
    if (state.over) return;
    if (state.slots[state.cur] !== 'human') return;

    const piece = state.board[r]?.[c];
    if (piece && piece.p === state.cur) {
      this.selectedCell = [r, c];
      const allMoves = this.model.getLegalMoves(this.model.board, state.cur);
      this.legalMoves = allMoves.filter(m => m[0] === r && m[1] === c);
    } else {
      this.selectedCell = null;
      this.legalMoves = [];
    }
    this.notify();
  }

  executeMove(move) {
    const stateBefore = this.model.getState();
    if (stateBefore.over) return false;

    const targetPiece = stateBefore.board[move[2]]?.[move[3]];
    const res = this.model.executeMove(move);

    if (res.success) {
      this.selectedCell = null;
      this.legalMoves = [];

      // Sound triggers
      if (targetPiece) {
        playCaptureSound();
      } else {
        playMoveSound();
      }

      const stateAfter = this.model.getState();
      if (stateAfter.checks.some(c => c)) {
        playCheckSound();
      }

      if (stateAfter.over) {
        playWinSound();
      }

      this.notify();

      if (!stateAfter.over) {
        this.checkAndTriggerBot();
      }
      return true;
    }
    return false;
  }

  checkAndTriggerBot() {
    clearTimeout(this.botTimer);
    const state = this.model.getState();
    if (state.over) {
      this.isBotThinking = false;
      this.notify();
      return;
    }

    const currentSlot = state.slots[state.cur];
    if (currentSlot !== 'human') {
      this.isBotThinking = true;
      this.notify();

      const delay = currentSlot === 'easy' ? 400 : currentSlot === 'med' ? 550 : 700;
      this.botTimer = setTimeout(() => {
        const curState = this.model.getState();
        if (curState.over) {
          this.isBotThinking = false;
          this.notify();
          return;
        }

        const botMove = this.model.getBestBotMove(curState.cur, currentSlot);
        this.isBotThinking = false;

        if (botMove) {
          this.executeMove(botMove);
        } else {
          this.notify();
        }
      }, delay);
    } else {
      this.isBotThinking = false;
      this.notify();
    }
  }

  triggerManualBot() {
    const state = this.model.getState();
    if (state.over) return;
    const currentSlot = state.slots[state.cur];
    const level = currentSlot === 'human' ? 'med' : currentSlot;
    const botMove = this.model.getBestBotMove(state.cur, level);
    if (botMove) {
      this.executeMove(botMove);
    }
  }

  destroy() {
    clearTimeout(this.botTimer);
    this.listeners.clear();
  }
}
