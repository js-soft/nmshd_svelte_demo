import http from 'http';
import express from 'express';
import injectSocketIO from '../socketIoHandler.js';
import { handler } from '../build/handler.js';
import { setupKeycloak } from './setupKeycloak.js';

const app = express();
const server = http.createServer(app);

// Inject SocketIO
injectSocketIO(server);

// injectEnmeshedWebhooks(server);

// SvelteKit handlers
app.use(handler);

app.on("/webhook", () => {
	// get socket matching to session id
});

await setupKeycloak();

server.listen(5173, () => {
	console.log('Running on http://localhost:5173');
});

