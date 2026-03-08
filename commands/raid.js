import { query } from "../database/db.js";

// Random NPC raids
const raids = [
  { name: "Wandering Trader", chance: 0.5, xp: 20, cash: 30 },
  { name: "Mutant Gang", chance: 0.25, xp: 40, cash: 50 },
  { name: "Scavenger Camp", chance: 0.15, xp: 60, cash: 80 },
  { name: "Abandoned Raider Loot", chance: 0.1, xp: 80, cash: 100 }
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  name: "raid",
  async execute(client, message) {
    const user = (await query("SELECT * FROM users WHERE id=$1", [message.author.id])).rows[0];
    if (!user) return message.reply("Register first using !register.");

    if (user.energy <= 0) {
      message.reply("No energy left. Wait to recover.");
      return;
    }

    // Pick a random raid
    const r = raids[randInt(0, raids.length - 1)];
    const success = Math.random() < r.chance;

    let reply = `Raid Attempt: ${r.name}\n`;
    let newXP = user.xp;
    let newBalance = user.novadust;

    if (success) {
      newXP += r.xp;
      newBalance += r.cash;
      reply += `🎉 Success! Gained +${r.xp} XP and +${r.cash} NovaDust.`;
    } else {
      reply += `😢 Failed! Energy lost, no rewards.`;
    }

    // Deduct energy
    const newEnergy = user.energy - 1;

    // Update DB
    await query(
      "UPDATE users SET xp=$1, novadust=$2, energy=$3 WHERE id=$4",
      [newXP, newBalance, newEnergy, user.id]
    );

    reply += `\nEnergy remaining: ${newEnergy}`;

    message.reply(reply);
  }
};