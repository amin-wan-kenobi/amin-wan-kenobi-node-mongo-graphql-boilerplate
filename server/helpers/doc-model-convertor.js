export default genericModel => {
    return {
        ...genericModel._doc,
        _id: genericModel.id,
    };
};