// See https://kit.svelte.dev/docs/types#app

import type { KeycloakUserWithRoles } from "$lib/KeycloakUser";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			User: KeycloakUserWithRoles | undefined
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
