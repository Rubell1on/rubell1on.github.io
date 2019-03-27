let selected = [];

const template = {
    group: {
        horizontal: true,
        position: [],
        names: []
    },
    pair: {
        single: false,
        name: [],
        startTime: [],
        endTime: []
    },
    weekNum: {
        position: []
    },
    dayOfTheWeek: {
        position: [],
        values: []
    },
    pairNumber: {
        position: []
    }
};

(async function parseData() {
    const lists = await getParsedData();
    showParsedData(lists);
})()

function getParsedData() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/parser',
            type: 'POST',
            data: {},
            success: data => resolve(data),
            error: err => reject(err)
        });
    });
}

function showParsedData(lists) {
    lists.forEach((list, listInd) => {
        const str = 
            `<div class="schedule"><table class="list${listInd}">`+
            '</table></div>';
        $('body').append(str);

        list.data.forEach((row, ind) => {
            const cells = row.reduce((str, cell, ind) => {
                const value = cell ? cell : ' ';
                return str += `<td class="cell" id="cell${ind}">${value}</td>`;
            }, '');
            const parsedRow = `<tr class="row" id="row${ind}">${cells}</tr>`;
            $(`.list${listInd}`).append(parsedRow);
        });
    });

    function clearSelected() {
        selected.forEach(e => $(`#${e.row}`).find(`#${e.cell}`).css('background', '#b2a5ff'));
        selected = [];
    }

    function selectCell(handle) {
        const target = $(handle.target);
        const cell = target.attr('id');
        const row = target.parent().attr('id');
        target.css('background', '#2440db');
        selected.push({cell, row});
    }

    $('.cell').click(handle => {
        showMenu(handle);
        clearSelected();
        selectCell(handle);
    });
}

