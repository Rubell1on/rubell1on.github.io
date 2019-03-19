const xlsx = require('node-xlsx');
const express = require('express');
const utils = require('./JS/utils');
const gOAuth = require('./JS/gOAuth');
const bodyParser = require('body-parser');
const {google} = require('googleapis');

const {creds, token, SPREADSHEET_ID} = utils.getEnvironment(process.env);

const oAuth2Client = new google.auth.OAuth2(creds.web.client_id, creds.web.client_secret, creds.web.redirect_uris);
oAuth2Client.setCredentials(token);

const PORT = process.env.PORT || 3000;

const obj = xlsx.parse(__dirname + '/xls/IK_1k_mag_18_19_vesna.xlsx'); 
// const obj = xlsx.parse(__dirname + '/xls/IEP-1-kurs-2-sem.xlsx'); 
// const obj = xlsx.parse(__dirname + '/xls/IK_1k_18_19_vesna.xlsx'); 

app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/JS', express.static('JS'));
app.use('/pics', express.static('pics'));
app.use('/feedback', express.static('feedback'));
app.use(bodyParser.urlencoded({extended: false}));
app.listen(PORT, () => {
    console.log(`Сервер запущен и ожидает запросы по ${PORT}`);
});

const groupNames = utils.getGroupNames(obj);
const schedules = utils.getSchedules(groupNames, obj);

const temp = Object.entries(schedules).reduce((acc, group) => {
    const name = group[0];
    const schedule = group[1];

    utils.deleteUselessAttrs(schedule, ['num', 'begin', 'end', 'day', 'week']);
    acc[name] = schedule;
    
    return acc;
}, {});

app.get('/', (req, res) => {
    res.render("login.ejs");
});

app.get('/schedule', (req, res) => {
    const groupName = req.query.group.toUpperCase();
    if (Object.keys(schedules).includes(groupName))
        res.render('index.ejs', {schedule: schedules[groupName], groupName});
    else
        res.send(`Расписание по группе ${groupName} не найдено!`);
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

app.route('/parser')
    .get((req, res) => res.render('parser.ejs'))
    .post((req, res) => {
        if (!Object.keys(req.query).length) {
            const parsed = xlsx.parse(__dirname + '/xls/IK_1k_mag_18_19_vesna.xlsx');
            const filtered = parsed.filter(list => list.data.length);
            res.status(200).json(filtered);
        } else {
            
        }
        
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

