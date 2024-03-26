import axios from "axios";
import config from "config";

const keycloakBaseUrl = config.get("keycloak.baseUrl");
const keycloakRealm = config.get("keycloak.realm");

/**
	* get admin token
	* @param {string} realm
	* @returns {Promise<string>}
	*/
export async function getAdminToken(realm = keycloakRealm) {
	const keycloakAdminConfig = config.get("keycloak.admin");

	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", "admin-cli");
	urlencoded.append("username", keycloakAdminConfig.username);
	urlencoded.append("password", keycloakAdminConfig.password);
	urlencoded.append("grant_type", "password");

	const response = await axios.post(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`, urlencoded);
	const json = await response.data;
	return json.access_token;
}

/**
	* get user data
	* @param {string} userName
	* @returns {KeycloakUserWithRoles}
	*/
export async function getUser(userName) {
	const adminToken = await getAdminToken();
	console.log(userName);
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

/**
	* get user roles
	* @param {string} userId 
	*/
export async function getUserRoles(userId) {
	const adminToken = await getAdminToken();
	const response = await axios.get(
		`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${userId}/role-mappings/realm`,
		{
			headers: { authorization: `Bearer ${adminToken}` }
		}
	);
	return response.data;
}

/**
 * update user data 
 * @param {{
		userName: string;
		vorName?: string;
		name?: string;
		email? : string;
		attributes?: Record<string, string>;
	}} params
 */
export async function updateUser(params) {
	const adminToken = await getAdminToken();
	const user = await getUser(params.userName);

	const response = await axios.put(
		`${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${user.id}`,
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

/**
	* token exchange
	* @param {string} userId
	* @returns {Tokens}
	*/
export async function impersonate(userId) {
	const adminToken = await getAdminToken();

	const urlencoded = new URLSearchParams();
	urlencoded.append("client_id", "admin-cli");
	urlencoded.append("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
	urlencoded.append("subject_token", adminToken);
	urlencoded.append("requested_token_type", "urn:ietf:params:oauth:token-type:refresh_token");
	urlencoded.append("audience", config.get("keycloak.client"));
	urlencoded.append("requested_subject", userId);

	const response = await axios.post(
		`${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
		urlencoded,
		{
			headers: { authorization: `Bearer ${adminToken}` }
		}
	);

	return response.data;
}
