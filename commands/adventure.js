import { query } from "../database/db.js";

// Expanded encounters list
const encounters = [
  { name: "Mutant Scavenger", xp: 10, cash: 15 },
  { name: "Collapsed Bunker", xp: 5, cash: 8 },
  { name: "Radiated Beast", xp: 15, cash: 20 },
  { name: "Wasteland Raider", xp: 12, cash: 18 },
  { name: "Abandoned Vehicle", xp: 8, cash: 10 },
  { name: "Poisonous Swamp", xp: 7, cash: 12 },
  { name: "Derelict Factory", xp: 14, cash: 22 },
  { name: "Rogue Drone", xp: 18, cash: 25 },
  { name: "Mutant Pack", xp: 20, cash: 30 },
  { name: "Collapsed Tunnel", xp: 10, cash: 15 },
  { name: "Bandit Ambush", xp: 16, cash: 20 },
  { name: "Radiation Zone", xp: 12, cash: 18 },
  { name: "Supply Drop", xp: 5, cash: 10 },
  { name: "Hidden Cache", xp: 10, cash: 25 },
  { name: "Wasteland Survivor", xp: 8, cash: 12 },
  { name: "Savage Beast", xp: 22, cash: 35 },
  { name: "Ancient Ruins", xp: 15, cash: 20 },
  { name: "Radioactive Storm", xp: 18, cash: 28 },
  { name: "Deranged Scientist", xp: 14, cash: 22 },
  { name: "Mutant Giant", xp: 25, cash: 40 }
];

// Optional loot items for encounters
const loot = [
  { name: "Scrap Armor", stat: "defense", bonus: 2 },
  { name: "Rusty Blade", stat: "attack", bonus: 3 },
  { name: "Canned Food", stat: "health", bonus: 5 },
  { name: "Energy Drink", stat: "energy", bonus: 1 },
  { name: "Radiation Suit", stat: "defense", bonus: 5 }
];

// XP required per level (example)
function xpForNextLevel(level) {
  return 50 + level * 20;
}

// Random integer helper
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  name: "adventure",
  async execute(client, message) {
    const user = (await query("SELECT * FROM users WHERE id=$1", [message.author.id])).rows[0];
    if (!user) return message.reply("You must register first using !register.");

    if (user.energy <= 0) {
      message.reply("No energy left. Wait to recover.");
      return;
    }

    // Select random encounter
    const e = encounters[randInt(0, encounters.length - 1)];

    // Calculate new XP and check for level up
    let newXP = user.xp + e.xp;
    let newLevel = user.level || 1;
    let leveledUp = false;

    while (newXP >= xpForNextLevel(newLevel)) {
      newXP -= xpForNextLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    // Random loot chance
    let lootMsg = "";
    if (Math.random() < 0.3) {
      const l = loot[randInt(0, loot.length - 1)];
      lootMsg = `\nLoot found: ${l.name} (+${l.bonus} ${l.stat})`;
      // Optionally store the item in inventory
    }

    // Update user in database
    await query(
      "UPDATE users SET xp=$1, novadust=$2, energy=$3, level=$4 WHERE id=$5",
      [newXP, user.novadust + e.cash, user.energy - 1, newLevel, user.id]
    );

    let replyMsg = `Encounter: ${e.name}\n+${e.xp} XP | +${e.cash} NovaDust\nEnergy remaining: ${user.energy - 1}\n`;
    if (leveledUp) replyMsg += `🎉 Congratulations! You leveled up to level ${newLevel}!\n`;
    replyMsg += `Current XP: ${newXP}/${xpForNextLevel(newLevel)}\n`;
    replyMsg += lootMsg;

    message.reply(replyMsg);
  }
};