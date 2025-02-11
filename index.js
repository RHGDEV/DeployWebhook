const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const serverPath = "/home/dbots/DiscordBots/";
const serverListen = "/deploy"
const serverPort = 9000;

// Catch POST requests to /deploy
app.post(serverListen, async (req, res) => {
	// Check if the request has the correct body
	if (!req.body) return res.status(400).send("Invalid request body");
	if (!req.body.dirname) return res.status(400).send("Invalid request body");
	
	try{
		// Check if the directory exists
		await fs.promises.access(`${serverPath}/${req.body.dirname}`, fs.constants.F_OK | fs.constants.R_OK, (err) => {
			if (err) return res.status(500).send("Invalid directory"); 
		});

		// If directory exists, pull latest changes and restart PM2
		console.log(`Pulling latest changes and restarting PM2 for ${req.body.dirname}...`);
		exec(`cd ${serverPath}/${req.body.dirname} && git pull origin && npm i && pm2 restart ${req.body.dirname}`, (error, stdout, stderr) => {
			if (error) return res.status(500).send(`Error: ${error.message}`);
			console.log(stdout);
			res.send(`Successfully Deployed ${req.body.dirname}`);
		});
	} catch (err) {
		console.log(err);
	}
});

// Catch get requests to /deploy
app.get(serverListen, async (req, res) => {
	res.send("Invalid request method");
});


app.listen(serverPort, async () => console.log(`Webhook listener running on port ${serverPort}`));
