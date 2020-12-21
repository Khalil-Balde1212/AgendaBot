module.exports = {
    name: 'course',
    description: 'oh you know',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);
        const Courses = require('../Models/Course')(sequelize, dataTypes);
        const Assignments = require('../Models/Assignment')(sequelize, dataTypes);

        switch(args[0]){
            case "a":
            case "add": //TODO there is probably a smarter way to do this but my brain is unimaginably small

                //check if the course is already in the course list
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) != undefined){
                    message.channel.send('`' + args[1] + '` is already on your course list!');
                    break;
                }

                //no date inputs
                if(args[2] == undefined && args[3] == undefined){
                    Courses.create({user_id: message.author.id, course_name: args[1]});
                    message.channel.send('Added `' + args[1] + '` to your course list!');
                    break;
                }

                //check for improper number of arguments
                if(args[2] != undefined && args[3] == undefined){
                    message.channel.send('Proper use of the command is: `!AB course add [course name] [start date] [end date]`')
                }

                //check if date inputs are in proper date formatting
                if(checkValidDate(args[2]) == false){
                    message.channel.send('`' + args[2] + '` is not in mm/dd/yyyy format');
                    break;
                }

                if(checkValidDate(args[3]) == false){
                    message.channel.send('`' + args[3] + '` is not in mm/dd/yyyy format');
                    break;
                }

                //succesful!
                Courses.create({user_id: message.author.id, course_name: args[1], start_date: args[2], start_date: args[3]});
                message.channel.send(
                    'added `' + args[1] + '` to your course list! \n' + 
                    'starts on: `' + args[2] + '`\n' +
                    'ends on: `' + args[3] + '`'
                    );
                break;

            case "r":
            case "remove":
                if(args[1] != undefined){
                    console.log(await Courses.findAll({where: {user_id: message.author.id, course_name: args[1]}}));
                    if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) != undefined){
                        Courses.destroy({where: {user_id: message.author.id, course_name: args[1]}});
                        Assignments.destroy({where: {user_id: message.author.id, course_name: args[1]}});
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
                messageEmbed.setThumbnail(target.avatarURL());
                console.log(target.avatarURL());

                coursetxt = target.username + " is currently enrolled in\n \n"
                for(i = 0; i < course_list.length; i++){
                    coursetxt += '**' + course_list[i].get('course_name') + '**\n' +
                        'Starts on: ' + course_list[i].get('start_date') + '\n' + 
                        'Finished on: ' + course_list[i].get('end_date') + '\n\n';
                }

                messageEmbed.setDescription(coursetxt);

                message.channel.send(messageEmbed);
                break;

            case 'setstart':
                break;
                
            case 'setend':
                break;

            case 'setdates':
                break;
                
            default:
                message.channel.send("You're a poopoo head that literally isn't an option"); //TODO add proper help command
                break;

        }
    }
}

function checkValidDate(dateString){
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}