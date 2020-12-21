require('dotenv').config();
const fs = require('fs');
const discord = require('discord.js');
const { Sequelize } = require('sequelize');
const { Console } = require('console');

const client = new discord.Client();
client.commands = new discord.Collection();

const commandFiles = fs.readdirSync('./src/Commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./Commands/${file}`);
	client.commands.set(command.name, command);
}

client.login(process.env.BOT_TOKEN).then(() => console.log("Bot is logged in!"));


prefix = process.env.COMMAND_PREFIX;

//all the sequelize stuff
const sequelize = new Sequelize({
    host: 'localhost',
	dialect: 'sqlite',
	logging: false,
    storage: process.env.DBPATH
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const Users = require('./Models/User')(sequelize, Sequelize.DataTypes);
const Courses = require('./Models/Course')(sequelize, Sequelize.DataTypes);
const Assignments = require('./Models/Assignment')(sequelize, Sequelize.DataTypes);

client.once('ready', () => {
    Users.sync();
    Courses.sync();
    Assignments.sync();
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    
    //command argument setup
    msg = message.content;

    //seperate prefix, command and subcommands
    args = new Array;
    for(i = 0; i < 3; i++){
        args[i] = msg.substring(0, msg.indexOf(' ')); 
        msg = msg.slice(args[i].length).trim() +  " ";
    }

    //get all args
    while(msg.substring(0, msg.indexOf(']') + 1) != ""){ 
        args[i] = msg.substring(0, msg.indexOf(']') + 1);
        msg = msg.slice(args[i].length).trim() +  " ";
        args[i] = args[i].replace(/[\[\]']+/g,'')
        i++;
    }
    args.shift();
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;
    //check if user already exists in db
    try{
        await Users.create({ user_id: message.author.id});
        console.log("New User created! ID: " + message.author.id + " " + message.author.tag);
    } catch {
        console.log("User already exists!");
    }

    //run the commands
    try {
		client.commands.get(command).execute(discord, message, args, sequelize, Sequelize.DataTypes);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});