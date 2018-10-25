'use strict'
const jwt = require('jsonwebtoken')
    , CONFIG = require('../config/config')

function isLoggedIn(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, CONFIG.secret, function (err, decoded) {
            if (err) {
                return res.send('unauthorized');
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.send('unauthorized');
    }
}

module.exports = (app) => {
    const user = require('../controller/site')(app);
    const comments = require('../controller/comments')(app);

    try {
        app.post('/api/site/login', user.login);
        app.post('/api/site/signup', user.signup);

        app.post('/api/site/user', isLoggedIn, comments.currentUser)
        app.post('/api/site/save-comment', isLoggedIn, comments.saveComment)
        app.post('/api/site/get-comments', isLoggedIn, comments.getComment)
        app.post('/api/site/get-current-comment', isLoggedIn, comments.getcurrentComment)
        app.post('/api/site/comment-reply', isLoggedIn, comments.saveReply)
        app.post('/api/site/get-reply-comments', isLoggedIn, comments.getCurrentReplies)
        app.post('/api/site/comment-like', isLoggedIn, comments.commentLike)
        app.post('/api/site/reply-like', isLoggedIn, comments.replyLike)

    } catch (err) {
        console.log('err in routes ', err);
    }
}
