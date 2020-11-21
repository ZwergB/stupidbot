const fetch = require('node-fetch');
const credentials = require('./config/credentials')
const serverConfig = require('./config/server.json')


apiRequest('discovery', credentials)

function apiRequest(path, userAuth = { user, password }) {

    fetch(serverConfig.url + path, {
        method:'GET',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(userAuth.user + ":" + userAuth.password).toString('base64')
        },
    })
    .then(response => response.json())
    .then((json) => {
        fs = require('fs');
        fs.writeFile('result.json', JSON.stringify(json, false, 2), () => {
    
        });
        console.log(json)
    })
    .catch((err) => {
        console.log(error);
    });
}