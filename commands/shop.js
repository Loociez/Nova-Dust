import { query } from "../database/db.js";

const items=[
{name:"Rust Blade",cost:50,attack:2},
{name:"Scrap Armor",cost:80,defense:3},
{name:"Energy Cell",cost:40,energy:2}
];

export default{
name:"shop",
async execute(client,message,args){

if(args[0]==="buy"){

const name=args.slice(1).join(" ");

const item=items.find(i=>i.name.toLowerCase()===name.toLowerCase());
if(!item) return message.reply("Item not found");

const user=(await query("SELECT * FROM users WHERE id=$1",[message.author.id])).rows[0];

if(user.novadust<item.cost) return message.reply("Not enough NovaDust");

let inv=user.items||[];
inv.push(item);

await query(
"UPDATE users SET novadust=$1,items=$2 WHERE id=$3",
[user.novadust-item.cost,JSON.stringify(inv),user.id]
);

message.reply(`Purchased ${item.name}`);

}else{

const list=items.map(i=>`${i.name} - ${i.cost}`).join("\n");

message.reply(`Nova-Dust Shop:\n${list}`);

}

}
}