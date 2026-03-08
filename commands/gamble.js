import { query } from "../database/db.js";

// Gambling types with chance and payout multiplier
const gamblingTypes = {
  coin: { name: "Coin Flip", chance: 0.5, payout: 2 },
  dice: { name: "Dice Roll", chance: 1 / 6, payout: 6 },
  slots: { name: "Slots", chance: 0.1, payout: 10 }
};

// Random integer helper
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Delay helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  name: "gamble",
  description: "Gamble your NovaDust with different games (coin, dice, slots)",
  async execute(client, message, args) {
    const type = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!type || !gamblingTypes[type] || !bet) {
      return message.reply(
        "Usage: !gamble <type> <amount>\nTypes: coin, dice, slots"
      );
    }

    const user = (await query("SELECT * FROM users WHERE id=$1", [message.author.id])).rows[0];
    if (!user) return message.reply("Register first.");
    if (user.novadust < bet) return message.reply("Not enough NovaDust.");

    const game = gamblingTypes[type];
    const win = Math.random() < game.chance;
    let newBalance = user.novadust;

    if (win) newBalance += bet * (game.payout - 1);
    else newBalance -= bet;

    await query("UPDATE users SET novadust=$1 WHERE id=$2", [newBalance, user.id]);

    // -----------------------------
    // Animated message per type
    // -----------------------------
    if (type === "coin") {
      const coinSides = ["🪙 Heads", "🪙 Tails"];
      let msg = await message.reply("Flipping the coin...");
      for (let i = 0; i < 5; i++) {
        const side = coinSides[randInt(0, 1)];
        await msg.edit(`Flipping... ${side}`);
        await sleep(500);
      }
      await msg.edit(`🎲 Coin Flip Result: ${win ? "🪙 You won!" : "💀 You lost."}\nNew balance: ${newBalance}`);
    }

    else if (type === "dice") {
      let msg = await message.reply("Rolling the dice...");
      for (let i = 0; i < 5; i++) {
        const diceRoll = randInt(1, 6);
        await msg.edit(`🎲 Rolling... [${diceRoll}]`);
        await sleep(500);
      }
      await msg.edit(`🎲 Dice Roll Result: ${win ? `You won ${bet * (game.payout - 1)} NovaDust!` : `You lost ${bet} NovaDust.`}\nNew balance: ${newBalance}`);
    }

    else if (type === "slots") {
      const symbols = ["🍖", "⚡", "💀", "🔧", "🧪"];
      let msg = await message.reply("Spinning the slots...");
      for (let i = 0; i < 6; i++) {
        const reel = [symbols[randInt(0, symbols.length - 1)],
                      symbols[randInt(0, symbols.length - 1)],
                      symbols[randInt(0, symbols.length - 1)]];
        await msg.edit(`🎰 Spinning: ${reel.join(" | ")}`);
        await sleep(500);
      }
      const finalReel = [symbols[randInt(0, symbols.length - 1)],
                         symbols[randInt(0, symbols.length - 1)],
                         symbols[randInt(0, symbols.length - 1)]];
      await msg.edit(`🎰 Final Reel: ${finalReel.join(" | ")}\n${win ? `🎉 You won ${bet * (game.payout - 1)} NovaDust!` : `💀 You lost ${bet} NovaDust.`}\nNew balance: ${newBalance}`);
    }
  }
};