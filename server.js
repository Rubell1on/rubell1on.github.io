const xlsx = require('node-xlsx');
const express = require('express');
const utils = require('./JS/utils');
const gOAuth = require('./JS/gOAuth');
const bodyParser = require('body-parser');
const {google} = require('googleapis');

const args = process.argv;
const SPREADSHEET_ID = args[14];

const creds = {
    web: {
        client_id: args[2],
        project_id: args[3],
        auth_uri: args[4],
        token_uri: args[5],
        auth_provider_x509_cert_url: args[6],
        client_secret: args[7],
        redirect_uris: args[8]
    }
};

const token = {
    access_token: args[9],
    refresh_token: args[10],
    scope: args[11],
    token_type: args[12],
    expiry_date: Number(args[13]), 
};

const oAuth2Client = new google.auth.OAuth2(creds.web.client_id, creds.web.client_secret, creds.web.redirect_uris);
oAuth2Client.setCredentials(token);

const feedback = __dirname + '/feedback.json';
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
        res.render("index.ejs", {schedule: schedules[groupName], groupName});
    else
        res.send(`Расписание по группе ${groupName} не найдено!`);
});

app.post('/feedback', (req, res) => postFeedback(req, res).catch(err => console.log(err)));

app.get('/update', (req, res) => {
    res.write('Обновление расписаний началось');
    res.end('200');
});

app.get('/admin', async (req, res) => {
    const feedback = await gOAuth.getSpreadSheet(oAuth2Client, SPREADSHEET_ID).catch(err => console.log(err));
    res.send(feedback);
});

async function postFeedback(req, res) {
    if (req.body.text) {
        const text = req.body.text;
        await gOAuth.appendSpreadSheet(oAuth2Client, SPREADSHEET_ID, [text], 'A1');
        res.status(201).send('Фидбек отправлен! Спасибо;)');
    } else {
        res.status(400).send('Произошла серверная ошибка');
    }
}

