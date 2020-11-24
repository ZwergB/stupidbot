const fetch = require('node-fetch');
const fs = require('fs');
const crypto = require('crypto');

class StudIPInterface {

    constructor(apiURL, userData = {name, password}) {
        this.url = apiURL;
        this.userData = userData;

        this.foundFiles = null;
        this.hashFile = 'hashFile.json';
    }

    async downloadFoundFiles() {

        if (!this.foundFiles) return;

        const newFiles = this.testForNewFiles(this.fileList);
       
        for (const file of newFiles) {
            const data = await this.apiRequest('/file/' + file.id + '/download', 'file');
            let buffer = Buffer.from(data);
            fs.writeFile(file.name, buffer, "binary",  () => {});
        }

        this.foundFiles = null;
    }

    testForNewFiles(fileList) { 

        const hashFilePath = 'hashFile.json';

        try {
            const info = fs.statSync(hashFilePath)
            console.log('hashfile exists')
        } catch {
            console.log('hashfile does not exists')
            return [];
        }

        const hashFile = JSON.parse(fs.readFileSync(hashFilePath));
        console.log(hashFile);

        return [];
    }

    async findFilesInCourse(fileName, courseId) {
        
        const res = await this.apiRequest('course/' + courseId + '/top_folder');
        let allFiles = await this.getAllFilesInFolder(res.id, true);

        let re =  new RegExp(fileName, 'g');
        this.foundFiles = allFiles.filter((file) => {
            return re.test(file.name);
        })

        return allFiles;
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
                response = await response.arrayBuffer();
            break;
            default:
                response = await response.json(); 

        }
        
        return response;
    }
}

module.exports = StudIPInterface;