import { error, redirect } from '@sveltejs/kit';
import axios from 'axios';
import type { Actions } from './$types';

import LZString from "lz-string";
import type { Tokens } from '$lib/auth';

export const actions = {
	default: async ({ url, cookies, request }) => {
		const data = await request.formData();
		const urlencoded = new URLSearchParams();
		urlencoded.append("client_id", "users");
		urlencoded.append("username", data.get('username')! as string);
		urlencoded.append("password", data.get('password')! as string);
		urlencoded.append("grant_type", "password");
		urlencoded.append("scope", "openid");
		try {
			const response = await axios.post(
				`http://localhost:8080/realms/master/protocol/openid-connect/token`,
				urlencoded
			);

			const tokens: Tokens = { access_token: response.data.access_token, refresh_token: response.data.refresh_token }

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
