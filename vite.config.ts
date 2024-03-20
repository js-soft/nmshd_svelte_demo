import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite.js';
import keycloakSetup from './keycloakSetupPlugin'

export default defineConfig({
	plugins: [sveltekit(), webSocketServer, await keycloakSetup(), purgeCss()]
});
