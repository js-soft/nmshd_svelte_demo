import axios from "axios";
import config from "config";
import { type KeycloakUser } from "../../src/lib/KeycloakUser";
import { type Tokens } from "../../src/lib/auth";

const keycloakBaseUrl: string = config.get("keycloak.baseUrl");
const keycloakRealm: string = config.get("keycloak.realm");

export async function getAdminToken(realm = keycloakRealm): Promise<string> {
	const keycloakAdminConfig = config.get<{ username: string; password: string }>("keycloak.admin");

	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", "users");
	urlencoded.append("username", keycloakAdminConfig.username);
	urlencoded.append("password", keycloakAdminConfig.password);
	urlencoded.append("grant_type", "password");
	urlencoded.append("scope", "openid");

	const response = await axios.post(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`, urlencoded);
	const json = await response.data;
	return json.access_token;
}

export async function getUser(userName: string): Promise<KeycloakUser | undefined> {
	const adminToken = await getAdminToken();
	const response = await axios.get(
		`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users?exact=true&username=${userName}`,
		{
			headers: { authorization: `Bearer ${adminToken}` }
		}
	);
	const user = response.data[0];
	if (!user) return;
	const roleMappingResponse = await axios.get(
		`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${user.id}/role-mappings/realm`,
		{
			headers: { authorization: `Bearer ${adminToken}` }
		}
	);

	user.roles = roleMappingResponse.data.map((el) => el.name);
	return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserRoles(userId: string): Promise<any> {
	const adminToken = await getAdminToken();
	const response = await axios.get(
		`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${userId}/role-mappings/realm`,
		{
			headers: { authorization: `Bearer ${adminToken}` }
		}
	);
	return response.data;
}

export async function updateUser(params: {
	userName: string;
	vorName?: string;
	name?: string;
	email?: string;
	attributes?: Record<string, string>;
}) {
	console.log(JSON.stringify(params, null, 2));
	const adminToken = await getAdminToken();
	const user = await getUser(params.userName);

	if (!user) {
		console.log(`User ${params.userName} not found`);
	}

	const response = await axios.put(
		`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${user!.id}`,
		{
			username: params.userName,
			firstName: params.vorName,
			lastName: params.name,
			email: params.email,
			attributes: params.attributes,
		},
		{
			headers: {
				authorization: `bearer ${adminToken}`,
				"content-type": "application/json" // eslint-disable-line @typescript-eslint/naming-convention
			}
		}
	);

	return response.status;
}

export async function impersonate(userId: string): Promise<Tokens> {
	const adminToken = await getAdminToken();

	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", "users");
	urlencoded.append("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
	urlencoded.append("subject_token", adminToken);
	urlencoded.append("requested_token_type", "urn:ietf:params:oauth:token-type:refresh_token");
	urlencoded.append("audience", config.get("keycloak.client"));
	urlencoded.append("requested_subject", userId);
	urlencoded.append("scope", "openid");

	const response = await axios.post(
		`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
		urlencoded,
		{
			headers: { authorization: `Bearer ${adminToken}` }
		}
	);

	return { access_token: response.data.access_token, refresh_token: response.data.refresh_token };
}
