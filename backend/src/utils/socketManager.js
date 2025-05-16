class SocketManager {
  constructor() {
    this.connections = new Map(); // userId -> socket
    this.userIdsBySocket = new Map(); // socketId -> userId
  }

  addConnection(userId, socket) {
    this.connections.set(userId, socket);
    this.userIdsBySocket.set(socket.id, userId);
  }

  removeConnection(socketId) {
    const userId = this.userIdsBySocket.get(socketId);
    if (userId) {
      this.connections.delete(userId);
      this.userIdsBySocket.delete(socketId);
      return userId;
    }
    return null;
  }

  getSocket(userId) {
    return this.connections.get(userId);
  }

  isUserOnline(userId) {
    return this.connections.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connections.keys());
  }
}

module.exports = new SocketManager(); // Singleton instance