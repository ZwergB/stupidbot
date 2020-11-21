const fetch = require('node-fetch');
const fs = require('fs');

class StudIPInterface {

    constructor(apiURL, userData = {name, password}) {
        this.url = apiURL;
        this.userData = userData;
    }

    async findFileInCourse(fileName, courseId) {
        
        const res = await this.apiRequest('course/' + courseId + '/top_folder');
        let allFiles = await this.getAllFilesInFolder(res.id, true);

        let re =  new RegExp(fileName, 'g');
        allFiles = allFiles.filter((file) => {
            return re.test(file.name);
        })

        for (const file of allFiles) {
            const data = await this.apiRequest('/file/' + file.id + '/download', 'file');
            const buff = new Uint8Array(data['Symbol(buffer)']());
            const curFile = fs.writeFile(file.name, buff, () => {});
        }

        fs.writeFileSync('result.json', JSON.stringify(allFiles, false, 2));
    }

    async getAllFilesInFolder(folderId, recursive = false) {

        const files = await this.apiRequest('folder/' + folderId + '/files');
        
        const allFiles = [];
        for (const file in files.collection)
            allFiles.push(files.collection[file]);

        console.log('Found ' + allFiles.length + ' file/s!')

        if (recursive) {
            const res = await this.getAllFoldersInFolder(folderId);

            for (const folder in res.collection) {
                const recursiveFiles = await this.getAllFilesInFolder(res.collection[folder].id, true);
                allFiles.push(...recursiveFiles);   
            }
        }
        
        return allFiles;        
    }

    async getAllFoldersInFolder(folderId) {
        const res  = await this.apiRequest('folder/' + folderId + '/subfolders');
        return res;
    }

    async apiRequest(path, type) {
        let response = await fetch(this.url + path, {
            method:'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(this.userData.name + ":" + this.userData.password).toString('base64')
            },
        })

        switch(type) {
            case 'text':
                response = await response.text(); 
            break;      
            case 'file':
                response = await response.blob();
            break;
            default:
                response = await response.json(); 

        }
        
        return response;
    }
}

module.exports = StudIPInterface;