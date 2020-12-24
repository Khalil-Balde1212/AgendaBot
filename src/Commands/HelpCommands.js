module.exports ={
    name: 'help',
    description: 'Cause people are poopoo brained <:ANGERY:789058060462587914>',
    
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);
        menu = new Array();

        menu[0] = new discord.MessageEmbed;
        menu[0].setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'))
            .setTitle('**AgendaBot Commands**')
            .setDescription(
                'List of all available commands\n\n'+
                '1️⃣ Course commands\n\n' +
                '2️⃣ Work Commands\n\n' +
                '3️⃣ Favourite Colour commands'
            )

        menu[1] = new discord.MessageEmbed;
        menu[1].setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'))
        .setTitle('**AgendaBot Commands**')
        .setDescription(
            'List of all course commands\n\n'+
            '**!AB course list**\n' +
            'List all courses on your course list\n\n' + 
            '**!AB course add [course name]**\n' +
            'Adds a course without a start or end date\n\n' +
            '**!AB course add [course name] [start date] [end date]**\n' +
            'Adds course with a start and end date. Inputs in [mm/dd/yyy] form\n\n' +
            '**!AB course remove [course name]**\n' + 
            'Remove a course from your course list\n\n' + 
            '**!AB course setstart [course name] [start date]**\n' +
            'Set the start date for the course\n\n' + 
            '**!AB course setend [course name] [end date]**\n' +
            'Set the end date for the course\n\n' +
            '**!AB course setdates [course name] [start date] [end date]**\n' + 
            'Set the start and end dates for the named course\n\n' +
            '**!AB course rename [old course name] [new course name]**\n' + 
            'Rename a course you are taking'
        )

        menu[2] = new discord.MessageEmbed;
        menu[2].setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'))
        .setTitle('**AgendaBot Work Commands**')
        .setDescription(
            'List of all work commands\n\n'+
            '**!AB work list**\n' +
            'Show all your work \n\n' +
            '**!AB work list [course name]**\n' +
            'Show all your work for a specific course\n\n' +
            '**!AB work add [course name] [assignment name]**\n' +
            'Add an assignment to your agenda without a due date\n\n' +
            '**!AB work add [course name] [assignment name] [due date]**\n' +
            'Add an assignment to your agenda with a due date\n\n' + 
            '**!AB work remove [course name] [assignment title]**\n' +
            'Remove an assignment from your agenda'
        );

        menu[3] = new discord.MessageEmbed;
        menu[3].setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'))
        .setTitle('**AgendaBot Work Commands**')
        .setDescription(
            'List of all favourite colour commands\n\n'+
            '**!AB favcol**\n' +
            'Show your favourite colour \n\n' +
            '**!AB favcol @person**\n' +
            'See somebody elses favourite colour \n\n' +
            '**!AB favcol set [hex code]**\n' +
            'Set your new favourite colour \n\n'
        );

        menuReaction = ['⬅️', '1️⃣', '2️⃣', '3️⃣'];
        // '4️⃣', '5️⃣', '6️⃣' Just in case

        message.channel.send(menu[0]).then(embed => {
            for(let i of menuReaction){
                embed.react(i);
            };

            const collector = embed.createReactionCollector(
                (reaction, user) => (menuReaction.includes(reaction.emoji.name)),
                {time: 30000}
            )

            collector.on('collect', async (reaction, user) => {
                if(user.id == '784662811246723112') return;
                reaction.users.remove(user.id);

                for(let i in menuReaction){
                    if(reaction.emoji.name == menuReaction[i]){
                        embed.edit(menu[i]);
                    }
                }

            });

            collector.on('end', reaction =>{
                embed.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                embed.react('❌');
            });
        });
    }
}