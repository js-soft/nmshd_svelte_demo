import type { ConnectorRequestContent } from "@nmshd/connector-sdk";
import { CONNECTOR_CLIENT } from "./enmeshed";

export async function createLoginQRCode(
	sId: string
): Promise<ArrayBuffer> {
	const onNewRelationship: ConnectorRequestContent = {
		items: [
			{
				"@type": "AuthenticationRequestItem",
				"mustBeAccepted": true,
				"title": "Dummy request"
			}
		]
	};
	const requestPlausible = await CONNECTOR_CLIENT.outgoingRequests.canCreateRequest({ content: onNewRelationship });

	if (!requestPlausible.result.isSuccess) {
		console.error("Could not create template request!");
		return new ArrayBuffer(0);
	}
	// Template erstellen
	const template = await CONNECTOR_CLIENT.relationshipTemplates.createOwnRelationshipTemplate(
		{
			maxNumberOfAllocations: 1,
			content: {
				"@type": "RelationshipTemplateContent",
				title: "Login",
				metadata: {
					webSessionId: sId,
				},
				onNewRelationship,
				onExistingRelationship: {
					metadata: {
						webSessionId: sId,
					},
					items: [
						{
							"@type": "AuthenticationRequestItem",
							title: "Login Request",
							description:
								"There has been a login request if you did not initiate it please ignore this message and do not approve!",
							mustBeAccepted: true,
							reqireManualDecision: true
						}
					]
				}
			},
			expiresAt: "2025"
		},
	);

	const image = await CONNECTOR_CLIENT.relationshipTemplates.createTokenQrCodeForOwnRelationshipTemplate(
		template.result.id
	);

	return image.result;
}
