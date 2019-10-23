const Discord = require('discord.js')
const errors = require('../utils/errors')

module.exports.run = async(bot, message, args)=>{
    if(!message.member.hasPermission("BAN_MEMBERS")) return errors.noPerms(message, "BAN_MEMBERS")
    if(args[0] =="help"){
        message.reply(".ban <user> <reason>")
        return
    }

    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return errors.cantfindUser(message.channel)
    if(bUser.id === bot.user.id){
        return message.channel.send("Opgekankerd, kanker homo")
    }
    let bReason = args.join(" ").slice(22)
    if(!bReason) return errors.noReason(message.channel)

    let banEmbed = new Discord.RichEmbed()
        .setDescription('Ban')
        .setColor("#bc0000")
        .addField('Gebruiker verbannen', `${bUser} with id ${bUser.id}`)
        .addField('Verbannen door', `<@${message.author.id}> with id ${message.author.id}`)
        .addField("Reason", bReason)

    message.guild.member(bUser).ban(bReason)
    message.channel.send(banEmbed)
}

module.exports.help ={
    name:'ban'
}