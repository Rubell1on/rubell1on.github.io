const fs = require('fs');
const request = require('request');
const xlsx = require('node-xlsx');
const cheerio = require('cheerio');
const yandexApi = require('./yandexApi');

const {yandex_token} = getEnvironment(process.env);
const yandex = new yandexApi(yandex_token);

async function refreshPage() {
    await this.get('https://schedule-p.herokuapp.com/');
    const date = {
        y: new Date().getFullYear(),
        m: new Date().getMonth() + 1,
        d: new Date().getDate(),
        h: new Date().getHours(),
        M: new Date().getMinutes(),
        s: new Date().getSeconds()
    }
    console.log(`Обновлено ${date.y}-${date.m}-${date.d} ${date.h}:${date.M}:${date.s}`);
}

async function parseSchedule() {
    const list = await yandex.getList();
    const dirList = yandex.getDirList(list);
    const halfYear = this.getHalfYear();
    const year = new Date().getFullYear();
    const yearString = `${halfYear}-${year}`;

    if (!dirList.includes(yearString)) {
        await yandex.createFolder(yearString);

        const html = await this.get('https://www.mirea.ru/education/schedule-main/schedule/');
        const $ = cheerio.load(html);
        const parsedHtml = $('#tab-content > li > div > h2, .uk-overflow-auto');

        let str;
        const obj = {};
        parsedHtml.each((ind, el) => {
            if (el.tagName === 'h2') {
                str = cheerio.load(el).text();
            } else {
                if (str.match(/занятий/g)) {
                    if (!obj.hasOwnProperty('pairs')) obj.pairs = [];
                    obj.pairs.push(el);
                } 
                // else if (str.match(/сессии/g)) {
                //     //TODO У бакалавров две отдельные таблицы под экзамены и под зачеты
                //     if (!obj.hasOwnProperty('exams')) obj['exams'] = {};
                //     Object.assign(obj['exams'], el);
                // }
            }
        });

        const links = obj.pairs.reduce((acc, el) => {
            const temp = cheerio.load(el)('table > tbody > tr > td > a').map((ind, link) => link.attribs.href);
            temp.each((ind, el) => acc.push(el));
            
            return acc;
        }, [])
            .filter(val => val.match(/.xls/g) && !val.match(/\d-kurs-(zaochniki|vecherniki)/g));
        links.splice(-2, 2);
        
        const buffers = links.map(link => this.get(link, null), []);
        const data = await Promise.all(buffers);

        data.forEach(async (buffer, ind) => {
            const reverse = links[ind].split("").reverse().join("");
            const i = reverse.indexOf('/',0);
            const name = reverse.slice(0, i).split("").reverse().join("");
            const uploadLink = await yandex.getUploadLink(`/${yearString}/${name}/`);
            const res = await yandex.putData(uploadLink.body.href, buffer);
            if (res.res.statusCode === 201) {
                console.log(`Файл №${ind} ${name} загружен`);
            } else {
                console.error(`Во время загрузки файла произошла ошибка: ${JSON.parse(res.body).message}`);
            } 
        }); 
    }

    const listOfFiles = await yandex.getList();
    const filteredFiles = listOfFiles.body.items.filter(el => el.path.match(yearString));
    console.log(`Получено ${filteredFiles.length} файлов`);
    const buffers = filteredFiles.map(async (el) => {
        const path = await yandex.getDowndloadLink(el.path);
        const downloadData = await yandex.getData(path.body.href);
        return downloadData.body;
    }, []);
    const data = await Promise.all(buffers);
    //
    return data.reduce((acc, el, ind) => {
        const schedule = xlsx.parse(el);
        const groupNames = this.getGroupNames(schedule);
        const parsedSchedule = this.getSchedules(groupNames, schedule);
        const temp = Object.entries(parsedSchedule).reduce((acc, group) => {
            const name = group[0];
            const schedule = group[1];

            this.deleteUselessAttrs(schedule, ['num', 'begin', 'end', 'day', 'week']);
            acc[name] = schedule;
            
            return acc;
        }, {});
        console.log(`Закончен парсинг ${ind + 1} объекта`);
        return Object.assign(acc, temp);
    }, {});
}

