import moment from 'moment';

export default {
    dateToString: date => new Date(date).toISOString(),

    isTodayBetweenDates: (dateFrom, dateTo) => {
        const format = 'YYYY-MM-DD HH:mm:ss';
        let validFromTime = moment(dateFrom, format).utc().unix();
        let validToTime = moment(dateTo, format).utc().unix();
        let rightNow = moment(new Date(), format).utc().unix();
        
        if (rightNow - validFromTime < 0) {
            return false;
        }
        if (validToTime - rightNow < 0) {
            return false;
        }

        return true;
    },
};