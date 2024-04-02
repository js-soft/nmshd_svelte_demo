// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";
import config from "config";
import LZString from "lz-string";
import { ConnectorClient, ConnectorRequest, ConnectorRequestContentItemGroup, ConnectorRequestResponseContent, CreateAttributeRequestItem } from "@nmshd/connector-sdk";
import { SOCKET_MANAGER } from "../socketManager.js";
import { updateUser, getUser, impersonate } from "./keycloakHelper.js";

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

	if (!req.body.trigger) return;

	const request = req.body.data;

	const respnseSourceType = request.response.source.type;

	if (respnseSourceType === "Message") {
		await handleEnmeshedLogin(request);
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

	const peer = request.peer;

	const relationship = await CONNECTOR_CLIENT.attributes.getAttributes({
		content: { key: "userName" },
		shareInfo: { peer: peer }
	});

	if (relationship.isError) {
		console.error("User not found!");
		return;
	}

	const nmshdUser = relationship.result[0].content.value.value as string;

	const user = await getUser(nmshdUser);
	const tokens = await impersonate(user!.id);
	const socket = SOCKET_MANAGER.getSocket(sessionID);
	if (!socket) {
		console.error(`Socket for SessionID: ${sessionID} not found`);
		return;
	}
	const compress = LZString.compressToBase64(JSON.stringify(tokens));
	socket.emit("login", compress);
}

async function handleEnmeshedRelationshipWebhookWithRelationshipResponseSourceType(request: ConnectorRequest) {
	const changeId = request.response!.source!.reference;

	const templateId = request.source!.reference;

	const relationship = (await CONNECTOR_CLIENT.relationships.getRelationships({ templateId }))
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
	change: ConnectorRequestResponseContent,
	peerAddr: string,
	username: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	metadata: any,
	relationshipId: string,
	changeId: string
) {
	const sId = metadata.webSessionId;

	const socket = SOCKET_MANAGER.getSocket(sId);

	const status = await updateUser({
		userName: username,
		attributes: {
			enmeshedAddress: peerAddr
		}
	});

	if (status === 204 || status === 201) {
		const response = await CONNECTOR_CLIENT.relationships.acceptRelationshipChange(relationshipId, changeId);
		if (response.isSuccess) {
			const user = await getUser(username);
			const keycloakTokens = await impersonate(user!.id);

			if (socket) {
				socket.emit("onboard", keycloakTokens);
			} else {
				console.log("could not find socket");
			}
		}
	} else {
		await CONNECTOR_CLIENT.relationships.rejectRelationshipChange(relationshipId, changeId);
	}
}
