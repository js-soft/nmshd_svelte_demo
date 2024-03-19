import { invalidate_tokens, type Tokens } from "$lib/auth";
import { redirect, type Actions } from "@sveltejs/kit";
import LZString from "lz-string";

export const actions: Actions = {
	logout: async ({ cookies }) => {
		const cookie = cookies.get('mein-keks');
		if (!cookie) {
			redirect(302, "/");
		}
		const tokens: Tokens = JSON.parse(LZString.decompressFromBase64(cookie));
		await invalidate_tokens(tokens.access_token, tokens.refresh_token);

		cookies.delete('mein-keks', { path: "/" });
		redirect(302, "/");
	}
}

