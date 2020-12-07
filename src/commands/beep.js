module.exports = {
    name: 'beep',
    description: 'Oh you know',
    execute(message, args){
        message.channel.send("Boop!");
    }
}