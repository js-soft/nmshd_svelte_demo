// socketIoHandler.js
import { Server } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function injectSocketIO(server: any) {
	const io = new Server(server);

	io.on('connection', (socket) => {
		console.log(socket.request.headers.cookie);
		socket.emit('test', 'test');
	});

	console.log('SocketIO injected');
}

