const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const partySchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
       
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    gstNumber: {
        type: String,
        uppercase: true,
        trim: true
    },

    phoneNumber: {
        type: String,
           validate: {
        validator: function(v) {
            return !v || /^[0-9]{10}$/.test(v);
        },
        message: 'Enter valid 10 digit number'
    }
    },

    address: {
        type: String,
        trim: true
    },

    category: {
        type: String,
        enum: ['Customer', 'Supplier'],
        required: true
    }

}, { timestamps: true });

partySchema.pre('save', async function (next) {
    if (!this.isNew) return next();

    const counter = await Counter.findOneAndUpdate(
        { name: 'partyId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

   this.id = counter.seq;
    next();
});

module.exports = mongoose.model('Party', partySchema);