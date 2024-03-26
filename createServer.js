import http from 'http';
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { injectWebhookHandlers } from "./plugins/webhook/webhookHandlers.js"
import { injectSocketIO } from './plugins/socketio/socketIoHandler.js';

async function createServer() {
	const app = express()
	const server = http.createServer(app);

	app.use(express.json());
	injectWebhookHandlers(app);
	injectSocketIO(server);

	// Create Vite server in middleware mode
	const vite = await createViteServer({
		server: {
			middlewareMode: true
		},
		appType: 'custom', // don't include Vite's default HTML handling middlewares
	})
	// Use vite's connect instance as middleware
	app.use(vite.middlewares);


	server.listen(5173, () => console.log('Example app is listening on port 5173.'));
}

createServer()
