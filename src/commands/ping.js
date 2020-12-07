module.exports = {
    name: 'ping',
    description: 'Oh you know',
    execute(message, args){
        message.channel.send("Pong!");
    }
}