function getEnvironment(env) {
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
}


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
        const enumer = {'I': 1, 'II': 2};

        return groupNames.reduce((acc, group) => {
            const index = group.ind;
            acc[group.name] = obj[0].data.reduce((acc, curr, ind) => {
                if (curr[0] && this.dOTW.includes(String(curr[0]).toUpperCase()))
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
                        acc.begin = curr[2] ? curr[2].replace('-', ':') : curr[2];
                        acc.end = curr[3] ? curr[3].replace('-', ':') : curr[3];
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
    getEnvironment
    ,
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
    },
    getCurrWeek: function () {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const currWeek = Math.floor(diff / oneWeek) + 1;
    
        return currWeek;
    },
    getCurrStudyWeek: function() {
        const halfYear = this.getHalfYear();
        let subtrahend;
        if (halfYear === 'spring') {
            subtrahend = 6;
        } else if (halfYear === 'autumn') {
            subtrahend = 34;
        }

        return this.getCurrWeek() - subtrahend;
    }, 
    filterPairsByWeek: function(schedule, currWeek) {
        return Object.entries(schedule).reduce((acc1, week, ind) => {
            acc1[ind+1] = Object.entries(week[1]).reduce((acc2, day) => {
                acc2[day[0]] = Object.entries(day[1]).reduce((acc3, pair) => {
                    const regexp = new RegExp(`${currWeek}`, 'g');
                    if (pair[1].name.match(/(\d{1,2},?н?.?)/g)) {
                        if (pair[1].name.match(regexp)) {
                            acc3[pair[0]] = pair[1];
                            return acc3;
                        } else return acc3;
                    } else {
                        acc3[pair[0]] = pair[1];
                        return acc3;
                    }
                }, {});
                return acc2;
            }, {});
            return acc1;
        }, {});
    },
    getDateParams: function() {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const d = new Date(year, month, day).getDay();
        const currWeekNum = this.getCurrWeek();
        return {currWeek: currWeekNum%2 ? 1: 2, currentDay: this.dOTW[d], currStudyWeekNum: this.getCurrStudyWeek()};
    },
    isEmpty: function(object) {
        return JSON.stringify(object) == '{}';
    },
    getDataByField: function(schedules, param, fieldName) {
        return Object.entries(schedules).reduce((acc1, groups) => {
            temp1 = Object.entries(groups[1]).reduce((acc2, weeks) => {
                temp2 = Object.entries(weeks[1]).reduce((acc3, days) => {
                    temp3 = Object.entries(days[1]).reduce((acc4, pairs) => {
                        fieldName.forEach((field) => {
                            if (pairs[1][param] && pairs[1][param].match(field)) acc4[pairs[0]] = pairs[1];
                        });
                        
                        return acc4;
                    }, {});
                    if (!this.isEmpty(temp3)) acc3[days[0]] = temp3;

                    return acc3;
                }, {});
                if (!this.isEmpty(temp2)) acc2[weeks[0]] = temp2;

                return acc2;
            }, {});
            if (!this.isEmpty(temp1)) acc1[groups[0]] = temp1;

            return acc1;
        }, {});
    },
    getCurrentSchedule: function(groupSched){
        const {currWeek, currentDay} = this.getDateParams();
        // console.log(groupSched[currWeek]);
        // console.log(groupSched[currWeek][currentDay]);
        // console.log(Object.keys(groupSched[currWeek][currentDay]));
        if (groupSched[currWeek] && groupSched[currWeek][currentDay]) {
            const currSchedule = {};
            currSchedule[currWeek] = {};
            currSchedule[currWeek][currentDay] = groupSched[currWeek][currentDay];
            return currSchedule;
        } else {
            return undefined;
        }
    },
    parseSchedule,
    refreshPage,
    dOTW: ['ВОСКРЕСЕНЬЕ', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА']
};