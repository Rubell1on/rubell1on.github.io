const popup = localStorage.getItem('popup');

$('.donations').click(showDonations);

if(!popup) {
    showDonations();
}

function showDonations() {
    const popupString = 
    '<div class="popup-wrapper">' +
        //'<div class="popup-picture"></div>' +
        '<div class="popup-message">' + 
            '<p>Привет!</p>' +
            '<p>Данное приложение не является коммерческим, встроенной рекламы и других раздражающих баннеров вы не увидите. Если вам нравится, а также удобно пользоваться приложением буду рад скромной благодарности;) Перевод можно осуществить по номеру карты Сбербанка или по номеру телефона. Также можете просто закинуть денег на указанный ниже номер.<br><br> <img class="card" alt="Карта" src="/public/IMG/credit_card.png"><b> - 5336 6900 6201 4024</b><br> <img class="phone" alt="Тел." src="/public/IMG/phone.png"> <b> -  89232840923</b>' +
            '</p>' +
        '</div>' +
        '<div class="popup-checkbox">' +
            '<input type="checkbox" id="checkbox">' +
            '<span class="checkmark"></span>' +
            '<label for="checkbox">Больше не показывать</label>' +
        '</div>' +
        '<div class="popup-button">Закрыть</div>' +
    '</div>';

    $('body').append(popupString);
    $('.popup-wrapper').animate({'opacity': 1}, 200, () => {
        $('.popup-button').click(() => {
            const checkbox = $('#checkbox').is(':checked');
            if (checkbox) localStorage.setItem('popup', true);
            const wrapper = $('.popup-wrapper');
            wrapper.animate({'opacity': 0}, 200, () => wrapper.remove());
        });
    });
}



