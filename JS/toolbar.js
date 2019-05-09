const currWeekNum = getCurrWeek();
$('.toolbar-week-number').text(`#${currWeekNum}`);

function getCurrWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const currWeek = Math.floor(diff / oneWeek) + 1;

    return currWeek;
}

const group = $('.group-name');
const groupWidth = group.css('width');
const groupName = group.text();

let background;
let menu;

group.click(() => {
    if (!$('div').is('.left-menu')) {
        group.animate({'width': '25px'}, TIMER, () => group.text('≡'));
        const leftMenu = 
        '<div class="left-menu-background"></div>' +
        '<div class="left-menu">' +
            '<ul>' +
                `<li>Расписание ${groupName}</li>` +
                `<li class="current-schedule">Текущее</li>` +
                '<li class="week-schedule">На неделю</li>' +
            '</ul>' +
        '</div>';
        $('body').append(leftMenu);

        $('.week-schedule').click(() => location.href = window.location.origin + `/schedule?group=${groupName}`);

        $('.current-schedule').click(() => location.href = window.location.origin + `/schedule?group=${groupName}&current=true`);

        background = $('.left-menu-background');
        menu = $('.left-menu');

        background.click(() => removeMenu(background, menu));

        background.animate({'opacity': '0.5'}, TIMER);
        menu.animate({'left': '0'}, TIMER);
    } else {
        removeMenu(background, menu);
    }

    function removeMenu(background, menu) {
        if (group.text() !== groupName) group.animate({'width': groupWidth}, TIMER, () => group.text(groupName));
        const menuWidth = menu.css('width');
        background.animate({'opacity': '0'}, TIMER, () => background.remove());
        menu.animate({'left': `-${menuWidth}`}, TIMER, () => menu.remove());
    }
});