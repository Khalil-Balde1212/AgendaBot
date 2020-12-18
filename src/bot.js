require('dotenv').config();
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

const Users = require('./Models/User')(sequelize, Sequelize.DataTypes);
const Courses = require('./Models/Course')(sequelize, Sequelize.DataTypes);
const Assignments = require('./Models/Assignment')(sequelize, Sequelize.DataTypes);

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
    msg = message.content;

    
    //find command
    args = new Array;
    for(i = 0; i < 3; i++){
        args[i] = msg.substring(0, msg.indexOf(' ')); //get prefix
        msg = msg.slice(args[i].length).trim() +  " ";
    }
    i = 3;
    // console.log(msg);
    while(msg.substring(0, msg.indexOf(']') + 1) != ""){
        args[i] = msg.substring(0, msg.indexOf(']') + 1);
        msg = msg.slice(args[i].length).trim() +  " ";
        args[i] = args[i].replace(/[\[\]']+/g,'')
        i++;
    }
    args.shift();
    const command = args.shift().toLowerCase();
    // console.log(args);
    

    try{
        await Users.create({ user_id: message.author.id});
        console.log("New User created! ID: " + message.author.id + " " + message.author.tag);
    } catch {
        // console.log("User already exists!");
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
                case "add": //TODO there is probably a smarter way to do this but my brain is unimaginably small
                    if(args[1] != undefined){ //only adding course
                        if(args[2] != undefined){ //adding course start and end dates
                            if(args[3] == undefined) {message.channgel.send("Please input an end date!"); break;}
                            if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                                Courses.create({user_id: message.author.id, course_name: args[1], start_date: args[2], end_date: args[3]});
                                message.channel.send("Added " + args[1] + " to your course list!\nStarts on: " + args[2] + "\nEnds on: " + args[3]);
                            } else{
                                message.channel.send("You are already enrolled in " + args[1] + "!");
                            }
                            
                        } else {
                            console.log(await Courses.findAll({where: {user_id: message.author.id, course_name: args[1]}}));
                            if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                                Courses.create({user_id: message.author.id, course_name: args[1]});
                                message.channel.send("Added " + args[1] + " to your course list!");
                            } else{
                                message.channel.send("You are already enrolled in " + args[1] + "!");
                            }
                        }
                    } else {
                        message.channel.send("No thing dude what the fuck");
                    }
                    break;

                case "r":
                case "remove":
                    if(args[1] != undefined){
                        console.log(await Courses.findAll({where: {user_id: message.author.id, course_name: args[1]}}));
                        if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) != undefined){
                            Courses.destroy({where: {user_id: message.author.id, course_name: args[1]}});
                            message.channel.send("Removed " + args[1] + " from your course list!");
                        } else{
                            message.channel.send("You don't even take " + args[1] + "!");
                        }
                    } else {
                        message.channel.send("No thing dude what the fuck");
                    }
                    break;

                case "list":
                    target = message.mentions.users.first() || message.author;
                    course_list = (await Courses.findAll({where: {user_id: target.id}}));
                    const messageEmbed = new discord.MessageEmbed;
                    messageEmbed.setColor((await Users.findOne({where: {user_id: target.id}})).get('fav_colour'));
                    messageEmbed.setTitle(target.username + "'s courses!");
                    messageEmbed.setDescription(target.username + " is currently enrolled in");

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