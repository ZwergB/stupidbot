const fetch = require('node-fetch');
const fs = require('fs');

class StudIPInterface {

    constructor(apiURL, userData = {name, password}) {
        this.url = apiURL;
        this.userData = userData;

        this.foundFiles = null;
        this.hashFile = 'hashFile.json';
        this.downloadPrefix = 'files/';

        if (!fs.existsSync(this.downloadPrefix)) {
            fs.mkdirSync(this.downloadPrefix);
        }            
    }

    async downloadFoundFiles() {

        if (!this.foundFiles) return;

        const newFiles = this.testForNewFiles(this.foundFiles);
        console.info('Downloading ' + newFiles.length + ' new files.')

        const paths = [];
      
        for (const file of newFiles) {

            if (!fs.existsSync(this.downloadPrefix + file.folder_id)) {
                fs.mkdirSync(this.downloadPrefix + file.folder_id);
            }
            
            const data = await this.apiRequest('/file/' + file.id + '/download', 'file');
            let buffer = Buffer.from(data);

            const path = this.downloadPrefix + file.folder_id + '/' + file.name
            fs.writeFile(path, buffer, "binary",  () => {});
            paths.push(path)
        }

        this.foundFiles = null;

        return paths;
    }

    testForNewFiles(fileList) { 

        try {
            const info = fs.statSync(this.hashFile)
            console.log('hashfile exists')
        } catch {
            console.log('hashfile does not exists')
            return [];
        }
        const hashFile = JSON.parse(fs.readFileSync(this.hashFile));
        fileList = fileList.filter((file) => !hashFile.hashes.find((val) => val == getHash(file)));

        fileList.map((file) => {hashFile.hashes.push(getHash(file))});
        hashFile.lastModified = Date.now();

        fs.writeFileSync(this.hashFile, JSON.stringify(hashFile, false, 2))
        return fileList;

        function getHash(file) {
            return file.file_id + file.chdate + file.name
        }
    }

    async findFilesInCourse(fileName, courseId) {
        
        const res = await this.apiRequest('course/' + courseId + '/top_folder');
        let allFiles = await this.getAllFilesInFolder(res.id, true);

        let re =  new RegExp(fileName, '');
        this.foundFiles = allFiles.filter((file) => {
            return re.test(file.name);
        })

        return allFiles;
    }

    async getAllFilesInFolder(folderId, recursive = false) {

        const files = await this.apiRequest('folder/' + folderId + '/files');
        
        const allFiles = [];

        if(!files) return allFiles;
        for (const file in files.collection)
            allFiles.push(files.collection[file]);

        console.info('Found ' + allFiles.length + ' file/s!')

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

        if (!response.ok)
            return ; 

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