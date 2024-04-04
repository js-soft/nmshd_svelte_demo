import axios from "axios";
import config from "config";
import { type Tokens } from "./auth";
import type { KeycloakUser } from "./KeycloakUser";

const keycloakBaseUrl = config.get("keycloak.baseUrl");
const keycloakRealm = config.get("keycloak.realm");

export async function getAdminToken(realm = keycloakRealm): Promise<string> {
	const keycloakAdminConfig = config.get<{ username: string; password: string }>("keycloak.admin");
	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", "admin-cli");
	urlencoded.append("username", keycloakAdminConfig.username);
	urlencoded.append("password", keycloakAdminConfig.password);
	urlencoded.append("grant_type", "password");

	const response = await axios.post(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`, urlencoded);
	const json = await response.data;
	return json.access_token;
}

export async function login(userName: string, password: string): Promise<Tokens> {
	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", config.get("keycloak.client"));
	urlencoded.append("username", userName);
	urlencoded.append("password", password);
	urlencoded.append("grant_type", "password");
	urlencoded.append("scope", "openid");

	const response = await axios.post(
		`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
		urlencoded
	);

	return { access_token: response.data.access_token, refresh_token: response.data.refresh_token };
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	user.roles = roleMappingResponse.data.map((el: any) => el.name);
	return user;
}

export async function decoupleEnmeshed(userName: string, nmshdAddr: string) {
	const adminToken = await getAdminToken();
	let updated = false;

	let data = await getUser(userName);

	while (!updated) {
		data!.attributes.enmeshed_address = data!.attributes.enmeshed_address.filter((addr) => addr !== nmshdAddr);

		await axios.put(
			`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${data!.id}`,
			{
				firstName: data?.firstName,
				lastName: data?.lastName,
				email: data?.email,
				attributes: data?.attributes,
			},
			{
				headers: {
					authorization: `bearer ${adminToken}`,
					"content-type": "application/json" // eslint-disable-line @typescript-eslint/naming-convention
				}
			}
		);

		data = await getUser(userName);
		updated = !data?.attributes.enmeshed_address.includes(nmshdAddr);
	}
}
