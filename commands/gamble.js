import { query } from "../database/db.js";

// Gambling types with chance and payout multiplier
const gamblingTypes = {
  coin: { name: "Coin Flip", chance: 0.5, payout: 2 },  // 50% chance, 2x payout
  dice: { name: "Dice Roll", chance: 1 / 6, payout: 6 }, // 1/6 chance, 6x payout
  slots: { name: "Slots", chance: 0.1, payout: 10 }      // 10% chance, 10x payout
};

// Random integer helper
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  name: "gamble",
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

    if (user.novadust < bet)
      return message.reply("Not enough NovaDust.");

    const game = gamblingTypes[type];
    const win = Math.random() < game.chance;
    let newBalance = user.novadust;

    if (win) newBalance += bet * (game.payout - 1);
    else newBalance -= bet;

    await query("UPDATE users SET novadust=$1 WHERE id=$2", [newBalance, user.id]);

    // Custom reply messages per game type
    let replyMsg = `🎲 ${game.name} | Bet: ${bet} NovaDust\n`;
    if (win) replyMsg += `🎉 You won ${bet * (game.payout - 1)} NovaDust!`;
    else replyMsg += `😢 You lost ${bet} NovaDust.`;
    replyMsg += `\nNew balance: ${newBalance}`;

    // Optional: slots emoji fun
    if (type === "slots") {
      const symbols = ["🍖", "⚡", "💀", "🔧", "🧪"];
      const reel = [symbols[randInt(0, symbols.length - 1)],
                    symbols[randInt(0, symbols.length - 1)],
                    symbols[randInt(0, symbols.length - 1)]];
      replyMsg = `🎰 Slots Reel: ${reel.join(" | ")}\n` + replyMsg;
    }

    message.reply(replyMsg);
  }
};