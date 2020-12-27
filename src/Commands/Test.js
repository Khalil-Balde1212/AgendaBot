module.exports = {
    name: 'test',
    description: 'test',
    async execute(discord, message, args, sequelize, dataTypes){
        const messageEmbed = new discord.MessageEmbed();
        const Users = require('../Models/User')(sequelize, dataTypes);

        //create embeded message
        try{
            messageEmbed.setColor((await Users.findOne({where: {user_id: message.author.id}})).get('fav_colour'));
        } catch{
            messageEmbed.setColor('#FF6A39');
        }
            messageEmbed.setTitle("test");
            messageEmbed.setDescription("epic");

            message.channel.send(messageEmbed);
    }
}