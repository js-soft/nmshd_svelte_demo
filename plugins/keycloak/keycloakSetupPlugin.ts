import { setupKeycloak } from "./setupKeycloak";

export default async function keycloakSetup() {
	await setupKeycloak();

	return {
		name: 'keycloakSetup',
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async configureKeycloak() {
		}
	};
}