function showMenu(handle) {
    const menu = $('.menu').length;
    if (!menu) {
        const str = 
        '<div class="menu">' +
            '<div class="element">' +
                '<div class="select-some">Выделить несколько</div>' +
            '</div>' +
            '<div class="element">' +
                '<div class="clear-cell">Очистить ячейку</div>' +
            '</div>' +
            '<div class="element">' +
                '<div class="delete-row">Удалить строку</div>' +
            '</div>' +
            '<div class="element">' +
                '<div class="delete-col">Удалить столбец</div>' +
            '</div>' +
            '<div class="element">' +
                '<div class="listing">Выбрать как</div>' +
            '</div>' +
        '</div>';
        $('body').append(str);
        $('.menu').css({left: `${handle.pageX}px`, top: `${handle.pageY}px`});
    } else {
        $('.menu').animate({'opacity': '0'}, 200, () => $('.menu').remove());
    }

    $('.menu').css('opacity', 0).animate({opacity: 1}, 200);

    $('.clear-cell').click(() => {
        const target = handle.target;
        $(target).text('');
    }) 

    $('.delete-row').click(() => {
        const target = handle.target;
        const parent = $(target).parent();
        $(parent).remove();
        $('.menu').animate({opacity: 0}, 200, () => $('.menu').remove());
    });

    // $('.delete-col').click(() => {
    //     const parent = $(handle.target).parents('table');
    //     const children = $(parent).children();
    //     const colId = $(handle.target).attr('id');
    //     children.each((ind, child) => {
    //         $(child).find(`#${colId}`).remove();
    //     });
    //     $('.menu').animate({opacity: 0}, 200, () => $('.menu').remove());
    // });

    if (selected.length) {
        const str = 
        '<div class="element">' +
            `<div class="delete-sel">Удалить выделенное(${selected.length})</div>` +
        '</div>';
        if ($('.delete-cols').length) {
            $('.delete-cols').parent().remove();
        }
        $('.menu').append(str);
    }

    $('.select-some').click(() => {
        $('table').mousedown(handler => {
            const target = $(handler.target);
            const start = {cell: target.attr('id'), row: target.parent().attr('id')};
            $('table').mousemove(handler => {
                const target = $(handler.target);
                const cell = target.attr('id');
                const row = target.parent().attr('id');
                if (!selected.length || !selected.find(elm => (elm.cell === cell) && (elm.row === row))) {
                    if (row) {
                        if (start.row === row) {
                            selected.push({cell, row});
                            $(`#${row}`).find(`#${cell}`).css('background', '#2440db'); 
                        } else {
                            const children = $(`#${row}`).children();
                            const ids = Object.entries(children).map(element => {
                                const el = element[1];
                                if (element[0] !== 'prevObject' && element[0] !== 'length') {
                                    const temp = $(el).attr('id');    
                                    return temp;
                                }  
                            }, []).filter(e => e);
                            const startId = ids.indexOf(start.cell);
                            const endId = ids.indexOf(cell);
                            for (let i = startId; i <= endId; i++) {
                                const elm = $(`#${ids[i]}`);
                                const cell = elm.attr('id');
                                selected.push({cell, row});
                                $(`#${row}`).find(`#${cell}`).css('background', '#2440db');
                            }
                        }
                    }     
                }
                // const xDiff = Math.abs(startPos.x - handler.pageX);
                // const yDiff = Math.abs(startPos.y - handler.pageY);
                // if (xDiff > yDiff) {
                //     const target = $(handler.target).attr('id');
                //     if (!selected.cols.includes(target)) {
                //         selected.cols.push(target);
                //         const rows = $('.row');
                //         selected.cols.forEach(colId => {
                //             rows.each((ind, row) => {
                //                 $(row).find(`#${colId}`).css('background', '#2440db');
                //             });
                //         });
                //     }
                // } else {
                //     const target = $(handler.target).parents('.row')
                //     const targetId = target.attr('id');
                //     if (!selected.rows.includes(targetId)) {
                //         selected.rows.push(targetId);
                //         const children = target.children();
                //         children.each((ind, child) => {
                //             $(child).css('background', '#2440db');
                //         });
                //     }
                // }
            });
        });
        $('table').mouseup(handler => {
            $(handler.currentTarget).unbind();
            showMenu(handle);
        });
        $('.menu').animate({opacity: 0}, 200, () => $('.menu').remove());
    });

    // $('.delete-sel').click(() => {
    //     const rows = $('.row');
    //     selected.cols.forEach(colId => {
    //         rows.each((ind, row) => {
    //             $(row).find(`#${colId}`).remove();
    //         });
    //     })
    //     $('.menu').animate({opacity: 0}, 200, () => $('.menu').css('display', 'none'));

    //     selected = [];
    //     if ($('.delete-cols').length) {
    //         $('.delete-cols').parent().remove();
    //     } 
    // });

    $('.delete-sel').click(() => {
        selected.forEach(e => {
            const target = $(`#${e.row}`).find(`#${e.cell}`);
            $(target).remove();
        });    

        selected = [];
        if ($('.delete-sel').length) {
            $('.delete-sel').parent().remove();
        } 
    });

    $('.listing').hover(() => {
        const str = 
            '<div class="list menu">' +
                '<div class="element">' +
                    '<div class="sel-group-name">Название группы</div>' +
                '</div>' +
                '<div class="element">' +
                    '<div class="sel-pair">Название пары</div>' +
                '</div>' +
                '<div class="element">' +
                    '<div class="sel-pair-num">Номер пары</div>' +
                '</div>' +
                '<div class="element">' +
                    '<div class="sel-pair-start">Время начала пары</div>' +
                '</div>' +
                '<div class="element">' +
                    '<div class="sel-pair-end">Время конца пары</div>' +
                '</div>' +
                '<div class="element">' +
                    '<div class="sel-week-num">Неделя</div>' +
                '</div>' +
                '<div class="element">' +
                    '<div class="sel-dotw">День недели</div>' +
                '</div>' +
            '</div>';
        $('body').append(str);
        const menu = $('.menu');
        const menuWidth = parseInt(menu.css('width'));
        const menuHeight = parseInt(menu.css('height'));
        $('.list').css({left: `${handle.pageX + menuWidth}px`, top: `${handle.pageY + menuHeight - 30}px`});

        $('.sel-group-name').click(() => {
            if (selected.length > 1) {
                Object.entries(selected).forEach((el, ind) => {
                    if (ind !== 0) {
                        if (selected[0].cell === el[1].cell) {
                            template.group.horizontal = false;
                            return;
                        }
                    }
                });
                if (template.group.horizontal) {
                    selected.forEach(el => {
                        const row = $(`#${el.row}`).children();
                        const ids = Object.entries(row).map(el => {
                            if (el[0] !== 'prevObject' && el[0] !== 'length') {
                                return $(el[1]).attr('id');
                            }
                        }).filter(e => e);
                        const ind = ids.indexOf(el.cell);
                        const name = $(`#${el.row}`).find(`#${el.cell}`).text().trim();
                        if (name) template.group.names.push({ind, name});
                    })
                } else {
                    //TODO
                }                 
            }
            
        });

        function getIndex() {
            const children = $(`#${selected[0].row}`).children();
            let ind;
            Object.entries(children).forEach((element, i) => {
                const el = $(element[1])
                const cell = el.attr('id');
                if (cell === selected[0].cell) ind = i;
            });
            return ind;
        }
        $('.sel-pair-num').click(() => {
            //if Vertical
            const ind = getIndex();
            template.pairNumber.position = ind;
        });
        $('.sel-pair-start').click(() => {
            const ind = getIndex();
            template.pair.startTime = ind;
        });
        $('.sel-pair-end').click(() => {
            const ind = getIndex();
            template.pair.endTime = ind;
        });
        $('.sel-week-num').click(() => {
            const ind = getIndex();
            template.weekNum.position = ind;
        });
        $('.sel-dotw').click(() => {
            //if vertical
            const dotw = selected.map(el => $(`#${el.row}`).find(`#${el.cell}`).text().trim())
                .filter(e => e);
            const ind = getIndex();
            template.dayOfTheWeek.position = ind;
            template.dayOfTheWeek.values = dotw;
        });
        $('.sel-pair').click(() => {
            const ind = getIndex();
            template.pair.name = ind;
        });
        console.log(template);
    });
}

