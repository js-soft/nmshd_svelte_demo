// socketIoHandler.js
import { Server } from 'socket.io';
import { SOCKET_MANAGER } from '../webhook/socketManager.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function injectSocketIO(server) {
	const io = new Server(server);

	io.on('connection', (socket) => {
		const sId = extractSessionId("identifier", socket.request);
		if (sId) {
			console.log("Connected to session: " + sId);
			SOCKET_MANAGER.connect(sId, socket);
		}
		socket.emit('test', 'test');
		socket.on("disconnect", () => {
			SOCKET_MANAGER.disconnect(socket);
		})
	});

	console.log('SocketIO injected');
}

function extractSessionId(sessionName, req) {
	const cookieString = req.headers.cookie;
	if (!cookieString) return undefined;
	const pairs = cookieString.split(";");
	const splittedPairs = pairs.map((cookie) => cookie.split("="));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const cookieObj = splittedPairs.reduce(function(obj, cookie) {
		obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim());
		return obj;
	}, {});

	return cookieObj[sessionName];
} 
