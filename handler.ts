import { axInstance } from "./axios_setup"
import { callLLM } from "./agent";

function sendMessage(messageObj, messageText) {
	return axInstance().get("sendMessage", {
		chat_id: messageObj.chat.id,
		text: messageText
	});
}

async function handler(req) {
	const { body } = req;
	if (body) {
		const messageObj = body.message;
		if (messageObj.text !== "/start") {
			await sendMessage(messageObj, await callLLM(messageObj.text));
		}
	}
}

export { handler };
