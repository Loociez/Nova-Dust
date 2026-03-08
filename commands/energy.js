import { query } from "../database/db.js";

export default {
  name: "energy",
  description: "See your current Energy. Regenerates 1 energy every 10 minutes.",
  async execute(client, message, args) {
    const user = (await query("SELECT * FROM users WHERE id=$1", [message.author.id])).rows[0];
    if (!user) return message.reply("You must register first using !register.");

    const maxEnergy = 10;
    const now = new Date();
    const last = new Date(user.last_energy_update || now);
    let energy = user.energy;

    // Calculate how many 10-min intervals have passed
    const minutesPassed = Math.floor((now - last) / 1000 / 60);
    const energyToAdd = Math.floor(minutesPassed / 10);

    if (energyToAdd > 0) {
      energy = Math.min(maxEnergy, energy + energyToAdd);
      await query(
        "UPDATE users SET energy=$1, last_energy_update=$2 WHERE id=$3",
        [energy, now, user.id]
      );
    }

    message.reply(`💥 ${message.author.username}, you currently have ${energy}/${maxEnergy} energy.`);
  }
};