module.exports = {
    name: 'test',
    description: 'test',
    async execute(discord, message, args){
        const messageEmbed = new discord.MessageEmbed();

        messageEmbed.setTitle("test");
        messageEmbed.setDescription("epic");

        message.channel.send(messageEmbed);
    }
}