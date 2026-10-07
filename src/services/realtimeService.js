import { createClient } from '@supabase/supabase-js';

class RealtimeService {
  constructor() {
    this.client = null;
    this.channel = null;
    this.lobbyChannel = null;
    this.room = null;
    this.clientId = 'u_' + Math.random().toString(36).substring(2, 9);
    this.userName = localStorage.getItem('ultra_catur_online_name') || ('Pemain ' + Math.floor(100 + Math.random() * 900));
    this.mySlotIndex = null;
    this.connected = false;
    this.peers = [];
    this.activeRooms = [];
    this.eventListeners = {
      sync: [],
      gameStarted: [],
      moveMade: [],
      gameRestarted: [],
      statusChange: [],
      lobbyRooms: []
    };
  }

  on(event, cb) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(cb);
    }
  }

  off(event, cb) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(fn => fn !== cb);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(fn => {
        try {
          fn(data);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  getClient(url = null, anonKey = null) {
    if (this.client) return this.client;

    const supabaseUrl =
      url ||
      import.meta.env.VITE_SUPABASE_URL ||
      localStorage.getItem('ultra_catur_sb_url') ||
      'https://wdrwegzabkhzxfpwvqmz.supabase.co';

    const supabaseKey =
      anonKey ||
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      localStorage.getItem('ultra_catur_sb_key');

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    try {
      const cleanedUrl = supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
      this.client = createClient(cleanedUrl, supabaseKey.trim());
      return this.client;
    } catch (e) {
      console.error('[Supabase init client error]', e);
      return null;
    }
  }

  subscribeLobby(url = null, anonKey = null) {
    const client = this.getClient(url, anonKey);
    if (!client) return;
    if (this.lobbyChannel) return;

    this.lobbyChannel = client.channel('ultra-chess-global-lobby', {
      config: {
        presence: { key: this.clientId }
      }
    });

    const updateLobbyRooms = () => {
      if (!this.lobbyChannel) return;
      const state = this.lobbyChannel.presenceState();
      const roomMap = new Map();

      for (const [key, presences] of Object.entries(state)) {
        if (!presences || !presences.length) continue;
        const p = presences[presences.length - 1];
        if (!p.roomId) continue;

        if (!roomMap.has(p.roomId)) {
          roomMap.set(p.roomId, {
            id: p.roomId,
            name: p.roomName || p.roomId,
            players: [],
            inGame: !!p.inGame
          });
        }
        const rm = roomMap.get(p.roomId);
        rm.players.push({
          id: key,
          name: p.userName || 'Pemain',
          slot: p.slotIndex
        });
        if (p.inGame) rm.inGame = true;
      }

      this.activeRooms = Array.from(roomMap.values());
      this.emit('lobbyRooms', this.activeRooms);
    };

    this.lobbyChannel
      .on('presence', { event: 'sync' }, updateLobbyRooms)
      .on('presence', { event: 'join' }, updateLobbyRooms)
      .on('presence', { event: 'leave' }, updateLobbyRooms);

    this.lobbyChannel.subscribe();
  }

  async trackInLobby(inGame = false) {
    if (this.lobbyChannel && this.room) {
      await this.lobbyChannel.track({
        roomId: this.room,
        roomName: this.room,
        userName: this.userName,
        slotIndex: this.mySlotIndex,
        inGame
      });
    }
  }

  async untrackFromLobby() {
    if (this.lobbyChannel) {
      await this.lobbyChannel.untrack();
    }
  }

  connect({ room, userName, url = null, anonKey = null }) {
    if (this.channel) {
      this.disconnect();
    }

    this.room = room;
    if (userName) {
      this.userName = userName;
      localStorage.setItem('ultra_catur_online_name', userName);
    }

    const client = this.getClient(url, anonKey);
    if (!client) {
      this.emit('statusChange', {
        connected: false,
        error: 'Supabase URL atau Anon Key belum terpasang.'
      });
      return;
    }

    try {
      const channelName = `ultra-chess-room-${this.room}`;
      this.channel = client.channel(channelName, {
        config: {
          presence: { key: this.clientId },
          broadcast: { self: false }
        }
      });

      // Presence Sync dalam Room
      this.channel
        .on('presence', { event: 'sync' }, () => this.syncPeersFromState())
        .on('presence', { event: 'join' }, () => this.syncPeersFromState())
        .on('presence', { event: 'leave' }, () => this.syncPeersFromState());

      // Broadcast Game Events
      this.channel
        .on('broadcast', { event: 'game-started' }, ({ payload }) => {
          this.trackInLobby(true);
          this.emit('gameStarted', payload);
        })
        .on('broadcast', { event: 'move-made' }, ({ payload }) => {
          this.emit('moveMade', payload);
        })
        .on('broadcast', { event: 'game-restarted' }, () => {
          this.emit('gameRestarted');
        });

      // Subscribe room
      this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.connected = true;
          this.emit('statusChange', { connected: true, room: this.room });
          await this.channel.track({
            id: this.clientId,
            name: this.userName,
            slotIndex: this.mySlotIndex
          });
          await this.trackInLobby(false);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.connected = false;
          this.emit('statusChange', { connected: false, room: this.room });
        }
      });
    } catch (err) {
      console.error('[Supabase Realtime Error]:', err);
      this.emit('statusChange', { connected: false, error: err.message });
    }
  }

  syncPeersFromState() {
    if (!this.channel) return;
    const state = this.channel.presenceState();
    const list = [];

    for (const [key, presences] of Object.entries(state)) {
      if (presences && presences.length > 0) {
        const item = presences[presences.length - 1];
        list.push({
          id: key,
          name: item.name || 'Pemain',
          slotIndex: item.slotIndex !== undefined ? item.slotIndex : null
        });
      }
    }

    this.peers = list;
    this.emit('sync', { peers: this.peers });
  }

  async claimSlot(slotIndex) {
    this.mySlotIndex = slotIndex;
    if (this.channel && this.connected) {
      await this.channel.track({
        id: this.clientId,
        name: this.userName,
        slotIndex: this.mySlotIndex
      });
      await this.trackInLobby(false);
    }
  }

  startGame(config) {
    if (this.channel && this.connected) {
      this.trackInLobby(true);
      this.channel.send({
        type: 'broadcast',
        event: 'game-started',
        payload: config
      });
    }
  }

  sendMove(move, playerIndex) {
    if (this.channel && this.connected) {
      this.channel.send({
        type: 'broadcast',
        event: 'move-made',
        payload: { move, playerIndex }
      });
    }
  }

  restartGame() {
    if (this.channel && this.connected) {
      this.channel.send({
        type: 'broadcast',
        event: 'game-restarted'
      });
    }
  }

  disconnect() {
    this.untrackFromLobby();
    if (this.channel && this.client) {
      this.client.removeChannel(this.channel);
      this.channel = null;
    }
    this.connected = false;
    this.room = null;
    this.mySlotIndex = null;
    this.peers = [];
    this.emit('statusChange', { connected: false });
  }
}

export const realtimeService = new RealtimeService();
