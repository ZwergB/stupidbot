const fs = require('fs');

class CommandFunctions { 

    constructor(client, sendMessage, sendList, testCycle) {
        this.client = client;

        this.sendMessage = sendMessage;
        this.sendList = sendList;
        this.testCycle = testCycle;

        this.addColor      = "#00ff00";
        this.deleteColor   = "#ff0000";
        this.messageColor  = "#555555";
    }

    help(msg) {
        const respondContent = [[], [], []];
        const commandsFile = JSON.parse(fs.readFileSync("./config/commands.json"));

        //Rearrange Array
        for (const command of commandsFile.commands) {
            if (command.function != "") {
                respondContent[0].push(commandsFile.prefix + command.command + " " + command.arguments);
                respondContent[1].push(command.description);
                if (command.shortcut != "") respondContent[2].push(commandsFile.prefix + command.shortcut);
                else respondContent[2].push(" ");
            }
        }

        this.sendList(msg.channel.id, "List of all ", ["Command", "Description", "Shortcut"], respondContent);
    }

    ping(msg) {
        msg.reply('Pong!');
    }

    refresh(msg) {
        console.log("Testcycle started manually!");
        this.sendMessage(msg.channel.id, undefined, "Testcycle started manually!", this.messageColor);
        this.testCycle();
    }

    listChannels(msg) {
        const respondContent = [[], []];
        const channelsFile = JSON.parse(fs.readFileSync("config/channels.json"));
        //Rearrange array to fit the Discord Fields
        for (const channel of channelsFile.channels) {
            respondContent[0].push(channel.name);
            respondContent[1].push(channel.id);
        }
        this.sendList(msg.channel.id, "List of all Channels", ["Name", "ID"], respondContent);
    }

    listCourses(msg) {
        const respondContent = [[], [], []];
        const coursesFile = JSON.parse(fs.readFileSync("config/courses.json"));
        //Rearrange array to fit the Discord Fields
        for (const course of coursesFile.courses) {
            respondContent[0].push(course.name);
            respondContent[1].push(course.id);
            respondContent[2].push(course.prefix);
        }
        this.sendList(msg.channel.id, "List of all Courses", ["Name", "ID", "Prefix"], respondContent);
    }

    list(msg) {
        const args = msg.content.split(" ");
        if (args[1]) {
            args[1] = args[1].toUpperCase();
            const respondContent = [["Channel", "Course", "Prefix"],[]];
            //Find corresponding course and channel
            const coursesFile = JSON.parse(fs.readFileSync("./config/courses.json"));
            const channelsFile = JSON.parse(fs.readFileSync("./config/channels.json"));
            const course = coursesFile.courses.find((course) => course.name == args[1]);
            const channel = channelsFile.channels.find((channel) => channel.name == args[1]);

            if (course && channel) {
                //Rearrange array to fit the Discord Fields
                respondContent[1][0] = channel.id;
                respondContent[1][1] = course.id;
                respondContent[1][2] = course.prefix;

                this.sendList(msg.channel.id, args[1], ["Element", "Value"], respondContent);
            } else {
                this.sendMessage(msg.channel.id, undefined, args[1] + " not found!");
            }
        }  
    }
}
module.exports = CommandFunctions;