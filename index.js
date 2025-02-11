const express = require("express");
const { access, constants } = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const serverPath = "/home/dbots/DiscordBots/";
const serverListen = "/deploy"
const serverPort = 9000;

// Catch POST requests to /deploy
app.post(serverListen, async (req, res) => {
	// Check if the request has the correct body
	if (!req.body) return res.status(400).send("No Body");
	if (!req.body.dirname) return res.status(400).send("No dirname in Body");

	// Promisify exec function
	const execPromise = (command) => {
		return new Promise((resolve, reject) => {
			exec(command, (error, stdout, stderr) => {
				if (error) {
					reject(error);
				}
				resolve({ stdout, stderr });
			});
		});
	};

	// Path to the directory
	
	const dirPath = `${serverPath}/${req.body.dirname}`;

    try {
        // Check if the directory exists and is readable
        await fs.access(dirPath, fs.constants.F_OK | fs.constants.R_OK);

        // If directory exists, pull latest changes and restart PM2
        console.log(`Pulling latest changes and restarting PM2 for ${req.body.dirname}...`);
        const { stdout, stderr } = await execPromise(`cd ${dirPath} && git pull origin && npm i && pm2 restart ${req.body.dirname}`);

        // Log output and send response
        if (stderr) {
            return res.status(500).send(`Error: ${stderr}`);
        }
        console.log(stdout);
        res.send(`Successfully Deployed ${req.body.dirname}`);
    } catch (err) {
        // Handle errors (directory doesn't exist or any issues during the exec)
        return res.status(500).send("Invalid directory or execution error");
    }
});

// Catch get requests to /deploy
app.get(serverListen, async (req, res) => {
	res.send("Invalid request method");
});


app.listen(serverPort, async () => console.log(`Webhook listener running on port ${serverPort}`));
