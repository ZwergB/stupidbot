const StudIPInterface = require('./StudIPInterface');
const DiscordBot = require('./DiscordBot');

const credentials = require('./config/credentials')
const serverConfig = require('./config/server.json')
const botConfig = require('./config/botconfig')

const courseId = '36e93f23b97226d889adb38483b273fa'; // PDA
// const courseId = '03b1f88b168fd68e9ffd623fa56de58d'; // GTI
const userId = '31a55b7f15b9d94224c67941f0b5574c';

studIpInterface =  new StudIPInterface(serverConfig.url, credentials);
studIpInterface.findFilesInCourse('.*Zusatzauf.*', courseId).then((files) => {
    studIpInterface.downloadFoundFiles();
});

discordBot = new DiscordBot(botConfig);
bot();

async function bot() {
    await discordBot.startBot()
    discordBot.uploadFile("files/pda_exercise_01.pdf", "780082677902344226");
}