let rate = [0, 0, 0, 0, 0];

const START_POS = 0;
const END_POS = -30;

const html = $('.rate');

html.hover(
    handler => {
    const id = $(handler.target).attr('id').slice(2);
    for (let i = 0; i <= parseInt(id); i++) {
        $(`.rate#id${i}`).css('background-position-y', `${END_POS}px`);
    }
}, () => {
    rate.forEach((r, i) => {
        const elm = $(`.rate#id${i}`);
        if (r) {
            elm.css('background-position-y', `${END_POS}px`);
        } else {
            elm.css('background-position-y', `${START_POS}px`);
        }
    });   
});

html.click(handler => {
    const id = $(handler.target).attr('id').slice(2);
    for (let i = 0; i < rate.length; i++) {
        const elm = $(`.rate#id${i}`);
        if (i <= parseInt(id)) {
            rate[i] = 1;
            elm.css('background-position-y', `${END_POS}px`);
        } else {
            rate[i] = 0;
            elm.css('background-position-y', `${START_POS}px`);
        } 
    } 
});

async function showFeedback() {
    const feedback = await getFeedback();
    const blocks = makeBlocks(feedback);
    appendBlocks(blocks, feedback);
}

function appendBlocks(blocks, feedback) {
    blocks.forEach((block, ind) => {
        $('.wrapper').append(block);
        const children = $(`#block${ind}`).children();
        const rate = feedback[ind][2];
        for (let i = 0; i < rate; i++) {
            $(children[i]).css('background-position-y', `${END_POS}px`);
        }
    });
}

function makeBlocks(feedback) {
    return feedback.reduce((acc, m, i) => {
        acc[i] = '<div class="feedback-wrapper">' +
            '<div class="top-bar">' +
                `<div class="timestamp">${m[1].replace(/T\d{2}:\d{2}:\d{2}/g, '')}</div>` +
                `<div id="block${i}" class=block>` +
                    `<div class="rate" id="id0"></div>` +
                    `<div class="rate" id="id1"></div>` +
                    `<div class="rate" id="id2"></div>` +
                    `<div class="rate" id="id3"></div>` +
                    `<div class="rate" id="id4"></div>` +
                '</div>' +
            '</div>' +
            `<div class="message">${m[0]}</div>` +
        '</div>';
        return acc;
    }, []);
}

function getFeedback() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/feedback',
            type: 'GET',
            data: {json: true},
            success: (data) => {
                resolve(data);
            },
            error: (err) => {
                console.log(`Произошла ошибка! ${JSON.stringify(err)}`);
                reject(err);
            }
        });
    });
}