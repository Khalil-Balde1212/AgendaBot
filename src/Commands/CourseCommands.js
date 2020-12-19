module.exports = {
    name: 'course',
    description: 'test',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);
        const Courses = require('../Models/Course')(sequelize, dataTypes);

        switch(args[0]){
            case "a":
            case "add": //TODO there is probably a smarter way to do this but my brain is unimaginably small
                if(args[1] != undefined){ //only adding course
                    if(args[2] != undefined){ //adding course start and end dates
                        if(args[3] == undefined) {message.channgel.send("Please input an end date!"); break;}
                        if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                            Courses.create({user_id: message.author.id, course_name: args[1], start_date: args[2], end_date: args[3]});
                            message.channel.send("Added `" + args[1] + "` to your course list!\nStarts on: `" + args[2] + "`\nEnds on: `" + args[3] + "`");
                        } else{
                            message.channel.send("You are already enrolled in `" + args[1] + "`!");
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
                //check if user takes that course
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + "` isn't on your course list!");
                    break;
                };

                if(args[2].charAt(2) != '/' || args[2].charAt(5) != '/') {
                    message.channel.send("Please put dates in the form mm/dd/yyyy");
                } else {
                    (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('start_date', args[2]).save();
                }

                break;
                
            case 'setend':
                //check if user takes that course
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + "` isn't on your course list!");
                    break;
                };

                break;

            case 'setdates':
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + "` isn't on your course list!");
                    break;
                };

                if((args[2].charAt(2) != '/' || args[2].charAt(5) != '/') && (args[3].charAt(2) != '/' || args[3].charAt(5) != '/')) {
                    message.channel.send("Please put dates in the form mm/dd/yyyy");
                } else {
                    (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('start_date', args[2]).save();
                    (await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}})).set('end_date', args[3]).save();
                }

                break;
                
            default:
                message.channel.send("You're a poopoo head that literally isn't an option"); //TODO add proper help command
                break;

        }
    }
}