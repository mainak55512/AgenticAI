import express from "express";
import { handler } from "./handler"
import { TELEGRAM_API_KEY } from "./api_keys";

const PORT = process.env.PORT || 4040;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_API_KEY}`;

const app = express();

app.use(express.json());

app.post("*", async (req, res) => {
	res.send(await handler(req));
});

app.listen(PORT, function(err) {
	if (err) console.error(err);
	console.log("Server listening on PORT: ", PORT);
})
