import axios from "axios";

export interface UserData {
	preferred_username: string,
	given_name: string,
	family_name: string,
	email_verified: boolean,
	email?: string
}

export interface Tokens {
	access_token: string,
	refresh_token: string
}

export async function validata_token(token: string): Promise<UserData | undefined> {
	try {
		const validation_response = await axios.get("http://localhost:8080/realms/master/protocol/openid-connect/userinfo",
			{ headers: { Authorization: `bearer ${token}` } });
		return validation_response.data;
	} catch (e) {
		return undefined;
	}

}

export async function refresh_token(refresh_token: string): Promise<Tokens | undefined> {
	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", "users");
	urlencoded.append("grant_type", "refresh_token");
	urlencoded.append("refresh_token", refresh_token);
	urlencoded.append("scope", "openid");
	try {
		const response = await axios.post(
			`http://localhost:8080/realms/master/protocol/openid-connect/token`,
			urlencoded
		);
		const tokens: Tokens = { access_token: response.data.access_token, refresh_token: response.data.refresh_token }
		return tokens;
	} catch (e) {
		return undefined;
	}
}
