export interface KeycloakUser {
	id: string;
	username: string;
	email_verified: boolean;
	email: string;
	firstName: string;
	lastName: string;
	attributes?: Attributes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Attributes extends Record<string, any> {
	enmeshed_address: string[]
}

