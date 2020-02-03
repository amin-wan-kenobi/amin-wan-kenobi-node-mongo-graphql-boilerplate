import expect from 'expect';
import moment from 'moment';
import dateUtil from '../../helpers/date-util';

describe('---------------------- DATE UTIL TEST ----------------------', () => {
    
    it('should successfully returns true when today is between two dates', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should successfully returns true when today is between two dates - validFrom is today as well but hour has already passed', () => {
        let validFrom = moment(new Date()).subtract(2, 'hours');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should successfully returns true when today is between two dates - validFrom is today, hour is this hour but minute has already passed', () => {
        let validFrom = moment(new Date()).subtract(2, 'minutes');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should successfully returns true when today is between two dates - validFrom is today and at this hour and minute, but seconds has already passed', () => {
        let validFrom = moment(new Date()).subtract(2, 'seconds');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should successfully returns true when today is between two dates - validTo is today, but the hour has not come yet', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).add(2, 'hours');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should successfully returns true when today is between two dates - validTo is today, hour is now but the minute has not come yet', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).add(2, 'minutes');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should successfully returns true when today is between two dates - validTo is today, hour is now and so is the minute but the second has not come yet', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).add(2, 'seconds');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeTruthy();
    });

    it('should fail if validFrom has not come yet - day', () => {
        let validFrom = moment(new Date()).add(2, 'days');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validFrom has not come yet - day has come but not the hour', () => {
        let validFrom = moment(new Date()).add(2, 'hours');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validFrom has not come yet - day and hour have come but not the minute', () => {
        let validFrom = moment(new Date()).add(2, 'minutes');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validFrom has not come yet - day, hour and minutes are there but but not the second', () => {
        let validFrom = moment(new Date()).add(2, 'seconds');
        let validTo = '2055-08-14T20:00:00.391Z';

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validTo has already passed - day', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).subtract(2, 'days');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validTo has already passed - day is today but the hour has already passed', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).subtract(2, 'hours');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validTo has already passed - day and hours are now but the minute has already passed', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).subtract(2, 'minutes');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });

    it('should fail if validTo has already passed - day and hours and minutes are now but the second has already passed', () => {
        let validFrom = '2018-08-15T10:50:00.391Z';
        let validTo = moment(new Date()).subtract(2, 'seconds');

        const result = dateUtil.isTodayBetweenDates(validFrom, validTo);
        expect(result).toBeFalsy();
    });
});