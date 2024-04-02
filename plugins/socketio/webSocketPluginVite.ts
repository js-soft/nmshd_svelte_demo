// webSocketPluginVite.js 
import { injectSocketIO } from './socketIoHandler.js';

export const webSocketServer = {
	name: 'webSocketServer',
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	configureServer(server: any) {
		injectSocketIO(server.httpServer);
	}
};

