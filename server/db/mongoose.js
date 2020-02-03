import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

export { mongoose, };

export const connectToDB = url => {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            url,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
            }
        )
        .then(() => resolve())
        .catch(e => reject(e));
    });
};