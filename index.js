const express = require("express");
const { access, constants } = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const serverPath = "/home/dbots/DiscordBots/";
const serverListen = "/deploy"
const serverPort = 9000;

// Catch POST requests to /deploy
app.post(serverListen, (req, res) => {
	// Check if the directory exists
	access(`${serverPath}/${req.dirname}`, constants.F_OK | constants.R_OK, (err) => {
		if (err) return res.status(500).send("Invalid directory"); 
	});

	// If directory exists, pull latest changes and restart PM2
	console.log(`Pulling latest changes and restarting PM2 for ${req.dirname}...`);
	exec(`cd ${serverPath}/${req.dirname} && git pull origin && npm i && pm2 restart ${req.dirname}`, (error, stdout, stderr) => {
		if (error) return res.status(500).send(`Error: ${error.message}`);
		console.log(`Stdout: ${stdout}`);
		res.send(`Successfully Deployed ${req.dirname}`);
	});
});

// Catch get requests to /deploy
app.get(serverListen, (req, res) => {
	res.send("Invalid request method");
});


app.listen(serverPort, () => console.log(`Webhook listener running on port ${serverPort}`));
