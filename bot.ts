import express from "express";
import { handler } from "./handler"

const PORT = process.env.PORT || 4040;

const app = express();

app.use(express.json());

app.post("*", async (req, res) => {
	res.send(await handler(req));
});

app.listen(PORT, function(err) {
	if (err) console.error(err);
	console.log("Server listening on PORT: ", PORT);
})
