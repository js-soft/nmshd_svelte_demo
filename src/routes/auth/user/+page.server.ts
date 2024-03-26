import type { PageServerLoad } from './$types';

import { createOnboardingQRCode } from '$lib/onboardingQr';

export const ssr = false;

export const load: PageServerLoad = async (event) => {
	const sId = event.cookies.get('identifier');
	const buffer = await createOnboardingQRCode(sId!, event.locals.User!.preferred_username);
	return {
		buffer: arrayBufferToStringArray(buffer)
	};
};

function arrayBufferToStringArray(buffer: ArrayBuffer): string[] {
	const uInt8A = new Uint8Array(buffer);
	let i = uInt8A.length;
	const biStr = [];
	while (i--) {
		biStr[i] = String.fromCharCode(uInt8A[i]);
	}
	return biStr;
}
