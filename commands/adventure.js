import { query } from "../database/db.js";

const encounters=[
{name:"Mutant Scavenger",xp:10,cash:15},
{name:"Collapsed Bunker",xp:5,cash:8},
{name:"Radiated Beast",xp:15,cash:20}
];

export default{
name:"adventure",
async execute(client,message){

const user=(await query("SELECT * FROM users WHERE id=$1",[message.author.id])).rows[0];
if(!user) return message.reply("Register first.");

if(user.energy<=0){
message.reply("No energy left. Wait to recover.");
return;
}

const e=encounters[Math.floor(Math.random()*encounters.length)];

await query(
"UPDATE users SET xp=$1, novadust=$2, energy=$3 WHERE id=$4",
[user.xp+e.xp,user.novadust+e.cash,user.energy-1,user.id]
);

message.reply(`Encounter: ${e.name} | +${e.xp} XP | +${e.cash} NovaDust`);

}
}