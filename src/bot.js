require('dotenv').config();
const fs = require('fs');
const discord = require('discord.js');
const { Sequelize } = require('sequelize');
const { Console } = require('console');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { title, cpuUsage } = require('process');

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
});

const Courses = sequelize.define('courses', {
    user_id: {
        type: Sequelize.STRING,
    },
    course_name: {
        type: Sequelize.STRING
    },
    start_date: {type: Sequelize.STRING, defaultValue: 'No date inputted'},
    end_date: {type: Sequelize.STRING, defaultValue: 'No date inputted'}
});

const Assignments = sequelize.define('assignments', {
    user_id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    course_name: {type: Sequelize.STRING},
    title: {type: Sequelize.STRING},
    due_date: {type: Sequelize.STRING},
    complete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    remind_me: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});

client.once('ready', () => {
    console.log("Bot is logged in!");
    Users.sync();
    Courses.sync();
    Assignments.sync();
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
        
        case "fc":
        case "favouritecolour":
        case "favcolor":
        case "favcolour":

            if(args[0] == "set"){
                if(args[1] == null){//incase user is a poopoo brain
                    message.channel.send("Proper use of the command is ```!AB favcolour set [hexcode]```");
                } else {//set's user's favourite colour to something more epic
                    user = (await Users.findOne({where: {user_id: message.author.id}}));
                    message.channel.send("Set your favourite colour to " + args[1]);
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

        case "test": //test code to do a thing
            const messageEmbed = new discord.MessageEmbed();
            messageEmbed.setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'));
            messageEmbed.setTitle("test");
            messageEmbed.setDescription("epic");

            message.channel.send(messageEmbed);
            break;
        
        case "course":
            switch(args[0]){
                case "a":
                case "add":
                    if(args[1] == null){
                        message.channel.send("What is the name of the course you'd like to add?");
                        const collector = new discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { max: 1, time: 10000 });
                        // console.log(collector);
                        collector.on('collect', message => {
                            console.log(Courses.findAll({where: {user_id: message.author.id, course_name: message.content}})[0]);
                            if(Courses.findAll({where: {user_id: message.author.id, course_name: message.content}})[0] == undefined){
                                Courses.create({user_id: message.author.id, course_name: message.content});
                                message.channel.send("Added " + message.content + " to your course list!");
                            } else{
                                message.channel.send("You are already enrolled in " + message.content + "!");
                            }
                        });
                    } else {
                    }
                    break;

                case "r":
                case "remove":
                    let filter = m => m.author.id === message.author.id;
                        message.channel.send("What course would you like to remove?").then(() => {
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 30000,
                                errors: ['time']
                            }).then(message => {
                                Courses.destroy({where: {user_id: message.first().author.id, course_name: message.first().content}});
                                message.first().channel.send("Removed " + message.first().content + " from your course list!");
                            });
                    });

                    break;

                case "list":
                    course_list = (await Courses.findAll({where: {user_id: message.author.id}}));
                    const messageEmbed = new discord.MessageEmbed;
                    messageEmbed.setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'));
                    messageEmbed.setTitle(message.author.username + "'s courses!");
                    messageEmbed.setDescription(message.author.username + " is currently enrolled in");

                    for(i = 0; i < course_list.length; i++){
                        messageEmbed.addField(course_list[i].get('course_name'),
                            "Starts on: " + course_list[i].get('start_date') + "\n" +
                            "Ends on:   " + course_list[i].get('end_date'), true);
                    }

                    message.channel.send(messageEmbed);
                    break;


                default:
                    message.channel.send("You're a poopoo head that literally isn't an option"); //TODO add proper help command
                    break;

            }
        
            break;
        
        default:
            message.channel.send("Command doesnt exist!");
            break;
    }
});