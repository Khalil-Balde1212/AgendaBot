require('dotenv').config();
const fs = require('fs');
const discord = require('discord.js');

const client = new discord.Client();
client.commands = new discord.Collection();


const commandFiles = fs.readdirSync('./src/Commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./Commands/${file}`);
	client.commands.set(command.name, command);
}


client.login(process.env.BOT_TOKEN).then(() => console.log("Bot is logged in!"));


prefix = process.env.COMMAND_PREFIX;


//invoke on ready
client.once('ready', async () => {
         
});

//Invoke on message recieved
client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    
    //command argument setup
    msg = message.content;

    
    const command = msg;

    if (!client.commands.has(command)) {
        message.channel.send('Unknown command, type `!AB help` for all the commands!');
        return;
    }
    
    //check if user already exists in db
    try{
        await Users.create({ user_id: message.author.id});
        console.log("New User created! ID: " + message.author.id + " " + message.author.tag);
    } catch {
        console.log("User already exists!");
    }

    //run the commands
    try {
		client.commands.get(command).execute(discord, message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
    }
});

function dateToString(date){
    var yyyy = date.getFullYear().toString().padStart(4, '0');
    var mm = (date.getMonth() + 1).toString().padStart(2, '0');
    var dd = date.getDate().toString().padStart(2, '0');
    var hh = date.getHours().toString().padStart(2, '0');
    var min = date.getMinutes().toString().padStart(2, '0');
    var noon = 'am'
    if(hh >= 12){
        hh = hh - 12;
        noon = 'pm'
    }

    return mm + '/' + dd + '/' + yyyy + ' ' + hh + ':' + min + noon;
}