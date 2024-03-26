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
	console.log(JSON.stringify(params, null, 2));
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

export function getUserData(
	request,
	username
) {
	const retValue = {
		userName: username,
		attributes: {},
		firstName: undefined,
		lastName: undefined,
		email: undefined
	};

	const normalKeycloakAttributes = ["Surname", "GivenName", "EMailAddress"];

	const entries = request.items.slice(1);

	const attr = {};

	for (const entry of entries) {
		for (const item of entry.items) {
			if (
				item["@type"] === "ReadAttributeAcceptResponseItem" ||
				item["@type"] === "ProposeAttributeAcceptResponseItem"
			) {
				const el = (item).attribute;
				if (el?.value) {
					if (!attr.enmeshedAddress) {
						Object.assign(attr, { enmeshedAddress: el.owner });
					}
					if (normalKeycloakAttributes.includes(el.value["@type"])) {
						switch (el.value["@type"]) {
							case "Surname":
								retValue.lastName = el.value.value;
								break;
							case "GivenName":
								retValue.firstName = el.value.value;
								break;
							case "EMailAddress":
								retValue.email = el.value.value;
								break;
							default:
								throw new Error("This is not possible");
						}
					} else {
						Object.assign(attr, { [el.value["@type"]]: el.value.value });
					}
				}
			}
		}
	}

	Object.assign(retValue.attributes, attr);

	console.log(retValue);

	return retValue;
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
