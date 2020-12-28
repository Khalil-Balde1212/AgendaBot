require('dotenv').config();
const fs = require('fs');
const discord = require('discord.js');
const cron = require('cron');
const { Sequelize } = require('sequelize');

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
const sequelize = new Sequelize('agendabase', 'root', 'root', {
    host: '/cloudsql/agendabot-300000:us-central1:my-sql-database',
	dialect: 'mysql',
    logging: false,
})

try {
    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');
    });
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const Users = require('./Models/User')(sequelize, Sequelize.DataTypes);
const Courses = require('./Models/Course')(sequelize, Sequelize.DataTypes);
const Assignments = require('./Models/Assignment')(sequelize, Sequelize.DataTypes);



client.once('ready', async () => {
    Users.sync();
    Courses.sync();
    Assignments.sync();

    const scheduledMessage = new cron.CronJob('*/10 * * * *', () => {
        Assignments.findAll({where: {complete: false}}).then((result) => {
            var today = new Date();

            result.forEach(async (temp) => {
                var dueDate = temp.get('due_date');
                var todayts = Math.round(today.getTime() / 1000);
                var duedatets = Math.round(temp.get('due_date').getTime() / 1000);

                owner = temp.get('user_id');
                worktitle = temp.get('title');
                coursename = temp.get('course_name');

                delta = duedatets - todayts;

                checkhours = [72, 24, 12, 6, 4, 2, 1, 0];

                try{
                //check if due date is coming up
                    if(dueDate > today){
                        for(let i of checkhours){

                            if(delta <=  i*3600 + 5*60 && delta >= i*3600 - 5*60){ //check if due in 24 hours
                                if(i == 0){
                                    (await client.users.fetch(owner)).send('`' + worktitle + '` for `' + coursename + '` is due now! Due date: `' + dateToString(temp.get('due_date')) + '`');
                                    break;
                                }

                                (await client.users.fetch(owner)).send('`' + worktitle + '` for `' + coursename + '` is due in ' + i +  ' hours! `' + dateToString(temp.get('due_date')) + '`');
                            }
                        }
                    } else { //work is over due
                        delta = todayts - duedatets;
                        for(let i of checkhours){
                            
                            if(delta <=  i*3600 + 5*60 && delta >= i*3600 - 5*60){ //check if due in 24 hours
                                if(i == 0){
                                    (await client.users.fetch(owner)).send('`' + worktitle + '` for `' + coursename + '` is due now! Due date: `' + dateToString(temp.get('due_date')) + '`');
                                    break;
                                }

                                (await client.users.fetch(owner)).send('`' + worktitle + '` for `' + coursename + '` is overdue by ' + i +  ' hours! Due date: `' + dateToString(temp.get('due_date')) + '`');
                            }
                        }
                    }
                } catch {
                    console.log('Error running message scheduler!')
                }
            });
        });
    });

    scheduledMessage.start();
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
		client.commands.get(command).execute(discord, message, args, sequelize, Sequelize.DataTypes);
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