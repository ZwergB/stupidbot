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

            let prefix = "$";
            const channelsFilePath = "config/channels.json";
            const channelsFile= JSON.parse(fs.readFileSync(channelsFilePath));
            const coursesFilePath = "config/courses.json"
            const coursesFile= JSON.parse(fs.readFileSync(coursesFilePath));
            let respondContent = "";

            if (msg.content.startsWith(prefix)) {
                this.botLog(msg);
                let content = msg.content.split(" "); //split in arguments
                switch(true) {
                    case msg.content.startsWith(prefix + "help") || msg.content == prefix:
                        this.sendMessage(msg.channel.id,
                            "§ping -> should send back a Pong! \n" +
                            "§refresh -> forces the bot to refresh his files \n" +
                            "Channel Commands: \n" +
                            "§listChannels/lsch -> lists all channels \n" +
                            "§addChannel/ach name id/this -> adds given channel \n" +
                            "§rmChannel/rmch id/this -> removes given channel \n" +
                            "File Commands: \n" +
                            "§resend filename -> sends the file again !work in progress! \n",
                            "List of commands:"
                        );
                        break; 
                    case msg.content.startsWith(prefix + "ping"):
                        msg.reply('Pong!');
                        break; 
                    case msg.content.startsWith(prefix + "refresh"):
                        console.log("Testcycle started manually!");
                        this.sendMessage(msg.channel.id, "Testcycle started manually!");
                        testCycle();
                        break;

                        //Channels
                    case msg.content.startsWith(prefix + "listChannels") || msg.content.startsWith(prefix + "lsch"):
                        respondContent = [[],[]];
                        for (const channel of channelsFile.channels) {
                            respondContent[0].push(channel.name);
                            respondContent[1].push(channel.id);
                        }
                        this.sendList(msg.channel.id, "List of all Channels", respondContent)
                        break;
                    case msg.content.startsWith(prefix + "addChannel") || msg.content.startsWith(prefix + "ach"):
                            //Get the Channel ID if it should be the one the message was sent in.
                            if (content[2] == "this") {
                                content[2] = msg.channel.id;
                            }
                            
                            //Adding the Channel to JSON File
                            channelsFile['channels'].push({"name":content[1],"id":content[2]});
                            fs.writeFileSync(channelsFilePath, JSON.stringify(channelsFile, false, 2));

                            this.sendEditNote(msg.channel.id, "Added Channel " + content[2] + " as " + content[1], true);
                            console.log("Added Channel " + content[2] + " as " + content[1]);
                        break;
                    case msg.content.startsWith(prefix + "rmChannel") || msg.content.startsWith(prefix + "rmch"):
                            //Get the Channel ID if it should be the one the message was sent in.
                            if (content[1] == "this") {
                                content[1] = msg.channel.id;
                            }
                            
                            //Searching and Removing the Channel in the JSON File
                            for (let i = 0; i < channelsFile.channels.length; i++) {
                                if(channelsFile.channels[i].id == content[1]) {
                                    content.push(channelsFile.channels[i].name);
                                    channelsFile.channels.splice(i, 1);
                                    break;
                                }
                            }
                            fs.writeFileSync(channelsFilePath, JSON.stringify(channelsFile, false, 2));

                            this.sendEditNote(msg.channel.id, "Removed Channel " + content[1] + " as " + content[2], false);
                            console.log("Removed Channel " + content[1] + " as " + content[2]);
                        break;

                        //Courses
                        case msg.content.startsWith(prefix + "listCourses") || msg.content.startsWith(prefix + "lsco"):
                            respondContent = [[],[],[]];
                            for (const course of coursesFile.courses) {
                                respondContent[0].push(course.name);
                                respondContent[1].push(course.id);
                                respondContent[2].push(course.prefix);
                            }
                            this.sendList(msg.channel.id, "List of all Courses", respondContent)
                            break;

                        //Files
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

    sendEditNote(channelID, content, added) {
        const embed = new Discord.MessageEmbed()
            .setDescription(content)
            .setColor("#ff0000");

        if(added) embed.setColor("#00ff00");

        this.client.channels.cache.get(channelID).send(embed);
    }

    sendList(channelID, title, content) {
        const embed = new Discord.MessageEmbed()
            .setColor('#555555')
            .setTitle(title)
            .addField('Name', content[0], true)
            .addField('ID', content[1], true);

        if(content.length == 3) embed.addField('Prefix', content[2], true);

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

            //this.sendMessage(url, channelID);
        }

    }

    sendMessage(channelID, content,  title = "") {
        const embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(content)
            .setColor("#555555");

        this.client.channels.cache.get(channelID).send(embed);
    }

    sendAnnouncement(channelID, title, content) {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(content);

        this.client.channels.cache.get(channelID).send(embed);
    }
}

module.exports = DiscordBot;