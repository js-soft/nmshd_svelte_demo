import { redirect, type Actions } from "@sveltejs/kit";
import axios from "axios";
import LZString from "lz-string";

export const actions: Actions = {
	logout: async ({ cookies }) => {
		const cookie = cookies.get('mein-keks');
		if (!cookie) {
			redirect(302, "/");
		}
		const tokens = JSON.parse(LZString.decompressFromBase64(cookie));
		// revoke access_token 
		const urlencoded = new URLSearchParams();
		urlencoded.append("client_id", "users");
		urlencoded.append("token", tokens.access_token);
		urlencoded.append("token_type_hint", "access_token");
		await axios.post(
			`http://localhost:8080/realms/master/protocol/openid-connect/revoke`,
			urlencoded
		);
		// revoke refresh_token
		urlencoded.set("token", tokens.refresh_token);
		urlencoded.set("token_type_hint", "refresh_token");
		await axios.post(
			`http://localhost:8080/realms/master/protocol/openid-connect/revoke`,
			urlencoded
		);

		cookies.delete('mein-keks', { path: "/" });
		redirect(302, "/");
	}
}

