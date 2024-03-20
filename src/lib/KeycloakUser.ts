// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface KeycloakUser {
	id: string;
	preferred_username: string;
	email_verified: boolean;
	email: string;
	given_name: string;
	family_name: string;
}

export interface KeycloakUserWithRoles extends KeycloakUser {
	realm_access: {
		roles: string[];
	};
}


