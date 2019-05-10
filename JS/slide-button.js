function slideButtonClick(handler) {
    let btn = $(handler.target);
    const btnClass = btn.attr('class').split(' ')[0];
    let dot;
    if (btnClass === 'slide-button') dot = $(btn.children()[0]);
    else {
        dot = btn;
        btn = $(handler.currentTarget);
    }

    if (btn.attr('sel') === 'false') setEnabled(btn, dot);
    else setDisabled(btn, dot);

    return btn.attr('sel');
}

function setEnabled(btn, dot) {
    btn.attr('sel', 'true');

    const btnWidth = Number(btn.css('width').replace('px', ''));
    const btnPadding = Number(btn.css('padding').replace('px', ''));
    const dotWidth = Number(dot.css('width').replace('px', ''));

    dot.animate({'margin-left': btnWidth - dotWidth - btnPadding * 2 + 'px'}, 200);
    btn.animate({'backgroundColor': 'rgb(1, 185, 1)'}, 200);
}

function setDisabled(btn, dot) {
    btn.attr('sel', 'false');

    dot.animate({'margin-left': "0px"}, 200);
    btn.animate({'backgroundColor': 'rgb(0, 0, 255)'}, 200);
}