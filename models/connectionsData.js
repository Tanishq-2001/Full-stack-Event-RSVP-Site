
const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
    title: {type: String, required: [true, 'Title is required']},
    category: {type: String,enum: ['Committee Events', 'Group Events', 'On-Campus Events', 'Off-Campus Events', 'Festival Meet'],required: true},
    hostedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    details: {type: String, required: [true, 'Details is required']},
    // date: {type: String, required: [true, 'Date is required']},
    // starttime: {type: String, required: [true, 'Time is required']},
    // endtime: {type: String, required: [true, 'Time is required']},
    startDateTime: { type: Date, required: [true, 'Start date & time is required'] },
    endDateTime: { type: Date, required: [true, 'End date & time is required'] },
    where: {type: String, required: [true, 'Location is required']},
    email: {type: String, required: [true, 'Duration is required']},
    contactPerson: {type: String, required: [true, 'Duration is required']},
    image: { type: String, required: [true, 'Image upload is required'] }
}

)

module.exports = mongoose.model('Event', connectionSchema);

