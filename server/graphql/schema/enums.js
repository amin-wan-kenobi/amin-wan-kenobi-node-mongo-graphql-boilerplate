import status from '../../constants/status';
import orderStatus from '../../constants/orderStatus';

const enumSchemaString = `
    enum DaysOfWeek {
        Mon
        Tue
        Wed
        Thu
        Fri
        Sat
        Sun
    }
    enum ModelStatus {
        ${status.Active}
        ${status.Inactive}
    }
    enum OrderStatus {
        ${orderStatus.Completed}
        ${orderStatus.Cancelled}
        ${orderStatus.Pending}
    }
    `;

export default enumSchemaString;