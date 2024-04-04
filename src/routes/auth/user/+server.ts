import { CONNECTOR_CLIENT } from "$lib/enmeshed";
import { decoupleEnmeshed } from "$lib/keycloak";
import { type RequestEvent } from "@sveltejs/kit";
import config from "config";

export async function DELETE({ url, locals }: RequestEvent) {
	const addr = url.search.slice(1);
	console.log(addr);

	const attributes = await CONNECTOR_CLIENT.attributes.getAttributes({
		content: {
			key: "userName"
		},
		shareInfo: {
			peer: addr
		},
	})
	// for (const attr of attributes.result) {
	// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 	const req = await CONNECTOR_CLIENT.outgoingRequests.getRequest((attr.shareInfo as any).requestReference);
	// 	console.log(JSON.stringify(req.result, null, 2));
	// }
	if (attributes.isError || attributes.result.length === 0) {
		return new Response(null, { status: 400 });
	}
	const nonSucceededAttributes = attributes.result.filter((el) => !el.succeededBy)

	const userNameAttr = nonSucceededAttributes[0];

	const succeed_res = await CONNECTOR_CLIENT.attributes.succeedAttribute(userNameAttr.id, {
		successorContent: {
			value: {
				"@type": "ProprietaryString",
				title: `${config.get("connector.name")}.userName`,
				value: ''
			}
		}
	})
	if (succeed_res.isError) {
		return new Response(null, { status: 500 });
	}

	await decoupleEnmeshed(locals.User!.preferred_username, addr);

	return new Response(null, { status: 204 });
}

