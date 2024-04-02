import express from "express";

export async function handleKeycloakWebhook(req: express.Request, res: express.Response) {
	console.log(JSON.stringify(req.body, null, 2))
	res.sendStatus(200);
}
