import { getUser } from '$lib/keycloak';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const data = await getUser(event.locals.User!.preferred_username);
	return {
		user: data
	};
};