$('.send-data').click(() => {
    const data = buildData();
    const promise = new Promise((resolve, reject) => {
        $.ajax({
            url: '/parser',
            type: 'POST',
            data: {data: JSON.stringify(data), template: JSON.stringify(template)},
            success: data => resolve(data),
            error: err => reject(err)
        });
    });
    promise
    .then(data => console.log(data))
    .catch(err => console.log(err));
    // console.log(data);
});

function buildData() {
    const lists = $('.schedule').children();
    return Object.entries(lists).reduce((acc, curr, ind) => {
        if(curr[0] !== 'length' && curr[0] !== 'prevObject') {
            const list = $(curr[1]);
            const name = list.attr('class');
            const rows = list.children();
            const data = Object.entries(rows).reduce((rowsAcc, row, ind) => {
            if ((row[1] !== 'length') || row[1] !== 'prevObject') {
                const cells = $(row[1]).children();
                rowsAcc[ind] = Object.entries(cells).reduce((cellsAcc, cell, ind) => {
                    if ((cell[1] != 'length') || cell[1] != 'prevObject') {
                        cellsAcc[ind] = $(cell[1]).text().trim();
                    }
                    return cellsAcc;
                }, []);
            }
            return rowsAcc;
            }, []);

            acc[ind] = {
                name,
                data 
            }
        }

        return acc;
    }, []) 
    // const rows = $('.list0').children();
    // return Object.entries(rows).reduce((rowsAcc, row, ind) => {
    //     if ((row[1] !== 'length') || row[1] !== 'prevObject') {
    //         const cells = $(row[1]).children();
    //         rowsAcc[ind] = Object.entries(cells).reduce((cellsAcc, cell, ind) => {
    //             if ((cell[1] != 'length') || cell[1] != 'prevObject') {
    //                 cellsAcc[ind] = $(cell[1]).text();
    //             }
    //             return cellsAcc;
    //         }, []);
    //     }
    //     return rowsAcc;
    // }, []);
}