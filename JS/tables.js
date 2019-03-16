const TIMER = 200;
const currWeek = getCurrWeek();
localStorage.setItem('url', window.location.href);

let windowWidth = $(window).width();

$(() => {
    $('.wrapper').animate({'opacity': '1'}, TIMER);
    hideTable(windowWidth, 1015);
    if (windowWidth < 515) {
        $('.row').bind('click', handler => createOverlay(handler));
    } else {
        $('.row').unbind('click');
    }
});

$(window).resize(() => {
    windowWidth = $(window).width();
    // hideTable(windowWidth, 1015);
    if (windowWidth < 515) {
        $('.row').bind('click', handler => createOverlay(handler));
    } else {
        $('.row').unbind('click');
    }
});

$('.controls>div').click(handler => {
    let className = handler.target.className;
    if (className === 'first-week') {
        $('#week-1').css('display', 'table');
        $('#week-2').css('display', 'none');
    } else if (className === 'second-week') {
        $('#week-1').css('display', 'none');
        $('#week-2').css('display', 'table');
    }
});

$('.quit-button').click(() => {
    localStorage.removeItem('url');
    location.href = location.origin;
});

$('.feedback-button').click(() => createFeedbackOverlay());

function createOverlay(handler) {
    const children = $(handler.delegateTarget).children();  
    const pairType = children[3].innerText;
    const teacherName = children[4].innerText;
    const classRoom = children[5].innerText;

    const overlay = '<div class="overlay">' +
                        '<div class="overlay-window">' +
                            `<div>${pairType}</div>` +
                            `<div>${teacherName}</div>` +
                            `<div>${classRoom}</div>` +
                        '</div>' +
                    '</div>';

    $('body').prepend(overlay);
    $('.overlay').css('opacity', '0').animate({'opacity': '1'}, TIMER);
    $('.overlay').bind('click', 
        () => $('.overlay').animate({'opacity': '0'}, 
        TIMER, 
        () => $('.overlay').remove())
    );
}

function createFeedbackOverlay() {
    const overlay = 
    '<div class="feedback overlay">' +
        '<div class="feedback-overlay-window">' +
            '<div class="feedback-overlay">' +
                '<label for="feedback-message">Опишите проблему или пожелание</label>' +
                '<link rel="stylesheet" href="./public/CSS/rate.css">' +
                '<div class="rate-wrapper">' +
                    '<div class="rate" id="id0"></div>' +
                    '<div class="rate" id="id1"></div>' +
                    '<div class="rate" id="id2"></div>' +
                    '<div class="rate" id="id3"></div>' +
                    '<div class="rate" id="id4"></div>' +
                '</div>' +
                '<script src="JS/rate.js"></script>' +
                '<div class="feedback-text-wrapper">' +
                    '<textarea id="feedback-message" name="text"></textarea>' +
                '</div>' +
                '<input type="submit" value="Оставить отзыв">' +
            '</div>' +
        '</div>' +
    '</div>';

    $('body').prepend(overlay);
    $('.overlay').css('opacity', '0').animate({'opacity': '1'}, TIMER);
    $('input[type="submit"]').click(() => {
        const message = $('#feedback-message').val();
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timezone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };

        const timestamp = new Date().toLocaleDateString('ru', options);
        const count = rate.reduce((a, c) => a + c);
        
        $.ajax({
            url: '/feedback',
            type: 'POST',
            data: { message, timestamp, count},
            success: () => {
                alert('Отзыв отправлен!');
                $('.feedback').animate({'opacity': '0'}, TIMER, () => $('.feedback').remove());
            },
            error: (err) => alert(`Во время отправки произошла ошибка! ${err}`)
        });
    });
}

function getCurrWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const currWeek = Math.floor(diff / oneWeek) + 1;

    return currWeek%2 ? 1: 2;
}

function hideTable(windowWidth, size) {
    if (windowWidth < size) {
        if(currWeek === 1) {
            $('#week-2').css('display', 'none');
        } else if(currWeek === 2) {
            $('#week-1').css('display', 'none');
        }
    } else if (windowWidth > size) {
        if(currWeek === 1) {
            $('#week-2').css('display', 'table');
        } else if(currWeek === 2) {
            $('#week-1').css('display', 'table');
        } 
    }    
}


