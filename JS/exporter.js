const xlsx = require('node-xlsx');

module.exports = {
    createTeacherScheduleTemplate: function() {
        const DOTW = {
            monday:    { value: 1, name: 'ПОНЕДЕЛЬНИК' },
            tuesday:   { value: 2, name: 'ВТОРНИК' },
            wednesday: { value: 3, name: 'СРЕДА' },
            thursday:  { value: 4, name: 'ЧЕТВЕРГ' },
            friday:    { value: 5, name: 'ПЯТНИЦА' },
            saturday:  { value: 6, name: 'СУББОТА' }
        };
    
        const numOfWeek = {
            first: 1,
            second: 2
        };
    
        const pairs = {
            1: {begin: '9:00', end: '10:30'},
            2: {begin: '10:40', end: '12:10'},
            3: {begin: '13:00', end: '14:30'},
            4: {begin: '14:40', end: '16:10'},
            5: {begin: '16:20', end: '17:50'},
            6: {begin: '18:00', end: '19:30'},
        };
    
        const entry = Object.entries(DOTW);
    
        return entry.reduce((acc, day) => {
            const numOfWeekEntry = Object.entries(numOfWeek);
            const pairsEntry = Object.entries(pairs);
    
            pairsEntry.forEach((pair, i) => {
                numOfWeekEntry.forEach(weekNum => {
                    const row = [ day[1].name,  i + 1, pair[1].begin, pair[1].end, weekNum[1], , , , ];
                    acc.push(row);
                });  
            });
    
            return acc;
        }, [
            ['Преподаватель'],
            ['День недели', '№ пары', 'Нач. занятий', 'Оконч. занятий', 'Неделя']
        ]);
    },

    createMergeOptions: function(teachers) {
        const merges = [];
    
        for (let day = 0, i = 2; day < 6; day++, i+=12) {
            const temp = {s: {c: 0, r: i}, e: {c:0, r: i + 11}};
            merges.push(temp);
        }
    
        for (let pairNum = 0, i = 2; pairNum < 36; pairNum++, i+=2) {
            const temp = [
                {s: {c: 1, r: i}, e: {c:1, r: i + 1}}, 
                {s: {c: 2, r: i}, e: {c:2, r: i + 1}}, 
                {s: {c: 3, r: i}, e: {c:3, r: i + 1}}
            ];
            
            merges.push(...temp);
        }

        for (let i = 0, t = 5; i < teachers.length; i++, t+=4) {
            merges.push({s: {c: t, r: 0}, e: {c: t + 3, r: 0}});
        }
        
    
        return {'!merges': merges};
    },

    getRowIndex: function (template, params) {
        return template.findIndex(row => {
            if (row[0] === params.dOTW) {
                if (row[1] === params.pairNum) {
                    if (row[4] === params.weekNum) {
                        return true;
                    }
                }
            }
        });
    },
    createXlsxFile: function (template, options) {
        return xlsx.build([{name: "Расписание", data: template}], options);
    }
};