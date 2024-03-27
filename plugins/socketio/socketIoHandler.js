import { Server } from 'socket.io';
import { SOCKET_MANAGER } from '../socketManager.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import http from "http";

/**
 * inject the socket handler into the express app
 * @param {http.Server} server
 */
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

/**
 * inject the socket handler into the express app
 * @param {string} sessionName
 * @param {http.IncomingMessage} req
 */
function extractSessionId(sessionName, req) {
	const cookieString = req.headers.cookie;
	if (!cookieString) return undefined;
	const pairs = cookieString.split(";");
	const splittedPairs = pairs.map((cookie) => cookie.split("="));

	const cookieObj = splittedPairs.reduce(function(obj, cookie) {
		// @ts-expect-error index with string
		obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim());
		return obj;
	}, {});

	// @ts-expect-error index with string
	return cookieObj[sessionName];
} 
