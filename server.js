const xlsx = require('node-xlsx');
const express = require('express');
const utils = require('./JS/utils');
const gOAuth = require('./JS/gOAuth');
const yandexApi = require('./JS/yandexApi');
const bodyParser = require('body-parser');
const {google} = require('googleapis');
const cheerio = require('cheerio');

const {creds, token, SPREADSHEET_ID, yandex_token} = utils.getEnvironment(process.env);

const yandex = new yandexApi(yandex_token);

const oAuth2Client = new google.auth.OAuth2(creds.web.client_id, creds.web.client_secret, creds.web.redirect_uris);
oAuth2Client.setCredentials(token);

const PORT = process.env.PORT || 3000;
let schedules = {};

async function parseSchedule() {
    const list = await yandex.getList();
    const dirList = yandex.getDirList(list);
    const halfYear = utils.getHalfYear();
    const year = new Date().getFullYear();
    const yearString = `${halfYear}-${year}`;

    if (!dirList.includes(yearString)) {
        await yandex.createFolder(yearString);

        const html = await utils.get('https://www.mirea.ru/education/schedule-main/schedule/');
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
        
        const buffers = links.map(link => utils.get(link, null), []);
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
    schedules = data.reduce((acc, el, ind) => {
        const schedule = xlsx.parse(el);
        const groupNames = utils.getGroupNames(schedule);
        const parsedSchedule = utils.getSchedules(groupNames, schedule);
        const temp = Object.entries(parsedSchedule).reduce((acc, group) => {
            const name = group[0];
            const schedule = group[1];

            utils.deleteUselessAttrs(schedule, ['num', 'begin', 'end', 'day', 'week']);
            acc[name] = schedule;
            
            return acc;
        }, {});
        console.log(`Закончен парсинг ${ind + 1} объекта`);
        return Object.assign(acc, temp);
    }, {});
}

 

app = express();

parseSchedule()
    .then(() => {
        app.listen(PORT, '192.168.0.102', () => {
            console.log(`Сервер запущен и ожидает запросы по ${PORT}`);
            setInterval(() => {
                refreshPage().catch(e => console.log(e));

                async function refreshPage() {
                    await utils.get('https://schedule-p.herokuapp.com/');
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
            }, 300000);
        });
    })
    .catch(err => console.error(err));

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/JS', express.static('JS'));
app.use('/pics', express.static('pics'));
app.use('/feedback', express.static('feedback'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.render("login.ejs");
});

app.get('/schedule', (req, res) => {
    const dotw = ['ВОСКРЕСЕНЬЕ', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА' , 'ВОСКРЕСЕНЬЕ'];

    const groupName = req.query.group.toUpperCase();
    const current = req.query.current;
    if (Object.keys(schedules).includes(groupName)) {
        if (current) {
            const date = new Date();
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            const d = new Date(year, month, day).getDay();
            const currentDay =  dotw[d];
            const currWeekNum = utils.getCurrWeek();
            const currWeek = currWeekNum%2 ? 1: 2;
            if (schedules[groupName][currWeek] && Object.keys(schedules[groupName][currWeek][currentDay]) != false) {
                const currSchedule = {};
                currSchedule[currWeek] = {};
                currSchedule[currWeek][currentDay] = schedules[groupName][currWeek][currentDay];
                res.render('index.ejs', {schedule: currSchedule, groupName});
            } else {
                res.render('index.ejs', {schedule: undefined, groupName});
            }
        } else res.render('index.ejs', {schedule: schedules[groupName], groupName});
    } else res.send(`Расписание по группе ${groupName} не найдено!`);
});

app.route('/feedback')
    .get(async (req, res) => {
        const feedback = await gOAuth.getSpreadSheet(oAuth2Client, SPREADSHEET_ID).catch(err => console.log(err));
        if (req.query.json) {
            res.json(feedback);
        } else {
            res.render('feedback.ejs');
        }
    })
    .post((req, res) => postFeedback(req, res).catch(err => console.log(err)));

app.get('/update', (req, res) => {
    res.write('Обновление расписаний началось');
    res.end('200');
});

app.get('/test', (req, res) => {
    const render = req.query.render;
    res.render(render);
});

async function postFeedback(req, res) {
    if (req.body.message) {
        const text = req.body.message;
        const timestamp = req.body.timestamp.replace(/, /g, 'T');
        const rate = req.body.count;
        await gOAuth.appendSpreadSheet(oAuth2Client, SPREADSHEET_ID, [text, timestamp, rate], 'A1');
        res.status(201).send('Фидбек отправлен! Спасибо;)');
    } else {
        res.status(400).send('Произошла серверная ошибка');
    }
}

