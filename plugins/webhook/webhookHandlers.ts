// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";
import config from "config";
import LZString from "lz-string";
import { ConnectorClient, ConnectorRequest, ConnectorRequestContentItemGroup, ConnectorRequestResponseContent, CreateAttributeRequestItem } from "@nmshd/connector-sdk";
import { SOCKET_MANAGER } from "../socketManager";
import { storeEnmeshedAddress, impersonate } from "./keycloakHelper";
import { getUser } from "../../src/lib/keycloak";
import { Session } from "inspector";

const CONNECTOR_CLIENT = ConnectorClient.create({
	baseUrl: config.get("connector.url"),
	apiKey: config.get("connector.apiKey")
});

export async function injectWebhookHandlers(app: express.Express) {
	app.post("/webhooks/relationship", handleEnmeshedRelationshipWebhook);
}

async function handleEnmeshedRelationshipWebhook(req: express.Request, res: express.Response) {
	if (req.headers["x-api-key"] !== config.get("connector.apiKey")) {
		return res.sendStatus(401);
	}
	res.sendStatus(200);
	const body: { trigger: string; data: ConnectorRequest } | undefined = req.body;

	if (!body) return;

	const request = body.data;

	const respnseSourceType = request.response!.source!.type;

	if (respnseSourceType === "Message") {
		const reqType: string = request.content.metadata!["type"]
		switch (reqType) {
			case "Login":
				await handleEnmeshedLogin(request);
				break;
			case "Onboarding":
				await handleOnboardingMessage(request);
				break;
			default:
				console.error("received unknown message type");
		}
		return;
	}

	await handleEnmeshedRelationshipWebhookWithRelationshipResponseSourceType(request);
}

async function handleEnmeshedLogin(request: ConnectorRequest) {
	if (!(request.response?.content.result === "Accepted")) {
		return;
	}

	if (!request.content.metadata || !request.content.metadata["webSessionId"]) {
		return
	}

	const sessionID = request.content.metadata["webSessionId"];
	const socket = SOCKET_MANAGER.getSocket(sessionID);
	// The session in question allready disconnected so we abort
	if (!socket) {
		return;
	}

	const peer = request.peer;

	const attributes = await CONNECTOR_CLIENT.attributes.getAttributes({
		content: { key: "userName" },
		shareInfo: { peer: peer }
	});

	if (attributes.isError) {
		console.error("User not found!");
		return;
	}

	const nonSucceededAttributes = attributes.result.filter((el) => !el.succeededBy)
	const nmshdUserAttr = nonSucceededAttributes[0];
	const nmshdUser = nmshdUserAttr.content.value.value as string;

	const user = await getUser(nmshdUser);
	if (!user) {
		socket.emit("login_error", "it seems that you are not onboarded to any account");
		console.error(`It `);
		return;
	}
	const addrs = user?.attributes["enmeshed_address"] as string[];
	if (!addrs.includes(peer)) {
		socket.emit("login_error",
			"it seems that the user you reference no longer has a reference to your account in keycloak updating your attributes now");
		await CONNECTOR_CLIENT.attributes.succeedAttribute(nmshdUserAttr.id, {
			successorContent: {
				value: {
					"@type": "ProprietaryString",
					title: `${config.get("connector.name")}.userName`,
					value: ''
				}
			}
		})
		await CONNECTOR_CLIENT.attributes.notifyPeerAboutRepositoryAttributeSuccession(nmshdUserAttr.id, { peer: nmshdUserAttr.shareInfo!.peer });
		return;
	}
	const tokens = await impersonate(user!.id);
	const compress = LZString.compressToBase64(JSON.stringify(tokens));
	socket.emit("login", compress);
}

