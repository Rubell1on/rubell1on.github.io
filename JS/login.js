if(localStorage.length)
    location.href = localStorage.getItem('url');

$(() => {
    $('body').css('opacity', '0')
        .animate({'opacity': '1'}, 200);
});