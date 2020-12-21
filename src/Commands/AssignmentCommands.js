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
                if(await Courses.findOne({where: {user_id: message.author.id, course_name: args[1]}}) == undefined){
                    message.channel.send('`' + args[1] + "` isn't on your course list!");
                    break;
                };

                if(args[3] == undefined){
                    Assignments.create({user_id: message.author.id, course_name: args[1], title: args[2]});
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
            case 'view':
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
                    // console.log("this is epic");
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
                                if(reaction.emoji.name == letters[i] && all_work[eval(currentIndex * pageSize + i)] != undefined && user.id == message.author.id){
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

            default: 
                message.channel.send("henlo");
                break;
        }
    }
}