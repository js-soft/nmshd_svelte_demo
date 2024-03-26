// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Socket } from "socket.io";

class SocketManager {
	_sessionToSocket = new Map();
	_socketIdToSession = new Map();

	/**
	 * returns active socket corresponding to session
	 * @param {string} session
	 * @returns {Socket | undefined}
	*/
	getSocket(session) {
		return this._sessionToSocket.get(session);
	}

	/**
	 * initialize socket connection
	 * @param {string} session
	 * @param {Socket} socket 
	*/
	connect(session, socket) {
		this._sessionToSocket.set(session, socket);
		this._socketIdToSession.set(socket.id, session);
	}

	/**
	 * removes no longer needed connections
	 * @param {Socket} socket 
	*/
	disconnect(socket) {
		const ssId = this._socketIdToSession.get(socket.id);
		if (!ssId) {
			return
		}
		const activeSocket = this._sessionToSocket.get(ssId);
		if (activeSocket === socket) {
			this._sessionToSocket.delete(ssId);
		}
	}
}

export const SOCKET_MANAGER = new SocketManager();
