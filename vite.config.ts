import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import keycloakSetup from './plugins/keycloak/keycloakSetupPlugin'

export default defineConfig({
	plugins: [sveltekit(), await keycloakSetup(), purgeCss()]
});
