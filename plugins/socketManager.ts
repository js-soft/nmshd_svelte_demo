// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Socket } from "socket.io";

class SocketManager {
	_sessionToSocket = new Map();
	_socketIdToSession = new Map();

	getSocket(session: string): Socket | undefined {
		return this._sessionToSocket.get(session);
	}

	connect(session: string, socket: Socket) {
		this._sessionToSocket.set(session, socket);
		this._socketIdToSession.set(socket.id, session);
	}

	disconnect(socket: Socket) {
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

