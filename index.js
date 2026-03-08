import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import dotenv from "dotenv";
import { initDB } from "./database/db.js";
import config from "./config.json" assert { type: "json" };

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.name, command.default);
}

client.once("ready", async () => {
  console.log(`${client.user.tag} online in Nova-Dust wasteland`);
  await initDB();
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(client, message, args);
  } catch (err) {
    console.error(err);
    message.reply("Error executing command.");
  }
});

client.login(process.env.DISCORD_TOKEN);