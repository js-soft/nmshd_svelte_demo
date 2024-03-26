import type { ConnectorIdentityAttribute, ConnectorRequestContent, ConnectorRequestContentItemGroup, CreateOutgoingRequestRequestContentItemDerivations } from "@nmshd/connector-sdk";
import { CONNECTOR_CLIENT } from "./enmeshed";
import config from "config";

export async function createOnboardingQRCode(
	sId: string,
	userName: string
): Promise<ArrayBuffer> {
	const identity = (await CONNECTOR_CLIENT.account.getIdentityInfo()).result;

	const sharableDisplayName = await getOrCreateConnectorDisplayName(identity.address, config.get("connector.name"));

	const createItems: CreateOutgoingRequestRequestContentItemDerivations[] = [
		{
			"@type": "ShareAttributeRequestItem",
			mustBeAccepted: true,
			attribute: { ...sharableDisplayName.content, owner: "" },
			sourceAttributeId: sharableDisplayName.id
		},
		{
			"@type": "CreateAttributeRequestItem",
			mustBeAccepted: true,
			attribute: {
				"@type": "RelationshipAttribute",
				owner: identity.address,
				key: "userName",
				value: {
					"@type": "ProprietaryString",
					title: `${config.get("connector.name")}.userName`,
					value: userName
				},
				isTechnical: false,
				confidentiality: "public"
			}
		}
	];

	const createObject: ConnectorRequestContentItemGroup = {
		"@type": "RequestItemGroup",
		mustBeAccepted: createItems.some((el) => el.mustBeAccepted),
		title: "Shared Attributes",
		items: createItems
	};
	const onNewRelationship: ConnectorRequestContent = {
		items: [createObject]
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
					type: "Onboarding",
				},
				onNewRelationship
			},
			expiresAt: "2025"
		},
	);

	const image = await CONNECTOR_CLIENT.relationshipTemplates.createTokenQrCodeForOwnRelationshipTemplate(
		template.result.id
	);

	return image.result;
}
async function getOrCreateConnectorDisplayName(connectorAddress: string, displayName: string) {
	const response = await CONNECTOR_CLIENT.attributes.getValidAttributes({
		content: {
			owner: connectorAddress,
			value: {
				"@type": "DisplayName"
			}
		},
		shareInfo: {
			peer: "!"
		}
	});

	if (response.result.length > 0) {
		return response.result[0];
	}

	const createAttributeResponse = await CONNECTOR_CLIENT.attributes.createRepositoryAttribute({
		content: {
			"@type": "IdentityAttribute",
			owner: connectorAddress,
			value: {
				"@type": "DisplayName",
				value: displayName
			}
		} as ConnectorIdentityAttribute
	});

	return createAttributeResponse.result;
}
