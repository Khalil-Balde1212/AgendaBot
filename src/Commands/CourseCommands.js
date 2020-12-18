module.exports = {
    name: 'favcol',
    description: 'test',
    async execute(discord, message, args, sequelize, dataTypes){
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
    }
}