const halfYear = getHalfYear();
let subtrahend;
if (halfYear === 'spring') {
    subtrahend = 6;
} else if (halfYear === 'autumn') {
    subtrahend = 34;
}

const currWeekNum = getCurrWeek() - subtrahend;
$('.toolbar-week-number').text(`#${currWeekNum}`);

if (localStorage.getItem('hideDonations') === 'true') $('.donations').css('display', 'none');
else $('.donations').css('display', 'block');

function getCurrWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const currWeek = Math.floor(diff / oneWeek) + 1;

    return currWeek;
}

function getHalfYear() {
    const month = new Date().getMonth();
    const springMonth = [0, 1, 2, 3, 4, 5, 6, 7];
    return springMonth.includes(month) ? 'spring': 'autumn'; 
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
                '<li class=""></li>' + 
                '<li class="settings">Настройки</li>' + 
            '</ul>' +
        '</div>';
        $('body').append(leftMenu);

        $('.settings').click(() => {
            const leftMenuBackground = $('.left-menu-background');
            const menu = $('.left-menu');

            removeMenu(leftMenuBackground, menu);

            const string = 
            '<div class="settings-background"></div>' +
            '<div class="settings-window">' +
                '<ul>' +
                    '<li class="set-current">Текущее расписание как основное' +
                        '<div class="slide-button sld-1" sel="false">' +
                            '<div class="slide-button-dot"></div>' +
                        '</div>' +
                    '</li>' +
                    '<li class="remove-donation">Выключить отображение иконки донатов' +
                        '<div class="slide-button sld-2" sel="false">' +
                            '<div class="slide-button-dot"></div>' +
                        '</div>' +
                    '</li>' +
                '</ul>' +
            '</div>';
            $('body').append(string);

            const background = $('.settings-background');
            const settingsWindow = $('.settings-window');

            background.animate({'opacity': 0.5}, TIMER);
            settingsWindow.animate({'opacity': 1}, TIMER);

            background.click(() => {
                background.animate({'opacity': 0}, TIMER, () => background.remove());
                settingsWindow.animate({'opacity': 0}, TIMER, () => settingsWindow.remove());
            });

            const btn1 = $('.sld-1');
            const dot1 = $(btn1.children()[0]);
            const curr = localStorage.getItem('current');

            if (curr === 'true') setEnabled(btn1, dot1);

            $('.sld-1').click(handler => {
                const bool = slideButtonClick(handler);
                if (bool === 'true') {
                    localStorage.setItem('url', `${window.location.origin}/schedule?group=${groupName}&current=true`);
                    localStorage.setItem('current', 'true');
                }
                else {
                    localStorage.setItem('url', `${window.location.origin}/schedule?group=${groupName}`);
                    localStorage.setItem('current', 'false');
                }
            });

            const btn2 = $('.sld-2');
            const dot2 = $(btn2.children()[0]);
            const hideDonations = localStorage.getItem('hideDonations');

            if (hideDonations === 'true') setEnabled(btn2, dot2);

            $('.sld-2').click(handler => {
                const bool = slideButtonClick(handler);
                if (bool === 'true') {
                    localStorage.setItem('hideDonations', 'true');
                    $('.donations').css('display', 'none');
                }
                else {
                    localStorage.setItem('hideDonations', 'false');
                    $('.donations').css('display', 'block');
                }
            });
        });


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