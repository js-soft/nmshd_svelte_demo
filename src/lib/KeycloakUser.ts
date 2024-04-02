// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface KeycloakUser {
	id: string;
	username: string;
	email_verified: boolean;
	email: string;
	firstName: string;
	lastName: string;
	attributes: Record<string, unknown>;
}

