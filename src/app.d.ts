// See https://kit.svelte.dev/docs/types#app
import type { UserData } from "$lib/auth";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			User: UserData | undefined
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
