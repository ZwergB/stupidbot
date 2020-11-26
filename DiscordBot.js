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

            const channelsFilePath  = "config/channels.json";
            const channelsFile      = JSON.parse(fs.readFileSync(channelsFilePath));
            const coursesFilePath   = "config/courses.json"
            const coursesFile       = JSON.parse(fs.readFileSync(coursesFilePath));

            let respondContent = "";
            
            const addColor      = "#00ff00";
            const deleteColor   = "#ff0000";
            const messageColor  = "#555555";

            if (msg.content.startsWith(prefix)) {
                this.botLog(msg);
                let args = msg.content.split(" "); //split in arguments
                switch(true) {
                    case msg.content == prefix + "help" || msg.content == prefix:
                        this.sendList(msg.channel.id, "List of commands:", ["Command", "Description", "Shortcut"], [
                            [
                                ["§help"], 
                                ["§ping"], 
                                ["§refresh"], 
                                ["§listChannels"], 
                                ["§addChannel"], 
                                ["§rmChannel"], 
                                ["§listCourses"], 
                                ["§resend"]
                            ],
                            [
                                ["helps you"], 
                                ["should send back a Pong!"], 
                                ["forces the bot to refresh his files"], 
                                ["lists all channels"], 
                                ["adds given channel"], 
                                ["removes given channel"], 
                                ["lists all courses"], 
                                ["sends the file again !work in progress!"]
                            ],
                            [
                                ["§"], 
                                [""], 
                                [""], 
                                ["§lsch"], 
                                ["§ach"], 
                                ["§rmch"], 
                                ["§lsco"], 
                                [""]
                            ]],
                            /*"§ping -> should send back a Pong! \n" +
                            "§refresh -> forces the bot to refresh his files \n" +
                            "Channel Commands: \n" +
                            "§listChannels/lsch -> lists all channels \n" +
                            "§addChannel/ach name id/this -> adds given channel \n" +
                            "§rmChannel/rmch id/this -> removes given channel \n" +
                            "File Commands: \n" +
                            "§resend filename -> sends the file again !work in progress! \n",*/
                            messageColor
                        );
                        break; 
                    case msg.content == prefix + "ping":
                        msg.reply('Pong!');
                        break; 
                    case msg.content == prefix + "refresh":
                        console.log("Testcycle started manually!");
                        this.sendMessage(msg.channel.id, undefined, "Testcycle started manually!", messageColor);
                        testCycle();
                        break;

                        //Channels
                    case msg.content.startsWith(prefix + "listChannels") || msg.content.startsWith(prefix + "lsch"):
                        respondContent = [[],[]];
                        for (const channel of channelsFile.channels) {
                            respondContent[0].push(channel.name);
                            respondContent[1].push(channel.id);
                        }
                        this.sendList(msg.channel.id, "List of all Channels", ["Name", "ID"], respondContent)
                        break;
                    case msg.content.startsWith(prefix + "addChannel ") || msg.content.startsWith(prefix + "ach "):
                        //Get the Channel ID if it should be the one the message was sent in.
                        if (args[2] == "this") {
                            args[2] = msg.channel.id;
                        }
                        
                        //Adding the Channel to JSON File
                        channelsFile['channels'].push({"name":args[1],"id":args[2]});
                        fs.writeFileSync(channelsFilePath, JSON.stringify(channelsFile, false, 2));

                        this.sendMessage(msg.channel.id, undefined, "Added Channel " + args[2] + " as " + args[1], addColor);
                        console.log("Added Channel " + args[2] + " as " + args[1]);
                        break;
                    case msg.content.startsWith(prefix + "rmChannel ") || msg.content.startsWith(prefix + "rmch "):
                        //Get the Channel ID if it should be the one the message was sent in.
                        if (args[1] == "this") {
                            args[1] = msg.channel.id;
                        }
                        
                        //Searching and Removing the Channel in the JSON File
                        for (let i = 0; i < channelsFile.channels.length; i++) {
                            if(channelsFile.channels[i].id == args[1]) {
                                args.push(channelsFile.channels[i].name);
                                channelsFile.channels.splice(i, 1);
                                break;
                            }
                        }
                        fs.writeFileSync(channelsFilePath, JSON.stringify(channelsFile, false, 2));

                        this.sendMessage(msg.channel.id, undefined, "Removed Channel " + args[1] + " as " + args[2], deleteColor);
                        console.log("Removed Channel " + args[1] + " as " + args[2]);
                        break;

                        //Courses
                    case msg.content.startsWith(prefix + "listCourses") || msg.content.startsWith(prefix + "lsco"):
                        respondContent = [[],[],[]];
                        for (const course of coursesFile.courses) {
                            respondContent[0].push(course.name);
                            respondContent[1].push(course.id);
                            respondContent[2].push(course.prefix);
                        }
                        this.sendList(msg.channel.id, "List of all Courses", ["Name", "ID", "Prefix"], respondContent)
                        break;

                    case msg.content.startsWith(prefix + "list ") || msg.content.startsWith(prefix + "ls "):
                        respondContent = [["Channel", "Course", "Prefix"],[]];
                        const course = coursesFile.courses.find((course) => course.name == args[1]);
                        const channel = channelsFile.channels.find((channel) => channel.name == args[1]);
                        
                        respondContent[1][0] = channel.id;
                        respondContent[1][1] = course.id;
                        respondContent[1][2] = course.prefix;

                        this.sendList(msg.channel.id, args[1], ["Element", "Value"], respondContent)
                        break;

                        //Files
                    case msg.content.startsWith(prefix + "resend ") && false: //WORK IN PROGRESS remove false to enable
                        const hashFile = JSON.parse(fs.readFileSync("hashFile.json"));
                        for (const hash of hashFile.hashes) {
                            if (hash['path'].endsWith(args[1])) {
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

            //this.sendMessage(url, channelID);
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