const StudIPInterface = require('./StudIPInterface');

const credentials = require('./config/credentials')
const serverConfig = require('./config/server.json')

const courseId = '36e93f23b97226d889adb38483b273fa'; // PDA
// const courseId = '03b1f88b168fd68e9ffd623fa56de58d'; // GTI
const userId = '31a55b7f15b9d94224c67941f0b5574c';

studIpInterface =  new StudIPInterface(serverConfig.url, credentials);
studIpInterface.findFilesInCourse('.*Zusatzauf.*', courseId).then((files) => {
    studIpInterface.downloadFoundFiles();
});