require('dotenv').config();
const fs = require('fs');
const discord = require('discord.js');
const { Sequelize } = require('sequelize');
const { Console } = require('console');

const client = new discord.Client();

client.login(process.env.BOT_TOKEN);
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

const Users = sequelize.define('users', {
	user_id: {
        type: Sequelize.STRING,
		unique: true,
        primaryKey: true,
    },
    fav_colour: {
        type: Sequelize.INTEGER,
        defaultValue: '0xFF6A39'
    }
}, {
    timestamps: false,
    }
);

client.once('ready', () => {
    console.log("Bot is logged in!");
    Users.sync();
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    
    //command argument setup
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    try{
        await Users.create({ user_id: message.author.id});
        console.log("New User created! ID: " + message.author.id + " " + message.author.tag);
    } catch {
        console.log("User already exists!");
    }
    

    switch(command){
        case "ping": //test command
            message.channel.send("Pong!");
            break;

        case "favcolour":

            if(args[0] == "set"){
                if(args[1] == null){//incase user is a poopoo brain
                    message.channel.send("Proper use of the command is ```!AB favcolour set [hexcode]```");
                } else {//set's user's favourite colour to something more epic
                    user = (await Users.findOne({where: {user_id: message.author.id}}));
                    user.set('fav_colour', args[1]);
                    user.save();
                }
            } else { //just displays favourite colour
                target = message.mentions.users.first() || message.author;
                try{//try finding user
                    fav = (await Users.findOne({where: {user_id: target.id}})).get('fav_colour');
                } catch { //user doesn't exist
                    Users.create({user_id: target.id});
                    fav = (await Users.findOne({where: {user_id: target.id}})).get('fav_colour');
                }
                message.channel.send(target.toString() + "'s favourite colour is: " + fav);
            }
            
            break;

        default:
            message.channel.send("Command doesnt exist!");
            break;
    }
});