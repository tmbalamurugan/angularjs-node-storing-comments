const mongoose = require('mongoose');
const schema = mongoose.Schema;

const USER_SCHEMA = {};
USER_SCHEMA.USER = {
    name: {type: String, lowercase: true, trim: true, index: {unique: true}},
    // email: {type: String, lowercase: true, index: {unique: true}, trim: true},
    password: {type: String},
    slug: {type: String, slug: ["name"], unique_slug: true},
    // phone: {
    //     code: String,
    //     number: String
    // },
    token: String,
    status: {type: Number, default: 1} //status 1 active, status 0 inactive
}
module.exports = USER_SCHEMA;