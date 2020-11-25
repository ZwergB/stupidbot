const Discord = require('discord.js');
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

            let prefix = "§";
            let channelFilePath = "config/discordchannels.json";

            if (msg.content.startsWith(prefix)) {
                this.botLog(msg);
                let content = msg.content.split(" "); //split in arguments
                switch(true) {
                    case msg.content.startsWith(prefix + "help"):
                        msg.reply("List of commands: \n" +
                            "§ping -> should send back a Pong! \n" +
                            "§refresh -> forces the bot to refresh his files \n" +
                            "§addChannel name id/this -> adds a channel to send into \n" +
                            "§resend filename -> sends the file again !work in progress!"
                        );
                        break; 
                    case msg.content.startsWith(prefix + "ping"):
                        msg.reply('Pong!');
                        break; 
                    case msg.content.startsWith(prefix + "refresh"):
                        console.log("Testcycle started manually!");
                        msg.reply("Testcycle started manually!");
                        testCycle();
                        break;
                    case msg.content.startsWith(prefix + "addChannel"):
                        if (content.length == 3) {
                            //Get the Channel ID if it should be the one the message was sent in.
                            if (content[2] == "this") {
                                content[2] = msg.channel.id;
                            }
                            
                            //Adding the Channel to JSON File
                            const channelFile = JSON.parse(fs.readFileSync(channelFilePath));
                            channelFile['channels'].push({"name":content[1],"id":content[2]});
                            fs.writeFileSync(channelFilePath, JSON.stringify(channelFile, false, 2));

                            msg.reply("Added Channel " + content[2] + " as " + content[1]);
                            console.log("Added Channel " + content[2] + " as " + content[1]);
                        }
                        break;
                    case msg.content.startsWith(prefix + "resend") && false: //WORK IN PROGRESS remove false to enable
                        const hashFile = JSON.parse(fs.readFileSync("hashFile.json"));
                        for (const hash of hashFile.hashes) {
                            if (hash['path'].endsWith(content[1])) {
                                this.uploadFile(hash['path'], msg.channel.id);
                            }
                            msg.delete();
                        }
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

    botLog(msg) {
        console.log("Command by " + msg.author.username + " (" + msg.author + "): " + msg.content);
    }

    uploadFile(path, channelID, text = "") {

        if (fs.statSync(path).size < 800000) {
            const attachment = new Discord.MessageAttachment(path);
            this.client.channels.cache.get(channelID).send(text, attachment);
        } else {
            // Find some way to link to the file or create a dynamic link to the file
            //https://elearning.uni-oldenburg.de/sendfile.php?force_download=1&type=0&file_id=c44f5355cca9068aad60edb9856009fd&file_name=ds-2020-ha06.pdf

            //let url = "https://elearning.uni-oldenburg.de/sendfile.php?force_download=1&type=0&file_id=" + "&file_name="; //hashfile?

            //this.sendMessage(url, channelID);
        }

    }

    sendMessage(content, channelID) {
        this.client.channels.cache.get(channelID).send(content);
    }

    sendAnnouncement(title, content) {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(content);

        this.client.channels.cache.get(channelID).send(embed);
    }
}

module.exports = DiscordBot;