const xlsx = require('node-xlsx');
const express = require('express');
const utils = require('./JS/utils');

// const IP = "192.168.0.105";
const PORT = 3000;

const obj = xlsx.parse(__dirname + '/xls/IK_1k_mag_18_19_vesna.xlsx'); 
// const obj = xlsx.parse(__dirname + '/xls/IEP-1-kurs-2-sem.xlsx'); 
// const obj = xlsx.parse(__dirname + '/xls/IK_1k_18_19_vesna.xlsx'); 

app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/JS', express.static('JS'));
app.use('/pics', express.static('pics'));
app.listen(PORT);
// console.log(`Сервер запущен и ожидает запросы по ${IP}:${PORT}`);

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

app.get('/update', (req, res) => {
    res.write('Обновление расписаний началось');
    res.end(200);
});

