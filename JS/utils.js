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
        const dOTW = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
        const enumer = {'I': 1, 'II': 2};

        return groupNames.reduce((acc, group) => {
            const index = group.ind;
            acc[group.name] = obj[0].data.reduce((acc, curr, ind) => {
                if (dOTW.includes(curr[0]))
                    acc.day = curr[0];
            
                if (Object.keys(enumer).includes(curr[4])) {
                    acc.week = curr[4];
                    if(!acc[enumer[acc.week]])
                        acc[enumer[acc.week]] = {};
                if (!acc[enumer[acc.week]][acc.day])   
                    acc[enumer[acc.week]][acc.day] = {}
                }
                if (typeof curr[1] === 'number') {
                    acc.num = curr[1];
                }
                if (/\d?\d-\d\d/.test(curr[2])) {
                    acc.begin = curr[2];
                    acc.end = curr[3];
                }

                if (curr[index] && ind > 2) {
                    acc[enumer[acc.week]][acc.day][acc.num] = {
                        begin: acc.begin,
                        end: acc.end,
                        name: curr[index],
                        type: curr[index + 1],
                        teacher: curr[index + 2],
                        room: curr[index + 3]
                    }
                }
                return acc;
                
            }, {1:{},2:{}});
            return acc;
        }, {});
    }
}