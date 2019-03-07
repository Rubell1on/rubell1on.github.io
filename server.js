const xlsx = require('node-xlsx');
const express = require('express');
const utils = require('./JS/utils');
const bodyParser = require('body-parser');

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
    res.end(200);
});

app.get('/admin', async (req, res) => {
    if (utils.isFileExists(feedback)) {
        const file = await utils.readFile(feedback);
        res.send(file);
    }
});

async function postFeedback(req, res) {
    if (req.body.text) {
        if (utils.isFileExists(feedback)) {
            const file = await utils.readFile(feedback);
            const extendedFile = file.concat(req.body);
            await utils.writeFile(feedback, extendedFile);
        } else {
            await utils.writeFile(feedback, [req.body]);
        }
        res.end(201);
    } else {
        res.end(400);
    }
}

