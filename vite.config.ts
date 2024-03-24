import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './plugins/socketio/webSocketPluginVite.js';
import keycloakSetup from './plugins/keycloak/keycloakSetupPlugin'

export default defineConfig({
	plugins: [sveltekit(), webSocketServer, await keycloakSetup(), purgeCss()]
});
