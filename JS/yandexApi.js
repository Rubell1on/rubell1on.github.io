const request = require('request');

module.exports = class yandexApi {
    constructor(TOKEN) {
        this.TOKEN = TOKEN;
    }

    getUploadLink(path) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}` 
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${path}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    putData(url, data) {
        return new Promise((resolve, reject) => {
            request.put({
                headers: { 'Content-Type': 'application/json' },
                url,
                body: data
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body});
            });
        });
    }

    createFolder(folderName) {
        return new Promise((resolve, reject) => {
            request.put({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources?path=${folderName}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getList() {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: 'https://cloud-api.yandex.net/v1/disk/resources/files?limit=100000'
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getDowndloadLink(filePath) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources/download?path=${filePath}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getData(url) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json'  
                },
                encoding: null,
                url
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body});
            });
        });
    }

    getDirList(list) {
        const paths = list.body.items;
        return paths.reduce((acc, el) => {
            const str = el.path.match(/\/\w*-\d{4}\//g);
            if (str) {
                const dirName = str[0].slice(1, -1);
                if (!acc.includes(dirName)) {
                    acc.push(dirName);  
                }
            }
            return acc;
        }, []);
    }
}