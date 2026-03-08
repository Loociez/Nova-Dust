import { query } from "../database/db.js";

export default{
name:"gamble",
async execute(client,message,args){

const bet=parseInt(args[0]);
if(!bet) return message.reply("Usage: !gamble amount");

const user=(await query("SELECT * FROM users WHERE id=$1",[message.author.id])).rows[0];
if(!user) return message.reply("Register first.");

if(user.novadust<bet) return message.reply("Not enough NovaDust");

const win=Math.random()<0.5;

let total=user.novadust;

if(win) total+=bet;
else total-=bet;

await query("UPDATE users SET novadust=$1 WHERE id=$2",[total,user.id]);

message.reply(win?`You won. Balance ${total}`:`You lost. Balance ${total}`);

}
}