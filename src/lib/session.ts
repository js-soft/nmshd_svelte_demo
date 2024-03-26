import type { IncomingMessage } from "http";

export function extractSessionId(sessionName: string, req: IncomingMessage): string | undefined {
	const cookieString = req.headers.cookie;
	if (!cookieString) return undefined;
	const pairs = cookieString.split(";");
	const splittedPairs = pairs.map((cookie) => cookie.split("="));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const cookieObj = splittedPairs.reduce(function(obj: any, cookie) {
		obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim());
		return obj;
	}, {});

	return cookieObj[sessionName];
} 
