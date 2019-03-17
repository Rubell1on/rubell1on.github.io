const selected = {
    rows: [],
    cols: []
};

const template = {
    group: {
        position: ''
    },
    pair: {
        single: false,
        name: '',
        startTime: '',
        endTime: ''
    },
    weekNum: {
        position: ''
    },
     dayOfTheWeek: {
         position: '',
    },
    pairNumber: {
        position: ''
    }
};

(async function parseData() {
    const lists = await getParsedData();
    showParsedData(lists)
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
            `<table class="schedule list${listInd}">`+
            '</table>';
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

    $('.cell').click(handle => {
        showMenu(handle);

        $('.listing').click(() => {
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
            $('.list').css({left: `${handle.pageX}px`, top: `${handle.pageY}px`});

            $('.sel-group-name').click(() => {
                const target = $(handle.target);
                template.group.position = target.attr('id').slice(4);
            });
            $('.sel-pair-num').click(() => {
                const target = $(handle.target);
                template.pairNumber.position = target.attr('id').slice(4);
            });
            $('.sel-pair-start').click(() => {
                const target = $(handle.target);
                template.pair.startTime = target.attr('id').slice(4);
            });
            $('.sel-pair-end').click(() => {
                const target = $(handle.target);
                template.pair.endTime = target.attr('id').slice(4);
            });
            $('.sel-week-num').click(() => {
                const target = $(handle.target);
                template.weekNum.position = target.attr('id').slice(4);
            });
            $('.sel-dotw').click(() => {
                const target = $(handle.target);
                template.dayOfTheWeek.position = target.attr('id').slice(4);
            });
            $('.sel-pair').click(() => {
                const target = $(handle.target);
                template.pair.name = target.attr('id').slice(4);
            });
            console.log(template);
        });
    });
}

function createListMenu(handle) {
    const str = 
    '<div class="list menu">' +
        '<div class="element">' +
            '<div class="sel-group-name">Название группы</div>' +
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
            '<div class="sel-week-nunm">Неделя</div>' +
        '</div>' +
    '</div>';
    $('body').append(str);
    $('.list').css({left: `${handle.pageX}px`, top: `${handle.pageY}px`});

    $('.sel-pair-num').click(() => {
        const target = $(handle.target);
        const id = target.attr('id');
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

    $('.delete-col').click(() => {
        const parent = $(handle.target).parents('table');
        const children = $(parent).children();
        const colId = $(handle.target).attr('id');
        children.each((ind, child) => {
            $(child).find(`#${colId}`).remove();
        });
        $('.menu').animate({opacity: 0}, 200, () => $('.menu').remove());
    });

    if (selected.cols.length) {
        const str = 
        '<div class="element">' +
            `<div class="delete-cols">Удалить колонки(${selected.cols.length})</div>` +
        '</div>';
        if ($('.delete-cols').length) {
            $('.delete-cols').parent().remove();
        }
        $('.menu').append(str);
    }
    if (selected.rows.length) {
        const str = 
        '<div class="element">' +
            `<div class="delete-rows">Удалить строки(${selected.rows.length})</div>` +
        '</div>';
        if ($('.delete-rows').length) {
            $('.delete-rows').parent().remove();
        } 
        $('.menu').append(str);
    }

    $('.select-some').click(() => {
        $('table').mousedown((handler) => {
            let startPos = {x: handler.pageX, y: handler.pageY};
            $('table').mousemove(handler => {
                const xDiff = Math.abs(startPos.x - handler.pageX);
                const yDiff = Math.abs(startPos.y - handler.pageY);
                if (xDiff > yDiff) {
                    const target = $(handler.target).attr('id');
                    if (!selected.cols.includes(target)) {
                        selected.cols.push(target);
                        const rows = $('.row');
                        selected.cols.forEach(colId => {
                            rows.each((ind, row) => {
                                $(row).find(`#${colId}`).css('background', '#2440db');
                            });
                        });
                    }
                } else {
                    const target = $(handler.target).parents('.row')
                    const targetId = target.attr('id');
                    if (!selected.rows.includes(targetId)) {
                        selected.rows.push(targetId);
                        const children = target.children();
                        children.each((ind, child) => {
                            $(child).css('background', '#2440db');
                        })
                    }
                }
            })
        });
        $('table').mouseup(handler => {
            $(handler.currentTarget).unbind();
        });
        $('.menu').animate({opacity: 0}, 200, () => $('.menu').remove());
    });

    $('.delete-cols').click(() => {
        const rows = $('.row');
        selected.cols.forEach(colId => {
            rows.each((ind, row) => {
                $(row).find(`#${colId}`).remove();
            });
        })
        $('.menu').animate({opacity: 0}, 200, () => $('.menu').css('display', 'none'));

        selected.cols = [];
        if ($('.delete-cols').length) {
            $('.delete-cols').parent().remove();
        } 
    });

    $('.delete-rows').click(() => {
        selected.rows.forEach(rowId => {
            const target = $(`#${rowId}`);
            $(target).remove();
        });    

        selected.rows = [];
        if ($('.delete-rows').length) {
            $('.delete-rows').parent().remove();
        } 
    });
}

$('.send-data').click(() => {
    const list = $('.list0');
    const rows = list.children();
    const data =  Object.entries(rows).reduce((rowsAcc, row, ind) => {
        if ((row[1] != 'length') || row[1] != 'prevObject') {
            const cells = $(row[1]).children();
            rowsAcc[ind] = Object.entries(cells).reduce((cellsAcc, cell, ind) => {
                if ((cell[1] != 'length') || cell[1] != 'prevObject') {
                    cellsAcc[ind] = $(cell[1]).text();
                }
                return cellsAcc;
            }, []);
        }
        return rowsAcc;
    }, []);
    console.log(data);
});