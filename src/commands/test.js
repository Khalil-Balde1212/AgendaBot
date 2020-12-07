module.exports = {
    name: 'test',
    description: 'Testing :o',
    execute(message, args){
        const Discord = require('discord.js')
        const embed = new Discord.MessageEmbed();
        embed.setColor('#cc99ff');
        embed.setTitle(args[0]);
        
        var emojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴'];
        var text = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
        for(var j = 1; j < args.length; j++){
            text[j*2-1] = emojis[j-1] + " " + args[j];
        };

        embed.setDescription(text);

        message.channel.send(embed).then(sentEmbed => {
            for(var i = 0; i < parseInt(args.length-1); i++){
                sentEmbed.react(emojis[i]);
            }
        });;
    }
}