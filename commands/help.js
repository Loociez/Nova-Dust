export default {
  name: "help",
  description: "Displays a list of all available commands and their usage",
  async execute(client, message, args) {
    if (!client.commands) return message.reply("No commands loaded.");

    let helpMessage = "📜 **Nova-Dust Command List** 📜\n\n";

    client.commands.forEach((cmd) => {
      // Use description if available, else default
      helpMessage += `**!${cmd.name}** - ${cmd.description || "No description provided"}\n`;
    });

    // Split long messages into multiple parts to avoid Discord limits
    const splitMessages = helpMessage.match(/[\s\S]{1,2000}/g);
    for (const msg of splitMessages) {
      await message.channel.send(msg);
    }
  }
};