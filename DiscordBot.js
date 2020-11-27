const Discord           = require('discord.js');
const fs                = require('fs');
const CommandFunctions  = require('./CommandFunctions');

class DiscordBot {

    constructor(data = {token}, testCycle) {
        this.token = data.token;
        this.client = new Discord.Client();
        this.commandsFile = JSON.parse(fs.readFileSync("./config/commands.json"));
        this.cf = new CommandFunctions(this.client, this.sendMessage, this.sendList, testCycle);
    }

    async startBot() {
        this.client.once('ready', () => {
            console.log('Stupid Bot is online');
        });
    
        this.client.on('message', msg => {
            if (msg.content.startsWith(this.commandsFile.prefix)) {

                this.botLog(msg);

                for (const command of this.commandsFile.commands) {
                    if ((msg.content.startsWith(this.commandsFile.prefix + command.command) || msg.content.startsWith(this.commandsFile.prefix + command.shortcut)) && command.function != "") {
                        this.cf[command.function](msg);
                        break;
                    }
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

    botLog(msg) {
        console.log("Command by " + msg.author.username + " (" + msg.author + "): " + msg.content);
    }

    sendList(channelID, title, header, content, color = "#555555") {
        const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(title);
            
        for (let i = 0; i < header.length; i++) {
            embed.addField(header[i], content[i], true);
        }

        this.client.channels.cache.get(channelID).send(embed);
    }

    uploadFile(path, channelID, text = "") {

        if (fs.statSync(path).size < 800000) {
            const attachment = new Discord.MessageAttachment(path);
            this.client.channels.cache.get(channelID).send(text, attachment);
        } else {
            // Find some way to link to the file or create a dynamic link to the file
            //https://elearning.uni-oldenburg.de/sendfile.php?force_download=1&type=0&file_id=c44f5355cca9068aad60edb9856009fd&file_name=ds-2020-ha06.pdf

            //let url = "https://elearning.uni-oldenburg.de/sendfile.php?force_download=1&type=0&file_id=" + "&file_name="; //hashfile?

            //this.sendMessage(channelID, undefined, url);
        }

    }

    sendMessage(channelID,  title = "", content, colorCode = "#555555") {
        const embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(content)
            .setColor(colorCode);

        this.client.channels.cache.get(channelID).send(embed);
    }
}

module.exports = DiscordBot;