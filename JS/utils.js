const fs = require('fs');
const request = require('request');

module.exports = {
    deleteUselessAttrs: function (obj, arr) {
        arr.forEach(attr => {
            delete obj[attr];
        });
    },
    getGroupNames: function (obj) {
        return obj[0].data.reduce((acc, row, ind) => {
            const groupNamesArr = row.reduce((acc1, cell, ind) => {
                if (typeof cell === 'string') {
                    const groupName = cell.match(/[А-ЯЁ]{4}-\d{2}-\d{2}/g);
                    if (groupName)
                        acc1.push({ind, name: groupName[0]});
                }
    
                return acc1;
            },[]);
            if (groupNamesArr.length)
                acc.push(...groupNamesArr);
            return acc;
        },[]);
    },
    getSchedules: function (groupNames, obj) {
        const dOTW = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
        const enumer = {'I': 1, 'II': 2};

        return groupNames.reduce((acc, group) => {
            const index = group.ind;
            acc[group.name] = obj[0].data.reduce((acc, curr, ind) => {
                if (curr[0] && dOTW.includes(String(curr[0]).toUpperCase()))
                    acc.day = String(curr[0]).toUpperCase();
            
                if (Object.keys(enumer).includes(curr[4])) {
                    acc.week = curr[4];
                    if (!acc[enumer[acc.week]])
                        acc[enumer[acc.week]] = {};

                    if (!acc[enumer[acc.week]][acc.day])   
                        acc[enumer[acc.week]][acc.day] = {};
                }

                if (ind > 2) {
                    if (curr[2]) {
                        acc.begin = curr[2];
                        acc.end = curr[3];
                    }

                    if (curr[1]) {
                        acc.num = curr[1];
                    }
                }

                if (curr[index] && ind > 2) {
                    acc[enumer[acc.week]][acc.day][acc.num] = {
                        begin: acc.begin,
                        end: acc.end,
                        name: curr[index],
                        type: curr[index + 1],
                        teacher: curr[index + 2],
                        room: curr[index + 3]
                    };
                }
                return acc;
                
            }, {1:{},2:{}});
            return acc;
        }, {});
    },
    readFile: function(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (data) {
                    resolve(JSON.parse(data));
                } else {
                    reject(err);
                }
            });
        });
    },
    writeFile: function(path, file) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(file), err => reject(err));
        });
    },
    isFileExists: function(path) {
        return fs.existsSync(path);
    },
    getEnvironment: function(env) {
        const SPREADSHEET_ID = env.SPREADSHEET_ID;
        const creds = {
            web: {
                client_id: env.client_id,
                project_id: env.project_id,
                auth_uri: env.auth_uri,
                token_uri: env.token_uri,
                auth_provider_x509_cert_url: env.auth_provider_x509_cert_url,
                client_secret: env.client_secret,
                redirect_uris: env.redirect_uris
            }
        };

        const token = {
            access_token: env.access_token,
            refresh_token: env.refresh_token,
            scope: env.scope,
            token_type: env.token_type,
            expiry_date: Number(env.expiry_date), 
        };

        const yandex_token = env.yandex_token;

        return {creds, token, SPREADSHEET_ID, yandex_token};
    },
    get: function (uri) {
        const options = { uri };
    
        if (arguments.length > 1) options.encoding = arguments[1];
    
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        }); 
    },
    getHalfYear: function () {
        const month = new Date().getMonth();
        const springMonth = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        return springMonth.includes(month) ? 'spring': 'autumn'; 
    }
};