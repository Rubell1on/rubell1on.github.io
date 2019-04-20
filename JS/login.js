const storedUrl = localStorage.getItem('url');
if(storedUrl)
    location.href = storedUrl;

$(() => {
    $('body').css('opacity', '0')
        .animate({'opacity': '1'}, 200);
});