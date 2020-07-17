export default class Week {
    static get currWeek() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const currWeek = Math.floor(diff / oneWeek) + 1;
    
        return currWeek;
    }

    static get currStudyWeek() {
        const halfYear = this.halfYear;
        let subtrahend;
        if (halfYear === 'spring') {
            subtrahend = 5;
        } else if (halfYear === 'autumn') {
            subtrahend = 33;
        }
    
        return this.currWeek - subtrahend;
    }

    static get halfYear() {
        const month = new Date().getMonth();
        const springMonth = [0, 1, 2, 3, 4, 5, 6, 7];
        return springMonth.includes(month) ? 'spring': 'autumn'; 
    }

    static get parity() {
        this.currStudyWeek % 2 === 0 ? this.weekParity.odd : this.weekParity.even
    }

    static get weekParity() {
        return {even: 1, odd: 2};
    }
}