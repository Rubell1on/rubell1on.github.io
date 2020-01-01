const express = require('express');
const utils = require('./JS/utils');
const gOAuth = require('./JS/gOAuth');
const exporter = require('./JS/exporter');
const bodyParser = require('body-parser');
const {google} = require('googleapis');

const {creds, token, SPREADSHEET_ID} = utils.getEnvironment(process.env);

const oAuth2Client = new google.auth.OAuth2(creds.web.client_id, creds.web.client_secret, creds.web.redirect_uris);
oAuth2Client.setCredentials(token);
const idle = Boolean(process.argv[2]);

const PORT = process.env.PORT || 3000;
let schedules = {};
let yearString = utils.createYearString();

app = express();

if (idle) {
    app.listen(PORT, '192.168.1.157', () => {
        console.log(`Сервер запущен и ожидает запросы по ${PORT}`);
    });
} else {
    utils.parseSchedule()
        .then((data) => {
            schedules = data;
            app.listen(PORT, () => {
                console.log(`Сервер запущен и ожидает запросы по ${PORT}`);
                setInterval(() => {
                    utils.refreshPage().catch(e => console.log(e));
                }, 300000);
            });
        })
        .catch(err => console.error(err));
}

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
    const groupName = req.query.group.toUpperCase();
    const current = req.query.current;
    if (schedules.pairs.hasOwnProperty(groupName)) {
        const {currStudyWeekNum} = utils.getDateParams();
        const filteredSchedule = utils.filterPairsByWeek(schedules.pairs[groupName], currStudyWeekNum);
        if (current) {
            const currSchedule = utils.getCurrentSchedule(filteredSchedule);
            res.render('index.ejs', {schedule: currSchedule, groupName});
        } else res.render('index.ejs', {schedule: filteredSchedule, groupName});
    } else res.send(`Расписание группы ${groupName} не найдено!`);
});

app.get('/exams', (req, res) => {
    const groupName = req.query.group.toUpperCase();
    if (schedules.exams.hasOwnProperty(groupName)) res.render('exams.ejs', {exams: schedules.exams[groupName], groupName});
    else res.send(`Расписание экзаменов по группе ${groupName} не найдено!`);
});

app.get('/api/schedule', (req, res) => {
    const query = req.query;
    const queryKeys = Object.keys(query);
    const {currStudyWeekNum} = utils.getDateParams();
    if (!queryKeys.length) res.json(schedules.pairs);
    else {
        if (query.hasOwnProperty('group')) {
            const groupName = query.group.toUpperCase();
            if (schedules.pairs.hasOwnProperty(groupName)) {
                let groupSched = schedules.pairs[groupName];
                if (query.filtered) groupSched = utils.filterPairsByWeek(groupSched, currStudyWeekNum);
                if (query.hasOwnProperty('current')) {
                    currSchedule = utils.getCurrentSchedule(groupSched);
                    res.json({schedule: currSchedule, groupName});
                }
                res.json({schedule: groupSched, groupName});
                
            } else {
                res.status(404).send(`Расписание группы ${groupName} не найдено!`);
            } 
        } else if (query.hasOwnProperty('teacher')) {
            let teacher = JSON.parse(query.teacher);
            if (typeof teacher === 'string') teacher = [teacher];
            
            let schedule = utils.getDataByField(schedules.pairs, 'teacher', teacher);

            if (query.current) {
                schedule = Object.entries(schedule).reduce((acc, group) => {
                    const temp = utils.getCurrentSchedule(group[1]);
                    if (temp) acc[group[0]] = temp;
                    return acc;
                }, {});
            }

            if (utils.isEmpty(schedule)) res.status(404).send(`Преподаватель(ли) ${teacher.join(', ')} не найден(ы)`);
            else res.json(schedule);   
        }
    }
});

app.get('/api/export', (req, res) => {
    const query = req.query;

    if (query.hasOwnProperty('teacher')) {
        let teacher = query.teacher.split(',');

        if (typeof teacher === 'string') teacher = [teacher]; 

        const template = exporter.createTeacherScheduleTemplate();
        const parsedSchedules = teacher.reduce((acc, teach, ind) => {
            acc[ind] = utils.getDataByField(schedules.pairs, 'teacher', [teach]);

            return acc;
        }, []);

        for (let i = 0, pos = 5; i < parsedSchedules.length; i++, pos+=4) {
            Object.entries(parsedSchedules[i]).forEach(group => {
                Object.entries(group[1]).forEach(week => {
                    Object.entries(week[1]).forEach(dOTW => {
                        Object.entries(dOTW[1]).forEach(pair => {
                            const params = {
                                dOTW: dOTW[0],
                                pairNum: Number(pair[0]),
                                weekNum: Number(week[0])
                            };
            
                            const rowInd = exporter.getRowIndex(template, params);
                            template[0][pos] = teacher[i];

                            ['Группа', 'Предмет', 'Вид занятий', '№ аудитории'].forEach((e, i) => {
                                template[1][pos + i] = e;
                            });
                            
                            template[rowInd][pos] = group[0];
                            template[rowInd][pos + 1] = pair[1].name;
                            template[rowInd][pos + 2] = pair[1].type;
                            template[rowInd][pos + 3] = pair[1].room;
            
                        });
                    });
                });
            });
        }

        const options = exporter.createMergeOptions(teacher);
        const buffer = exporter.createXlsxFile(template, options);

        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(201).send(buffer);
    }
});

app.get('/api/exams', (req, res) => {
    const query = req.query;
    const queryKeys = Object.keys(query);
    if (!queryKeys.length) res.json(schedules.exams);
    else {
        const groupName = query.group.toUpperCase();
        if (schedules.exams.hasOwnProperty(groupName)) res.json({exams: schedules.exams[groupName], groupName});
        else res.status(404).send(`Расписание экзаменов группы ${groupName} не найдено!`);
    }
});

app.get('/api', (req, res) => res.render('api.ejs'));

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

app.get('/update', async (req, res) => {
    const query = req.query;
    const queryKeys = Object.keys(query);
    const field = 'yearString';

    if (queryKeys.includes(field)) {
        utils.saveScheduleFiles(query.yearString)
            .then(() => res.status(201).send('Обновление расписаний завершено!'))
            .catch(err => {
                res.status(500).send(err.stack)
            });
        
    } else {
        res.status(400).send(`Не найдено поле ${field}`);
    }
});

app.get('/changeSeason', (req, res) => {
    const query = req.query;
    const queryKeys = Object.keys(query);
    const field = 'yearString';

    if (queryKeys.includes(field)) {
        utils.getScheduleFiles(query.yearString)
            .then(data => {
                schedules = data;
                res.status(202).send('Полугодие изменено');
            })
            .catch(err => res.status(500).send(err));
    } else {
        res.status(400).send(`Не найдено поле ${field}`);
    }
})

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

