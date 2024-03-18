import { refresh_token, validata_token as validate_token, type Tokens, type UserData } from '$lib/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import LZString from "lz-string";

export const handle: Handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get('mein-keks');
	let user: UserData | undefined = undefined;
	if (cookie) {
		const raw_tokens = JSON.parse(LZString.decompressFromBase64(cookie));
		const tokens: Tokens = { access_token: raw_tokens.access_token, refresh_token: raw_tokens.refresh_token };
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

	if (event.url.pathname.startsWith("/auth")) {
		if (!user) {
			const redirectTo = event.url.pathname + event.url.search;
			redirect(302, `/login?redirectTo=${redirectTo}`);
		}
	}
	const response = await resolve(event);
	return response;
} 
