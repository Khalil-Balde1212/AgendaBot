module.exports = {
    name: 'favcol',
    description: 'test',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);

        switch(args[0]){
            case 'set':
                var parse = /[0-9A-Fa-f]{6}/g;

                if(parse.test(args[1]) == false){
                    message.channel.send("Please give your favourite colour as a hexadecimal code!");
                    break;
                }


                if(args[1] == null){
                    message.channel.send("Proper use of the command is `!AB favcolour set [hexcode]`");
                } else {
                    user = (await Users.findOne({where: {user_id: message.author.id}}));
                    message.channel.send("Set your favourite colour to `" + args[1] + "`");
                    user.set('fav_colour', args[1]);
                    user.save();
                }
                break;


            //by default the program will just return the colour
            default:
                target = message.mentions.users.first() || message.author;
                //try finding user
                fav = (await Users.findOne({where: {user_id: target.id}})).get('fav_colour');
                message.channel.send(target.toString() + "'s favourite colour is: `" + fav + "`");
                break;
        }
    }
}