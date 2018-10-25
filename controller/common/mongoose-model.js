const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');


/****** new db schema ***/
const user_schema = require('../../schema/users.schema')
    , comment_schema = require('../../schema/comment.schema');

// /*** define schema to out model */
const userSchema = mongoose.Schema(user_schema.USER, {timestamps: true, versionKey: false})
    , commentsSchema = mongoose.Schema(comment_schema.COMMENTS, {timestamps: true, versionKey: false})

mongoose.plugin(slug);
// /*** create model for our app */
const users = mongoose.model('users', userSchema, 'users')
    , comments = mongoose.model('comments', commentsSchema, 'comments')

var options = {
    separator: "-",
    lang: "en",
    truncate: 120
}
mongoose.plugin(slug, options);

module.exports = {
    "users": users,
    "comments": comments
}
