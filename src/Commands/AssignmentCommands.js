const Assignment = require('../Models/Assignment');

module.exports ={
    name: 'work',
    description: 'oh you know',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);
        const Courses = require('../Models/Course')(sequelize, dataTypes);
        const Assignments = require('../Models/Assignment')(sequelize, dataTypes);

        const pageSize = 5;

        switch(args[0]){
            case 'add':
                //check for misused command
                if(args[1] == undefined){
                    message.channel.send('Proper use of the command is: `!AB work add [course name] [start date] [end date]`');
                    break;
                }

                if(args[2] != undefined && args[3] == undefined){
                    message.channel.send('Proper use of the command is: `!AB work add [course name] [start date] [end date]`');
                    break;
                }

                //check if course is in course list
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + "` isn't on your course list!");
                    break;
                };


                if(args[3] == undefined){
                    Assignments.create({user_id: message.author.id, course_name: args[1], title: args[2]});
                    message.channel.send("Added `" + args[2] + "` to `" + args[1] + "`");
                } else {
                    if(args[3].charAt(2) != '/' || args[3].charAt(5) != '/') {
                        message.channel.send("Please put dates in the form mm/dd/yyyy hh:mm");
                    } else {
                        Assignments.create({user_id: message.author.id, course_name: args[1], title: args[2], due_date: args[3]});
                        message.channel.send("Added `" + args[2] + "` to `" + args[1] + "`");
                    }
                }
                break;

            case 'remove':
                break;


            //agenda view
            case 'list':
                const letters = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];
                target = message.mentions.users.first() || message.author;

                var all_work = new Array;
                var menu = new Array;
                
                //display work for all courses
                if(args[1] == undefined){
                    all_work = (await Assignments.findAll({where: {user_id: target.id}}));
                } else {
                    if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                        message.channel.send('`' + args[1] + "` isn't on your course list!");
                        break;
                    };

                    all_work = (await Assignments.findAll({where: {user_id: target.id, course_name: args[1]}}));
                }

                //assign to menu pages
                i = 0; j = 0;
                while(all_work[j*pageSize + i] != undefined){
                    agenda = '';
                    //create page
                    for(k = 0; k < pageSize; k++){
                        //check if work doesn't exist
                        if(all_work[j*pageSize + k] == undefined) break;

                        //set the letters to be appropriate
                        if(all_work[j*pageSize + k].get('complete') == false){
                            emote = letters[k];
                        } else {
                            emote = '✅';
                        };
                        agenda += emote + ' ' + all_work[j*pageSize + k].get('course_name') + ': ' + all_work[j*pageSize + k].get('title') + ' - ' + all_work[j*pageSize + k].get('due_date') + '\n\n';
                    }

                    //add page to the menu
                    menu[j] = new discord.MessageEmbed;
                    menu[j].setTitle(target.username + '\'s agenda')
                        .setColor((await Users.findOne({where: {user_id: target.id}})).get('fav_colour'))
                        .setDescription(agenda)

                    j++;
                }

                //check if the impossible has happened
                if(menu[0] == undefined){
                    menu[0] = new discord.MessageEmbed;
                    menu[0].setTitle(target.username + '\'s agenda')
                        .setColor((await Users.findOne({where: {user_id: target.id}})).get('fav_colour'))
                        .setDescription('Impossible. There is no work here!');
                };
                
                menu[0].setFooter('page ' + 1 + ' of ' + eval(menu.length));

                var currentIndex = 0;

                message.channel.send(menu[currentIndex]).then(embed => {
                    embed.react('◀️')
                        .then(() => embed.react('▶️'))
                        .then(() => {
                            for(let i = 0; i < pageSize; i++){
                                if(all_work[eval(currentIndex*pageSize + i)] == undefined) break;
                                
                                embed.react(letters[i]);
                            }
                        });

                    const collector = embed.createReactionCollector(
                        (reaction, user) => (['▶️', '◀️'].includes(reaction.emoji.name) || letters.includes(reaction.emoji.name)),
                        {time: 300000}
                    )

                    collector.on('collect', async (reaction, user) => {
                        if(user.id != '784662811246723112'){
                            reaction.users.remove(user.id);

                            if(reaction.emoji.name == '◀️'){
                                if(currentIndex == 0){
                                    currentIndex = menu.length - 1
                                } else {currentIndex --};
                                
                                menu[currentIndex].setFooter('page ' + eval(currentIndex + 1) + ' of ' + eval(menu.length));
                                embed.edit(menu[currentIndex]);
                            }

                            if(reaction.emoji.name == '▶️'){
                                if(currentIndex >= menu.length - 1){
                                    currentIndex = 0;
                                } else {currentIndex ++};
                                
                                menu[currentIndex].setFooter('page ' + eval(currentIndex + 1) + ' of ' + eval(menu.length));
                                embed.edit(menu[currentIndex]);
                            }

                            for(let i = 0; i < pageSize; i++){
                                if(reaction.emoji.name == letters[i] && all_work[eval(currentIndex * pageSize + i)] != undefined && user.id == target.id){
                                    //set completion status
                                    if(all_work[eval(currentIndex * pageSize + i)].get('complete') == false){
                                        all_work[eval(currentIndex * pageSize + i)].set('complete', true).save();
                                        console.log('test');
                                    } else {
                                        all_work[eval(currentIndex * pageSize + i)].set('complete', false).save();
                                    }

                                    //update embedded message
                                    agenda = '';
                                    for(k = 0; k < pageSize; k++){
                                        //check if work doesn't exist
                                        if(all_work[currentIndex*pageSize + k] == undefined) break;
                
                                        //set the letters to be appropriate
                                        if(all_work[currentIndex*pageSize + k].get('complete') == false){
                                            emote = letters[k];
                                        } else {
                                            emote = '✅';
                                        };
                                        agenda += emote + ' ' + all_work[currentIndex*pageSize + k].get('course_name') + ': ' + all_work[currentIndex*pageSize + k].get('title') + ' - ' + all_work[currentIndex*pageSize + k].get('due_date') + '\n\n';
                                    }

                                    menu[currentIndex].setDescription(agenda);
                                    embed.edit(menu[currentIndex]);
                                }
                            }
                        }
                    })

                    collector.on('end', reaction =>{
                        embed.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        embed.react('❌');
                    })
                })


                break;

            case 'test':
                console.log(checkValidDate(args[1]));
                break;

            default: 
                message.channel.send("henlo");
                break;
        }
    }
}

//mm/dd/yyyy hh:mm
function checkValidDate(dateString){
    var parts = dateString.toUpperCase().split(" ");
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(parts[0])){
        console.log('date invalid')
        return false;
    }
    
    if(/^\d{1,2}:\d{2}\s([ap]m)?$/.test(parts[1]) ||/^\d{1,2}:\d{2}([ap]m)?$/.test(parts[1])){
        console.log('time invalid')
        return false;
    }

    // Parse the date parts to integers
    parts = parts[0].split("/").concat(parts[1].split(":"));
    var minute = parseInt(parts[4].substring(0, 2), 10);
    var hour = parseInt(parts[3], 10);
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
    return (day > 0 && day <= monthLength[month - 1]) && (hour > 0 && hour <= 12) && (minute > 0 && minute < 60);
}