// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";
import config from "config";
import { ConnectorClient } from "@nmshd/connector-sdk";
import { SOCKET_MANAGER } from "./socketManager.js";
import { updateUser, getUser, impersonate, getUserData } from "./keycloakHelper.js";

const CONNECTOR_CLIENT = ConnectorClient.create({
	baseUrl: config.get("connector.url"),
	apiKey: config.get("connector.apiKey")
});

/**
 * inject the webhook handler into the express app
 * @param {express.Express} app 
 */
export async function injectWebhookHandlers(app) {
	app.post("/webhooks/relationship", handleEnmeshedRelationshipWebhook);
}

/**
 * the webhook handler
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function handleEnmeshedRelationshipWebhook(req, res) {
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

/**
 * handle login request
 * @param {import("@nmshd/connector-sdk").ConnectorRequest} request
 */
async function handleEnmeshedLogin(request) {
	console.log(request);

	if (!(request.response?.content.result === "Accepted")) {
		return;
	}

	if (!request.content.metadata || !request.content.metadata.webSessionId) {
		return
	}

	const sessionID = request.content.metadata.webSessionId;

	const peer = request.peer;

	const relationship = await CONNECTOR_CLIENT.attributes.getAttributes({
		content: { key: "userName" },
		shareInfo: { peer: peer }
	});

	if (relationship.isError) {
		console.error("User not found!");
		return;
	}

	const nmshdUser = relationship.result[0].content.value.value;

	const user = await getUser(nmshdUser);
	const tokens = await impersonate(user.id);
	const socket = SOCKET_MANAGER.getSocket(sessionID);
	if (!socket) {
		console.error(`Socket for SessionID: ${sessionID} not found`);
		return;
	}
	socket.emit("login", tokens);
}

/**
 * Represents a book.
 * @param {import("@nmshd/connector-sdk").ConnectorRequest} request
 */
async function handleEnmeshedRelationshipWebhookWithRelationshipResponseSourceType(request) {
	const changeId = request.response.source.reference;

	const templateId = request.source.reference;

	const relationship = (await CONNECTOR_CLIENT.relationships.getRelationships({ template: { id: templateId } }))
		.result[0];

	const template = (await CONNECTOR_CLIENT.relationshipTemplates.getRelationshipTemplate(templateId)).result;

	const metadata = template.content.metadata;

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

	const itemGroup = request.content.items[0];

	const username = itemGroup.items[1].attribute.value.value;

	const change = request.response.content;

	await onboardingRegistration(change, username, metadata, relationship.id, changeId);
}

/**
 * onboard existing account with enmeshed
 * @param {import("@nmshd/connector-sdk").ConnectorRequestResponseContent} change
 * @param {string} username
 * @param {any} metadata
 * @param {string} relationshipId
 * @param {string} changeId 
 */
async function onboardingRegistration(
	change,
	username,
	metadata,
	relationshipId,
	changeId
) {
	const sId = metadata.webSessionId;

	const socket = SOCKET_MANAGER.getSocket(sId);

	const userData = getUserData(change, username);

	const status = await updateUser(userData);

	if (status === 204 || status === 201) {
		const response = await CONNECTOR_CLIENT.relationships.acceptRelationshipChange(relationshipId, changeId);
		if (response.isSuccess) {
			const user = await getUser(username);
			const keycloakTokens = await impersonate(user.id);

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
