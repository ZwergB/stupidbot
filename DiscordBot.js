const Discord = require('discord.js')

class DiscordBot {

    constructor(data = {token}) {
        this.token = data.token;
        this.client = new Discord.Client();
    }

    async startBot() {
        this.client.once('ready', () => {
            console.log('Stupid Bot is online');
        });
    
        this.client.on('message', msg => {
            if (msg.content === 'ping') {
            msg.reply('Pong!');
            }
        });

        this.client.login(this.token);

        return new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 2000);
        });
    }

    async uploadFile(path, channelID) {
        const attachment = new Discord.MessageAttachment(path);
        this.client.channels.cache.get(channelID).send(attachment);
    }

}

module.exports = DiscordBot;