async function handleEnmeshedRelationshipWebhookWithRelationshipResponseSourceType(request: ConnectorRequest) {
	const changeId = request.response!.source!.reference;

	const templateId = request.source!.reference;

	// @ts-expect-error broken api
	const relationship = (await CONNECTOR_CLIENT.relationships.getRelationships({ template: { id: templateId } }))
		.result[0];

	const template = (await CONNECTOR_CLIENT.relationshipTemplates.getRelationshipTemplate(templateId)).result;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const metadata: any = (
		template.content as {
			"@type": "RelationshipTemplateContent";
			title?: string;
			metadata?: object;
			onNewRelationship: ConnectorRequest;
			onExistingRelationship?: ConnectorRequest;
		}
	).metadata!;

	if (metadata.type !== "Onboarding") {
		const sId = metadata.webSessionId;
		const socket = SOCKET_MANAGER.getSocket(sId);
		if (!socket) {
			console.error(`Socket for SessionID: ${sId} not found`);
			return await CONNECTOR_CLIENT.relationships.rejectRelationshipChange(relationship.id, changeId);
		}
		console.error("Failed login attempt!");
		socket.emit("failedLogin", {
			english: "Failed Login: not connected to this Enmeshed-account",
			german: "Fehlgeschlagener Login: keine Verbindung zu diesem Enmeshed-account"
		});
		return await CONNECTOR_CLIENT.relationships.rejectRelationshipChange(relationship.id, changeId);
	}

	const itemGroup = request.content.items[0] as ConnectorRequestContentItemGroup;

	const username = (itemGroup.items[1] as CreateAttributeRequestItem).attribute.value.value as string;

	const change = request.response!.content;

	await onboardingRegistration(change, request.peer, username, metadata, relationship.id, changeId);
}

async function onboardingRegistration(
	_change: ConnectorRequestResponseContent,
	peerAddr: string,
	username: string,
	metadata: Record<string, string>,
	relationshipId: string,
	changeId: string
) {
	const sId = metadata.webSessionId;

	const socket = SOCKET_MANAGER.getSocket(sId);

	try {
		const status = await storeEnmeshedAddress(
			username,
			peerAddr
		);

		if (status === 204 || status === 201) {
			const response = await CONNECTOR_CLIENT.relationships.acceptRelationshipChange(relationshipId, changeId);
			if (response.isSuccess) {
				if (socket) {
					socket.emit("onboard", peerAddr);
				} else {
					console.log("could not find socket");
				}
			}
		} else {
			await CONNECTOR_CLIENT.relationships.rejectRelationshipChange(relationshipId, changeId);
		}
	} catch (e) {
		console.log(e);
		await CONNECTOR_CLIENT.relationships.rejectRelationshipChange(relationshipId, changeId);
	}
}
async function handleOnboardingMessage(request: ConnectorRequest) {
	if (!request.content.metadata) {
		return;
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const metadata: any = request.content.metadata;
	const username: string | undefined = metadata.userName;
	const socket = SOCKET_MANAGER.getSocket(metadata.webSessionId);
	if (!username) {
		return;
	}
	const attributes = await CONNECTOR_CLIENT.attributes.getAttributes({
		content: {
			key: "userName"
		},
		shareInfo: {
			peer: request.peer
		},
	})
	if (attributes.isError || attributes.result.length === 0) {
		return new Response(null, { status: 400 });
	}
	const nonSucceededAttributes = attributes.result.filter((el) => !el.succeededBy)

	const userNameAttr = nonSucceededAttributes[0];

	if (userNameAttr.content.value.value !== "") {
		if (userNameAttr.content.value.value === username) {
			socket?.emit("onboard_error", "You are allready connected to this account");
		} else {
			socket?.emit("onboard_error", "You are allready connected to a different account");
		}
		return;
	}

	const status = await storeEnmeshedAddress(
		username,
		request.peer
	);
	if (status === 204 || status === 201) {
		await CONNECTOR_CLIENT.attributes.succeedAttribute(userNameAttr.id, {
			successorContent: {
				value: {
					"@type": "ProprietaryString",
					title: `${config.get("connector.name")}.userName`,
					value: username
				}
			}
		})
		socket?.emit("onboard", request.peer);
	}
}
