const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }, // ⛔ REMOVE `unique: true`
    course: { type: String, required: true },
    courseFees: { type: Number, required: true },
    paidFees: { type: Number, required: true },
    remainingFees: { type: Number, required: true },
    reminderDate: { type: String },
    reminderTime: { type: String }
});

module.exports = mongoose.model('Student', StudentSchema);
