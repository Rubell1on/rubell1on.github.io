const xlsx = require('node-xlsx');
const express = require('express');
const utils = require('./JS/utils');
const gOAuth = require('./JS/gOAuth');
const bodyParser = require('body-parser');
const {google} = require('googleapis');

// const args = process.argv;
const args = process.env;
const SPREADSHEET_ID = args.SPREADSHEET_ID;

const creds = {
    web: {
        client_id: args.client_id,
        project_id: args.project_id,
        auth_uri: args.auth_uri,
        token_uri: args.token_uri,
        auth_provider_x509_cert_url: args.auth_provider_x509_cert_url,
        client_secret: args.client_secret,
        redirect_uris: args.redirect_uris
    }
};

const token = {
    access_token: args.access_token,
    refresh_token: args.refresh_token,
    scope: args.scope,
    token_type: args.token_type,
    expiry_date: Number(args.expiry_date), 
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

