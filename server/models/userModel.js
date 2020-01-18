const mongoose = require('../../config/mongoose-config');

const UserModel = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
    }
});

module.exports = UserModel;
