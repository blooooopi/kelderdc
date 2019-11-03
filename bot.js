const Discord = require("discord.js")
const fs = require("fs")
const bot = new Discord.Client()
const botconfig = require('./botconfig.json')
let cooldown = new Set();
let cdseconds = 5;
let prefix = botconfig.prefix
const ytdl = require('ytdl-core')
const queue = new Map()
var servers = {}
const tokenfile = require('./token.json')
bot.commands = new Discord.Collection()
fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        console.log("Couldn't find commands.")
        return
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`)
        console.log(`${f} loaded!`)
        bot.commands.set(props.help.name, props)
    })
})


bot.on('ready', async () => {
    console.log(`${bot.user.username} is online on ${bot.guilds.size} servers`)
    bot.user.setActivity("Over de Kelder. || V1.0", {
        type: "WATCHING"
    })
})

bot.on('error', console.error);

bot.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return
    let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"))
    if (!prefixes[message.guild.id]) {
        prefixes[message.guild.id] = {
            prefixes: botconfig.prefix
        }
    }
    let prefix = prefixes[message.guild.id].prefixes
    if (!message.content.startsWith(prefix)) return
    if (cooldown.has(message.author.id)) {
        message.delete()
        return message.reply("Je moet 5 seconden wachten voordat ik weer zin heb")
    }

    if (!message.member.hasPermission("ADMINISTRATOR")) {
        cooldown.add(message.author.id)
    }


    let messageArray = message.content.split(" ")
    let cmd = messageArray[0]
    let args = messageArray.slice(1)

    let commandfile = bot.commands.get(cmd.slice(prefix.length))
    if (commandfile) commandfile.run(bot, message, args)

    setTimeout(() => {
        cooldown.delete(message.author.id)
    }, cdseconds * 1000)


})


bot.on('guildMemberAdd', (member, guild) => {
    const channel = member.guild.channels.find(ch => ch.name == 'nieuwelingen');
    if (!channel) return;
    channel.send(`Hey ${member}, welkom in **De Kelder** 😳`);
})


bot.on('guildMemberRemove', (member, guild) => {
    const channel = member.guild.channels.find(ch => ch.name === 'nieuwelingen');
    if (!channel) return;
    channel.send(`Oei, daar gaat **${member}** 😔`);
})

bot.on("message", message => {
    const channelV = bot.channels.find(ch => ch.name === 'verificatie')
    if (message.channel == (channelV)) {
        message.delete(1000)
    }
})	

bot.on('message', message =>{
    let args = message.content.substring(botconfig.prefix.length).split(" ")

    switch(args[0]){
        case 'play':

            function play(connection, message){
                var server = servers[message.guild.id]
                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: 'audioonly'}))

                server.queue.shift()

                server.dispatcher.on("end", function(){
                    if(server.queue[0]){
                        play(connection, message)
                    }else{
                        connection.disconnect()
                    }
                })
            }

            if(!args[1]){
                message.channel.send('Wat wil je dat ik afspeel?')
                return
            }

            if(!message.member.voiceChannel){
                message.channel.send('Je moet in een voice kanaal zitten.')
                return
            }

            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id]

            server.queue.push(args[1])

            if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message)
            })
        break


        case 'skip':
            var server = servers[message.guild.id]
                if(server.dispatcher) server.dispatcher.end()
                message.channel.send('Huidig liedje skippen')
        break
        
        case 'stop':
            var server = servers[message.guild.id]
            if(message.guild.voiceConnection){
                for(var i = server.queue.length -1; i>=0; i--){
                    server.queue.splice(i, 1)
                }

                server.dispatcher.end()
                message.channel.send('Queue is geeindigt')
                console.log('stopped the queue')
            }

            if(message.guild.connection) message.guild.voiceConnection.disconnect()
        break

    }
})

bot.on('message', message=>{
    if(message.content === botconfig.prefix + 'clear'){
        if(message.member.hasPermission("MANAGE_MESSAGES")){
            message.channel.fetchMessages()
            .then(function(list){
                message.channel.bulkDelete(list)
            },function(err){message.channel.send('Niet gelukt')})
        }
    }
})

//color

bot.on('message', message=>{
    let args = message.content.substring(botconfig.prefix.length).split(" ")
        switch(args[0]){
            case 'Groen'.toLowerCase():
                let groen = message.guild.roles.find(r => r.name === "Groen")
                const memberG = message.member
                memberG.addRole(groen).catch(console.error)
            break
            case 'Paars'.toLowerCase():
                let paars = message.guild.roles.find(r => r.name ===  'Paars')
                const memberP = message.member
                memberP.addRole(paars).catch(console.error)
            break
            case 'Roze'.toLowerCase():
                let roze = message.guild.roles.find(r => r.name === 'Roze')
                const memberR = message.member
                memberR.addRole(roze).catch(console.error)
            break
            case 'Blauw'.toLowerCase(): 
                let blauw = message.guild.roles.find(r => r.name==="Blauw")
                const memberB = message.member
                memberB.addRole(blauw).catch(console.error)
            break
            case 'Rood'.toLowerCase():
                let rood = message.guild.roles.find(r => r.name === 'Rood')
                const memberRO = message.member
                memberRO.addRole(rood).catch(console.error)
            break
            case 'Zwart'.toLowerCase():
                let zwart = message.guild.roles.find(r => r.name === 'Zwart')
                const memberZ = message.member
                memberZ.addRole(zwart).catch(console.error)
        }
})



//remove color

bot.on('message', message=>{
    let args = message.content.substring(botconfig.prefix.length).split(" ")
    let member = message.member
        switch(args[0]){
            case 'Groen'.toLowerCase(): 
                if(member.roles.find(r=> r.name ==='Groen')){
                    let groen = message.guild.roles.find(r => r.name === 'Groen')
                    const memberG = message.member
                    memberG.removeRole(groen).catch(console.error)
                }else{
                    return 
                }
            break
            case 'Paars'.toLowerCase(): 
                if(member.roles.find(r=> r.name ==='Paars')){
                    let paars = message.guild.roles.find(r => r.name === 'Paars')
                    const memberP = message.member
                    memberP.removeRole(paars).catch(console.error)
                }else{
                    return 
                }
            break
            case 'Roze'.toLowerCase(): 
                if(member.roles.find(r=> r.name ==='Roze')){
                    let roze = message.guild.roles.find(r => r.name === 'Roze')
                    const memberR = message.member
                    memberR.removeRole(roze).catch(console.error)
                }else{
                    return 
                }
            break
            case 'Blauw'.toLowerCase(): 
                if(member.roles.find(r=> r.name ==='Blauw')){
                    let blauw = message.guild.roles.find(r => r.name === 'Blauw')
                    const memberB = message.member
                    memberB.removeRole(blauw).catch(console.error)
                }else{
                    return 
                }
            case 'Rood'.toLowerCase(): 
                if(member.roles.find(r=> r.name ==='Rood')){
                    let rood = message.guild.roles.find(r => r.name === 'Rood')
                    const memberRO = message.member
                    memberRO.removeRole(rood).catch(console.error)
                }else{
                    return 
                }
            case 'Zwart'.toLowerCase():
                if(member.roles.find(r => r.name === 'Zwart')){
                    let zwart = message.guild.roles.find(r => r.name === 'Zwart')
                    const memberZ = message.member
                    memberZ.removeRole(zwart).catch(console.error)
                }
            break
        }
})

bot.on('message', message=>{
    const channelK = bot.channels.find(ch => ch.name === 'kleurtjes')
    if(message.author.bot) return
    if(message.channel === (channelK)){
        message.delete(5000)
    }else{
        return 
    }
})



bot.login(tokenfile.token || process.env.TOKEN)