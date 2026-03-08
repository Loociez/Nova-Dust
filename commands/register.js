import { query } from "../database/db.js";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./config.json"));

export default {
  name: "register",
  async execute(client, message) {

    const exists = await query("SELECT * FROM users WHERE id=$1", [message.author.id]);

    if (exists.rows.length) {
      message.reply("You are already registered.");
      return;
    }

    await query(
      "INSERT INTO users(id,username) VALUES($1,$2)",
      [message.author.id, message.author.username]
    );

    const role = message.guild.roles.cache.find(r => r.name === config.roleOnRegister);
    if (role) await message.member.roles.add(role);

    message.reply("Welcome to the Nova-Dust wasteland survivor.");
  }
};