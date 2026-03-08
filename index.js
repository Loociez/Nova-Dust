import express from "express";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import fsPromises from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./database/db.js";

// -------------------------
// Tiny web server for Render Free
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Nova-Dust bot running!");
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// -------------------------
// Discord bot setup
// -------------------------
dotenv.config();

const config = JSON.parse(fs.readFileSync("./config.json"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// -------------------------
// Command loader
// -------------------------
client.commands = new Collection();

async function loadCommands() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const commandFiles = await fsPromises.readdir(path.join(__dirname, "commands"));
    for (const file of commandFiles) {
      if (file.endsWith(".js")) {
        const { default: command } = await import(`./commands/${file}`);
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
      }
    }
  } catch (err) {
    console.error("Error loading commands:", err);
  }
}

// -------------------------
// Initialize DB + Commands + Login
// -------------------------
(async () => {
  try {
    console.log("Initializing database...");
    await initDB();
    console.log("Database initialized.");

    await loadCommands();
    console.log(`Total commands loaded: ${client.commands.size}`);

    // -------------------------
    // Message listener
    // -------------------------
    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;

      const prefix = "!";
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = client.commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(client, message, args);
      } catch (err) {
        console.error("Command execution error:", err);
        message.reply("There was an error executing that command.");
      }
    });

    // -------------------------
    // Login
    // -------------------------
    console.log("Logging in to Discord...");
    await client.login(process.env.DISCORD_TOKEN);
    console.log("Login promise resolved.");

    client.once("ready", () => {
      console.log(`${client.user.tag} online in Nova-Dust wasteland`);
    });

  } catch (err) {
    console.error("Initialization error:", err);
  }
})();