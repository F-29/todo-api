const mongoose = require('../../config/mongoose-config');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
        unique: true,
        validate: validator.isEmail,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [
        {
            access: {
                type: String,
                required: true,
            },
            token: {
                type: String,
                required: true,
            }
        }
    ]
});

UserSchema.methods.generateAuthToken = function () {
    const access = "auth";
    const token = jwt.sign(
        {
            _id: this._id.toString(),
            access
        },
        'thisIsaSecrete123'
    ).toString();

    this.tokens = this.tokens.concat([{access, token}]);

    return this.save().then(() => {
        return token
    });
};

UserSchema.methods.toJSON = function () {
    return _.pick(this.toObject(), ['_id', 'email']);
};

UserSchema.statics.findByToken = function (token) {
    let decode;
    try {
        decode = jwt.verify(token, 'thisIsaSecrete123');
    } catch (e) {
        return Promise.reject();
    }

    return this.findOne({
        '_id': decode._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
