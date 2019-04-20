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