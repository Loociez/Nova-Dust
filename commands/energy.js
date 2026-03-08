import { query } from "../database/db.js";

export default {
  name: "energy",
  async execute(client, message, args) {
    const user = (await query("SELECT * FROM users WHERE id=$1", [message.author.id])).rows[0];
    if (!user) return message.reply("You must register first using !register.");

    const maxEnergy = 10; // Or pull from config if you want
    const energy = user.energy;

    message.reply(`💥 ${message.author.username}, you currently have ${energy}/${maxEnergy} energy.`);
  }
};