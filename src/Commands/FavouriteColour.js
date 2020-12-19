module.exports = {
    name: 'favcol',
    description: 'test',
    async execute(discord, message, args, sequelize, dataTypes){
        const Users = require('../Models/User')(sequelize, dataTypes);

        switch(args[0]){
            case 'set':
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
                try{//try finding user
                    fav = (await Users.findOne({where: {user_id: target.id}})).get('fav_colour');
                } catch { //user doesn't exist
                    Users.create({user_id: target.id});
                    fav = (await Users.findOne({where: {user_id: target.id}})).get('fav_colour');
                }
                message.channel.send(target.toString() + "'s favourite colour is: `" + fav + "`");
                break;
        }
    }
}