export const updateModel = async (model, _id, filedsToBeUpdated, transform, errorMessage) => {
    const updatedModel = await model.findOneAndUpdate({ _id, }, filedsToBeUpdated, { upsert: false, new: true, useFindAndModify: false, });
    if (updatedModel) {
        return transform(updatedModel);
    } else {
        throw errorMessage;
    }
};