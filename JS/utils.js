const fs = require('fs');

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
    getSchedules: function (groupNames, obj, dOTW, enumer) {
        return groupNames.reduce((acc, group) => {
            const index = group.ind;
            acc[group.name] = obj[0].data.reduce((acc, curr, ind) => {
                if (dOTW.includes(curr[0]))
                    acc.day = curr[0];
            
                if (Object.keys(enumer).includes(curr[4])) {
                    acc.week = curr[4];
                    if (!acc[enumer[acc.week]])
                        acc[enumer[acc.week]] = {};

                    if (!acc[enumer[acc.week]][acc.day])   
                        acc[enumer[acc.week]][acc.day] = {};
                }

                if (curr[index] && ind > 2) {
                    if (curr[2]) {
                        acc.begin = curr[2];
                        acc.end = curr[3];
                    }

                    if (curr[1]) {
                        acc.num = curr[1];
                    }
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

        return {creds, token, SPREADSHEET_ID};
    } 
};