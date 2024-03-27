import { validate_token, type Tokens } from '$lib/auth';
import { error, redirect } from "@sveltejs/kit";
import LZString from "lz-string";
import type { RequestEvent } from '../$types';

export async function POST({ url, request, cookies }: RequestEvent) {
	const data = await request.text();

	try {
		const tokens: Tokens = JSON.parse(LZString.decompressFromBase64(data));
		console.log(tokens);
		const user = await validate_token(tokens.access_token);
		console.log(JSON.stringify(user, null, 2));
		if (!user) {
			error(401);
		}
		const compress = LZString.compressToBase64(JSON.stringify(tokens));
		cookies.set("mein-keks", compress, { path: "/" });
	} catch (e) {
		console.log(e);
		error(401);
	}
	let location = url.searchParams.get("redirectTo");
	location = location ? location : "/auth";

	redirect(302, `/${location.slice(1)}`);
} 
