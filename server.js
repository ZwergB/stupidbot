const StudIPInterface = require('./StudIPInterface');
const DiscordBot      = require('./DiscordBot');

const serverConfig = require('./config/server.json')
const botConfig    = require('./config/botconfig')

const credentials  = require('./config/credentials')

const channels = require('./config/channels.json').channels;
const courses  = require('./config/courses.json').courses;

discordBot      = new DiscordBot(botConfig);
studIpInterface = new StudIPInterface(serverConfig.url, credentials);

(async function() {
    await discordBot.startBot(testCycle)

    testCycle();
    setInterval(testCycle, 600000);
})();

async function testCycle() {
    console.info('Testcycle started!');
    
    for (const channel of channels) {
        const course = courses.find((course) => course.name == channel.name);

        if (course) {
            console.info('####################');
            console.info(course.name);

            await studIpInterface.findFilesInCourse(course.prefix, course.id);
            const newFilePaths = await studIpInterface.downloadFoundFiles();

            for (const filePath of newFilePaths) {
                discordBot.uploadFile(filePath, channel.id); 
            }
        } else {
            console.error('Channel ' + channel.name + ' ist mit keinem Kurs verknüpft!')
        }
    }

    console.info('Testcycle ended!')
}