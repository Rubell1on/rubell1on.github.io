let selected = [];

const template = {
    group: {
        position: []
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

            $('.sel-group-name').click(() => template.group.position = selected);
            $('.sel-pair-num').click(() => template.pairNumber.position = selected);
            $('.sel-pair-start').click(() => template.pair.startTime = selected);
            $('.sel-pair-end').click(() => template.pair.endTime = selected);
            $('.sel-week-num').click(() => template.weekNum.position = selected);
            $('.sel-dotw').click(() => template.dayOfTheWeek.position = selected);
            $('.sel-pair').click(() => template.pair.name = selected);
            console.log(template);
        });
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
        $('table').mousedown((handler) => {
            let startPos = {x: handler.pageX, y: handler.pageY};
            $('table').mousemove(handler => {
                const target = $(handler.target);
                const cell = target.attr('id');
                const row = target.parent().attr('id');
                if (!selected.length || !selected.find(elm => (elm.cell === cell) && (elm.row === row))) {
                    selected.push({cell, row});
                    $(`#${row}`).find(`#${cell}`).css('background', '#2440db');
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
}

$('.send-data').click(() => {
    const data = buildData();
    console.log(data);
});

function buildData() { 
    const rows = $('.list0').children();
    return Object.entries(rows).reduce((rowsAcc, row, ind) => {
        if ((row[1] !== 'length') || row[1] !== 'prevObject') {
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
}