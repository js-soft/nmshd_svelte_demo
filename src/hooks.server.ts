import type { KeycloakUserWithRoles } from '$lib/KeycloakUser';
import { refresh_token, validata_token as validate_token, type Tokens } from '$lib/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import LZString from "lz-string";

export const handle: Handle = async ({ event, resolve }) => {
	const sId = event.cookies.get('identifier');
	if (!sId) {
		event.cookies.set('identifier', crypto.randomUUID(), { path: "/" });
	}
	const cookie = event.cookies.get('mein-keks');
	let user: KeycloakUserWithRoles | undefined = undefined;
	if (cookie) {
		const tokens: Tokens = JSON.parse(LZString.decompressFromBase64(cookie));
		user = await validate_token(tokens.access_token);
		if (!user) {
			const new_tokens = await refresh_token(tokens.refresh_token);
			if (new_tokens) {
				event.cookies.set("mein-keks", LZString.compressToBase64(JSON.stringify(new_tokens)), { path: "/" });
				user = await validate_token(new_tokens.access_token)!;
			}
		}
	}
	event.locals.User = user;
	if (event.url.pathname.startsWith("/login") && user) {
		redirect(302, `/`);
	}

	if (event.url.pathname.startsWith("/auth")) {
		if (!user) {
			const redirectTo = event.url.pathname + event.url.search;
			redirect(302, `/login?redirectTo=${redirectTo}`);
		}
		const scenario = event.url.pathname.split('/').at(3);
		if (scenario) {
			if (!user.realm_access.roles.includes(scenario)) {
				// TODO: maybe throw error
				redirect(302, `/`);
			}
		}
	}
	const response = await resolve(event);
	return response;
} 
