import axios from "axios";
import config from "config";
const keycloakBaseUrl = config.get("keycloak.baseUrl");
const keycloakRealm = config.get("keycloak.realm");
const keycloakClient = config.get("keycloak.client") as string;

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
		const validation_response = await axios.get(`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/userinfo`,
			{ headers: { Authorization: `bearer ${token}` } });
		return validation_response.data;
	} catch (e) {
		return undefined;
	}
}

export async function invalidate_tokens(token: string, refresh_token: string) {
	// revoke access_token
	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", keycloakClient);
	urlencoded.append("token", token);
	urlencoded.append("token_type_hint", "access_token");
	await axios.post(
		`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/revoke`,
		urlencoded
	);
	// revoke refresh_token
	urlencoded.set("token", refresh_token);
	urlencoded.set("token_type_hint", "refresh_token");
	await axios.post(
		`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/revoke`,
		urlencoded
	);
}

export async function refresh_token(refresh_token: string): Promise<Tokens | undefined> {
	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", keycloakClient);
	urlencoded.append("grant_type", "refresh_token");
	urlencoded.append("refresh_token", refresh_token);
	urlencoded.append("scope", "openid");
	try {
		const response = await axios.post(
			`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
			urlencoded
		);
		const tokens: Tokens = { access_token: response.data.access_token, refresh_token: response.data.refresh_token }
		return tokens;
	} catch (e) {
		return undefined;
	}
}
