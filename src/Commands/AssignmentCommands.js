const Assignment = require('../Models/Assignment');

module.exports ={
    name: 'work',
    description: 'oh you know',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);
        const Courses = require('../Models/Course')(sequelize, dataTypes);
        const Assignments = require('../Models/Assignment')(sequelize, dataTypes);

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

            case 'view':
                const letters = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];
                target = message.mentions.users.first() || message.author;

                var pages = new Array;
                var page = new Array;
                
                if(args[1] == undefined){
                    all_work = (await Assignments.findAll({where: {user_id: target.id}}));

                    i = 0; j = 0;
                    while(all_work[j*10 + i]){
                        for(i = 0; i < 10; i++){
                            page[i] = all_work[j*10 + i];
                        }
                        pages[j] = page;
                        j++;
                    }
                    
                } else {
                    if(await Courses.findOne({where: {user_id: target.id, course_name: args[1]}}) == undefined){
                        message.channel.send('`' + args[1] + "` isn't on your course list!");
                        break;
                    };
                }

                const messageEmbed = new discord.MessageEmbed;
                messageEmbed.setColor((await Users.findOne({where: {user_id: target.id}})).get('fav_colour'));
                messageEmbed.setTitle(target.username + " agenda");

                agenda = '';
                for(i = 0; i < 10; i++){
                    if(page[i] == undefined) break;
                    if(page[i].get('complete') == false){
                        emote = letters[i];
                    } else {emote = '✅';}

                    agenda += emote + ' ' + page[i].get('course_name') + ': ' + page[i].get('title') + ' - ' + page[i].get('due_date') + '\n\n';
                }

                messageEmbed.setDescription(agenda);

                

                message.channel.send(messageEmbed).then(embed => {
                    embed.react('◀️');
                    embed.react('▶️');
                    for(let i in letters){
                        if(page[i] == undefined) break;
                        embed.react(letters[i]);
                    }
                    console.log('done reacting');
                    const collector = embed.createReactionCollector(
                        (reaction, user) => (['▶️', '◀️'].includes(reaction.emoji.name) || letters.includes(reaction.emoji.name)),
                        {time: 30000}
                    )

                    let currentIndex = 0;
                    collector.on('collect', async (reaction, user) => {
                        if(user.id != '784662811246723112'){
                            reaction.users.remove(user.id);

                            for(let i in letters){
                                if(reaction.emoji.name == letters[i]){
                                    
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