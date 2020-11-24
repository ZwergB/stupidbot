const StudIPInterface = require('./StudIPInterface');
const DiscordBot = require('./DiscordBot');

const credentials = require('./config/credentials')
const serverConfig = require('./config/server.json')
const botConfig = require('./config/botconfig')

const courseId = '36e93f23b97226d889adb38483b273fa'; // PDA
// const courseId = '03b1f88b168fd68e9ffd623fa56de58d'; // GTI
const userId = '31a55b7f15b9d94224c67941f0b5574c';

discordBot      = new DiscordBot(botConfig);
studIpInterface =  new StudIPInterface(serverConfig.url, credentials);

(async function() {
    await discordBot.startBot()

    testCycle();
    setInterval(testCycle, 600000);
})();

async function testCycle() {
    console.info('Testcycle started!');

    await studIpInterface.findFilesInCourse('.*Zusatzauf.*', courseId);
    const newFilePaths = await studIpInterface.downloadFoundFiles();
    console.log(newFilePaths);

    discordBot.uploadFile(newFilePaths[2], "780082677902344226");

    console.info('Testcycle ended!')
}