const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const COMMENTS_SCHEMA = {};
COMMENTS_SCHEMA.COMMENTS = {
    users: {type: Schema.Types.ObjectId, ref: 'users'},
    username: String,
    // slug: {type: String, slug: ["username", Schema.Types.ObjectId], unique_slug: true},
    comments: [{
        _id: Schema.Types.ObjectId,
        user: String,
        char: String, //first letter of name
        text: String,
        like: {type: Number, default: 0},
        status: {type: Number, default: 1},
        date: {type: Date, default: Date.now},
        reply_count: {type: Number, default: 0}
    }],
    replies: [{
        _id: Schema.Types.ObjectId,
        parent: Schema.Types.ObjectId,//comment _id
        user: String,
        char: String,//first letter of name
        text: String,
        like: {type: Number, default: 0},
        status: {type: Number, default: 1},
        date: {type: Date, default: Date.now}
    }],
    comment_size: {type: Number, default: 0},
    reply_size: {type: Number, default: 0},
    status: {type: Number, default: 1}
}
module.exports = COMMENTS_SCHEMA;
