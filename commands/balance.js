import { query } from "../database/db.js";

export default {
name: "balance",
async execute(client,message){

const user=(await query("SELECT * FROM users WHERE id=$1",[message.author.id])).rows[0];
if(!user) return message.reply("Register first with !register");

message.reply(`You have ${user.novadust} NovaDust.`);

}
}