import type { Move, MultiplayerAdapter } from './types';

export class MemoryMultiplayerAdapter implements MultiplayerAdapter {
  private listeners = new Map<string, Set<(move: Move) => void>>();

  async createRoom(playerId: string): Promise<string> {
    const roomId = `${playerId}-${Date.now()}`;
    this.listeners.set(roomId, new Set());
    return roomId;
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.listeners.has(roomId)) this.listeners.set(roomId, new Set());
  }

  async sendMove(roomId: string, move: Move): Promise<void> {
    this.listeners.get(roomId)?.forEach((listener) => listener(move));
  }

  subscribe(roomId: string, onMove: (move: Move) => void): () => void {
    const listeners = this.listeners.get(roomId) ?? new Set();
    listeners.add(onMove);
    this.listeners.set(roomId, listeners);
    return () => listeners.delete(onMove);
  }
}
