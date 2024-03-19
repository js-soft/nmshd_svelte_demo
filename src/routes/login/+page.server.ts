import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

import LZString from "lz-string";
import { login } from '$lib/keycloak';

export const actions = {
	default: async ({ url, cookies, request }) => {
		const data = await request.formData();

		try {
			const username = data.get('username')! as string;
			const password = data.get('password')! as string;

			const tokens = await login(username, password);

			const compress = LZString.compressToBase64(JSON.stringify(tokens));
			cookies.set("mein-keks", compress, { path: "/" });
		} catch (e) {
			error(401);
		}
		let location = url.searchParams.get("redirectTo");
		location = location ? location : "/auth";

		redirect(302, `/${location.slice(1)}`);
	}
} satisfies Actions;
