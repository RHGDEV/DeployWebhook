const { exec } = require("child_process");
const express = require("express");
const fs = require("fs");
const { promisify } = require('util');
const execPromise = promisify(exec);

const app = express();
app.use(express.json());

const serverPath = "/home/dbots/DiscordBots/";
const serverListen = "/deploy"
const serverPort = 9000;

// Catch POST requests to /deploy
app.post(serverListen, async (req, res) => {
	// Check if the request has the correct body
	if (!req.body || !req.body.dirname) return res.status(400).send("Invalid request body");

	// Check if the directory exists
	try {
		//fs.access(`${serverPath}/${req.body.dirname}`, fs.constants.F_OK | fs.constants.R_OK);
		// fs.access(`/Documents`, fs.constants.F_OK | fs.constants.R_OK);
		fs.statSync(`${serverPath}/${req.body.dirname}`);
	} catch (err) {
		return res.status(500).send(`Invalid directory: ${req.body.dirname}`);
	}

	// If directory exists, pull latest changes and restart PM2
	console.log(`Pulling latest changes and restarting PM2 for ${req.body.dirname}...`);

	// exec(`cd ${serverPath}/${req.body.dirname} && git pull origin && npm i && pm2 restart ${req.body.dirname}`, (error, stdout, stderr) => {
	// 	if (error) return res.status(500).send(`Error: ${error.message}`);
	// 	console.log(stdout);
	// 	res.send(`Successfully Deployed ${req.body.dirname}`);
	// });

	try {
		const { stdout, stderr } = await promisify(exec)(`cd ${serverPath}/${req.body.dirname} && git pull origin && npm i && pm2 restart ${req.body.dirname}`);

		console.log(stdout); // Log success output
		if (stderr) console.error(stderr); // Log errors if any

		res.send(`Successfully Deployed ${req.body.dirname}`);
	} catch (error) { // Catch any errors
		res.status(500).send(`Error: ${error}`);
	}
});

// GET request to check if the server is running
app.get(serverListen, async (req, res) => {
	res.send("Deployment server hook is running");
});


app.listen(serverPort, async () => console.log(`Webhook listener running on port ${serverPort}`));
