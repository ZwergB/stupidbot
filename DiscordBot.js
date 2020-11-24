const Discord = require('discord.js')
const fs = require('fs');

class DiscordBot {

    constructor(data = {token}) {
        this.token = data.token;
        this.client = new Discord.Client();
    }

    async startBot(testCycle) {
        this.client.once('ready', () => {
            console.log('Stupid Bot is online');
        });
    
        this.client.on('message', msg => {
            if (msg.content === 'ping') {
            msg.reply('Pong!');
            }

            let prefix = "§";

            if (msg.content.startsWith(prefix)) {
                switch(true) {
                    case msg.content.startsWith(prefix + "refresh"):
                        testCycle();
                        break;
                }
            }
        });

        this.client.login(this.token);

        return new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 2000);
        });
    }

    uploadFile(path, channelID) {

        if (fs.statSync(path).size < 800000) {
            const attachment = new Discord.MessageAttachment(path);
            this.client.channels.cache.get(channelID).send(attachment);
        } else {
            // Find some way to link to the file or create a dynamic link to the file
        }

    }
}

module.exports = DiscordBot;