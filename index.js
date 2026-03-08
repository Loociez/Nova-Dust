import express from "express";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import dotenv from "dotenv";
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
import fsPromises from "fs/promises";
const commandFiles = await fsPromises.readdir("./commands");

for (const file of commandFiles) {
  if (file.endsWith(".js")) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default.name, command.default);
  }
}

// -------------------------
// Database init
// -------------------------
await initDB();

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
    console.error(err);
    message.reply("There was an error executing that command.");
  }
});

// -------------------------
// Login
// -------------------------
client.once("ready", () => {
  console.log(`${client.user.tag} online in Nova-Dust wasteland`);
});

client.login(process.env.DISCORD_TOKEN);