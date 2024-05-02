const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    attendees: { type: Schema.Types.ObjectId, ref: 'User' },
    connection: { type: Schema.Types.ObjectId, ref: 'Event' },
    status: { 
        type: String, 
        enum: ['YES', 'NO', 'MAYBE'], 
        required: [true, 'Status is required']
    },
}, { timestamps: true });

module.exports = mongoose.model('Rsvp', rsvpSchema);
