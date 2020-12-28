module.exports = {
    name: 'course',
    description: 'oh you know',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);
        const Courses = require('../Models/Course')(sequelize, dataTypes);
        const Assignments = require('../Models/Assignment')(sequelize, dataTypes);

        switch(args[0]){
            case "a":
            case "add":
                //check for improper number of arguments
                if(args[1] == undefined || (args[2] != undefined && args[3] == undefined)){
                    message.channel.send('Proper use of the command is: `!AB course add [course name]` \nor`!AB course add [course name] [start date] [end date]`');
                    break;
                }

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

                //check if date inputs are in proper date formatting
                if(checkValidDate(args[2]) == false){
                    message.channel.send('`' + args[2] + '` is an invalid date. Make sure you input in `mm/dd/yyyy` format');
                    break;
                }

                if(checkValidDate(args[3]) == false){
                    message.channel.send('`' + args[2] + '` is an invalid date. Make sure you input in `mm/dd/yyyy` format');
                    break;
                }

                //succesful!
                Courses.create({user_id: message.author.id, course_name: args[1], start_date: stringToDate(args[2]), end_date: stringToDate(args[3])});
                message.channel.send(
                    'added `' + args[1] + '` to your course list! \n' + 
                    'starts on: `' + args[2] + '`\n' +
                    'ends on: `' + args[3] + '`'
                    );
                break;

            case "r":
            case "remove":
                //check if proper number of inputs
                if(args[1] == undefined || args[2] != undefined){
                    message.channel.send('proper use of the command is: `!AB course remove [course name]');
                    break;
                }

                //check if the course isn't on their courselist
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + '` isn\'t on your course list!');
                    break;
                }

                //double check that user wants to delete course
                message.channel.send('You will remove  `' + args[1] + '`from your course list and **ALL** work due dates assigned to it. Are you sure you want to remove it from your course list? `(Y/N)`').then(() => {
                    filter = response => {
                        return response.author.id == message.author.id;
                    }

                    message.channel.awaitMessages(filter, {max: 1, time: 5000, errors: ['time']}).then(collected =>{
                        if(collected.first().content.toLowerCase() == 'y'){
                            Courses.destroy({where: {user_id: message.author.id, course_name: args[1]}});
                            Assignments.destroy({where: {user_id: message.author.id, course_name: args[1]}});
                            message.channel.send("`" + args[1] + "` was removed from your course list!");
                        } else 
                        if(collected.first().content.toLowerCase() == 'n'){
                            message.channel.send('`' + args[1] + '` was **NOT** removed');
                        } else {
                            message.channel.send('Invalid response. `' + args[1] + '` was **NOT** removed');
                        }
                    })
                    .catch(collected => {
                        message.channel.send('response took too long. `' + args[1] + '` was **NOT** removed');
                    });
                });
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
                if(dateToString(course_list[i].get('start_date')) == '00/00/0000'){
                    startstring = 'No date inputted';
                    endstring = 'No date inputted';
                } else {
                    startstring = dateToString(course_list[i].get('start_date'));
                    endstring = dateToString(course_list[i].get('end_date'));
                }

                for(i = 0; i < course_list.length; i++){
                    coursetxt += '**' + course_list[i].get('course_name') + '**\n' +
                        'Starts on: ' + startstring + '\n' + 
                        'Finished on: ' + endstring + '\n\n';
                }

                messageEmbed.setDescription(coursetxt);

                message.channel.send(messageEmbed);
                break;


            case 'setstart':
                //no date inputs
                if(args[1] == undefined || args[2] == undefined || args[3] != undefined){
                    message.channel.send('Proper use of the command is: `!AB course setstart [course] [start date]`');
                    break;
                }

                 //check if the course isn't in course list
                 if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + '` isn\'t in your course list!');
                    break;
                }

                //check if date inputs are in proper date formatting
                if(checkValidDate(args[2]) == false){
                    message.channel.send('`' + args[2] + '` is an invalid date. Make sure you input in `mm/dd/yyyy` format');
                    break;
                }
                
                (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('start_date', stringToDate(args[2])).save();
                message.channel.send('successfully updated the start date for `' + args[1] + '` to: `' + args[2] + '`');
                break;
                
            
            case 'setend':
                //no date inputs
                if(args[1] == undefined || args[2] == undefined || args[3] != undefined){
                    message.channel.send('Proper use of the command is: `!AB course setend [course] [end date]`');
                    break;
                }

                 //check if the course isn't in course list
                 if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + '` isn\'t in your course list!');
                    break;
                }

                //check if date inputs are in proper date formatting
                if(checkValidDate(args[2]) == false){
                    message.channel.send('`' + args[2] + '` is an invalid date. Make sure you input in `mm/dd/yyyy` format');
                    break;
                }
                
                (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('end_date', stringToDate(args[2])).save();
                message.channel.send('successfully updated the end date for `' + args[1] + '` to: `' + args[2] + '`');
                break;


            case 'setdates':
                //no date inputs
                if(args[1] == undefined || args[2] == undefined || args[3] == undefined){
                    message.channel.send('Proper use of the command is: `!AB course setdates [course] [start date] [end date]`');
                    break;
                }

                //check if the course is in course list
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + '` isn\'t in your course list!');
                    break;
                }

                //check if date inputs are in proper date formatting
                if(checkValidDate(args[2]) == false){
                    message.channel.send('`' + args[2] + '` is an invalid date. Make sure you input in `mm/dd/yyyy` format');
                    break;
                }

                if(checkValidDate(args[3]) == false){
                    message.channel.send('`' + args[2] + '` is an invalid date. Make sure you input in `mm/dd/yyyy` format');
                    break;
                }

                (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('start_date', stringToDate(args[2])).save();
                (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('end_date', stringToDate(args[3])).save();
                message.channel.send('successfully updated dates for `' + args[1] + '` to: `' + args[2] + '` - `' + args[3] + '`');
                break;
                

            case 'rename':
                //check for improper number of inputs
                if(args[1] == undefined || args[2] == undefined || args[3] != undefined){
                    message.channel.send('Proper use of the command is: `!AB course rename [old name] [new name]`');
                    break;
                }

                //check if the course is in course list
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + '` isn\'t in your course list!');
                    break;
                }

                //check if name conflicts
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[2]}}) != undefined){
                    message.channel.send('the name `' + args[2] + '` conflicts with another course!');
                    break;
                }

                //succesfully rename
                (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('course_name', args[2]).save();
                message.channel.send('Succesfully renamed `' + args[1] + '` to `' + args[2] + '`!');

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

function stringToDate(datestring){
    if(checkValidDate(datestring) == false){
        return;
    }

    var parts = datestring.toUpperCase().split("/");
    var dd = parseInt(parts[1], 10);
    var mm = parseInt(parts[0], 10);
    var yyyy = parseInt(parts[2], 10);

    // Check the range of the day
    return new Date(yyyy, mm, dd, 0, 0, 0, 0);
}

function dateToString(date){
    var yyyy = date.getFullYear().toString().padStart(4, '0');
    var mm = (date.getMonth() + 1).toString().padStart(2, '0');
    var dd = date.getDate().toString().padStart(2, '0');

    return mm + '/' + dd + '/' + yyyy
}