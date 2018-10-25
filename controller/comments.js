"use strict"
const db = require('../controller/common/query')
    , bcrypt = require('bcrypt')
    , jwt = require('jsonwebtoken')
    , CONFIG = require('../config/config')
    , mongoose = require('mongoose');
module.exports = (app) => {
    const router = {};
    router.currentUser = async (req, res) => {
        let user = req.body;
        try {
            let comment = await db.GetOneDocument('users', {"_id": req.body._id}, {});
            res.send({'status': 1, 'data': comment});
        } catch (e) {
            res.send({'status': 0, 'msg': "unable to get user details"});
        }
    }
    router.saveComment = async (req, res) => {
        let data = {
            "users": req.body.user,
            "username": req.body.username,
            "comments": [{
                "_id": mongoose.Types.ObjectId(),
                "text": req.body.text,
                "user": req.body.username,
                "char": (req.body.username).split('')[0].toUpperCase()
    }]
    }
        try {
            let query = [
                {
                    "$project": {
                        'comments': 1,
                    }
                },
                {$unwind: {path: "$comments", preserveNullAndEmptyArrays: true}},
                {$sort: {"comments.date": -1}},
                {
                    '$group': {
                        '_id': null, comments: {"$push": "$comments"}
                    }
                }
            ];
            let user = await db.GetOneDocument('comments', {'users': data.users}, {});

            if (!user) {
                let newComment = await db.InsertDocument('comments', data);
                let count = await db.GetAggregation('comments', query);
                if (count.length > 0) {
                    console.log('----------- ', count[0].comments)
                    res.send({'status': 1, 'data': count[0].comments});
                } else {
                    res.send({'status': 1, 'data': []});
                }
            } else {
                let update_comments = await db.UpdateDocument('comments', {'_id': user._id}, {$push: {comments: data.comments}});
                if (update_comments.nModified === 0) {
                    res.send({'status': 0})
                } else {
                    let size = [
                        {
                            $project: {
                                comments: {$size: "$comments"}
                            }
                        },
                        {$unwind: {path: "$comments", preserveNullAndEmptyArrays: true}},

                    ]
                    let count = await db.GetAggregation('comments', query);
                    if (count.length > 0) {
                        res.send({'status': 1, 'data': count[0].comments});
                    } else {
                        res.send({'status': 1, 'data': []});
                    }
                }
            }
        } catch (e) {
            console.log('eeee = ', e);
        }
    }
    router.getComment = async (req, res) => {
        let user = req.body._id;
        try {
            var comments = await db.GetDocument('comments', {}, {});
            if (!comments) {
                res.send({'status': 0, 'data': {}, 'msg': "No comments"});
            } else {
                let query = [
                    {
                        "$project": {
                            'comments': 1,
                        }
                    },
                    {$unwind: {path: "$comments", preserveNullAndEmptyArrays: true}},
                    {$sort: {"comments.date": -1}},
                    {
                        '$group': {
                            '_id': null, comments: {"$push": "$comments"}
                        }
                    }
                ]
                let count = await db.GetAggregation('comments', query);
                if (count.length > 0) {
                    res.send({'status': 1, 'data': count[0].comments});
                } else {
                    res.send({'status': 1, 'data': []});
                }
            }
        }
        catch
            (e) {
            console.log('ee = ', e)
            res.send({'status': 0, 'msg': 'unable to get comments'});
        }
    }
    router.getcurrentComment = async (req, res) => {
        let slug = req.body.slug;
        let user = req.body._id;
        let index = req.body.index;

        try {
            var comments = await db.GetOneDocument('comments', {users: user}, {
                comments: {$elemMatch: {_id: slug}}
            });
            res.send({'status': 1, 'data': comments});
        } catch
            (e) {
            res.send({'status': 0, 'msg': 'unable to get comments'});
        }
    }
    router.saveReply = async (req, res) => {
        let user = req.body.user;
        let parent = req.body.parent;
        let text = req.body.text;

        try {
            let getuser = await db.GetOneDocument('users', {'_id': mongoose.Types.ObjectId(user)}, {});
            if (!getuser) {
                res.send({'status': 0, 'msg': 'unable to get user details'})
            } else {
                let data = {
                    "replies": [{
                        "_id": mongoose.Types.ObjectId(),
                        "text": text,
                        "parent": parent,
                        "user": getuser.name,
                        "char": (getuser.name).split('')[0].toUpperCase()
                    }]
                }
                let update_comments = await db.UpdateDocument('comments', {
                        // 'users': user,
                        comments: {$elemMatch: {_id: parent}}
                    },
                    {$push: {replies: data.replies}, $inc: {"comments.$.reply_count": 1}}, {multi: true});
                if (update_comments.nModified === 0) {
                    res.send({'status': 0})
                } else {
                    let query = [
                        {
                            $project: {
                                replies: 1
                            }
                        },
                        {$unwind: {path: "$replies", preserveNullAndEmptyArrays: true}},
                        {$match: {"replies.parent": mongoose.Types.ObjectId(parent)}},
                        {$sort: {"replies.date": -1}},
                        {
                            '$group': {
                                '_id': null, reply: {'$push': "$replies"}
                            }
                        }
                    ]
                    let user = await db.GetAggregation('comments', query);
                    res.send({'status': 1, 'data': user})
                }
            }
        } catch (e) {
            console.log('eee = ', e)
        }
    }
    router.getCurrentReplies = async (req, res) => {
        let slug = req.body.slug;
        let userid = req.body._id;
        try {
            let query = [
                {
                    $project: {
                        replies: 1
                    }
                },
                {$unwind: {path: "$replies", preserveNullAndEmptyArrays: true}},
                {$match: {"replies.parent": mongoose.Types.ObjectId(slug)}},
                {$sort: {"replies.date": -1}},
                {
                    '$group': {
                        '_id': null, reply: {'$push': "$replies"}
                    }
                }
            ]
            let user = await db.GetAggregation('comments', query);
            res.send({'status': 1, 'data': user})
        } catch (e) {
            console.log('ee = ', e)
            res.send({'status': 0})
        }
    }
    router.commentLike = async (req, res) => {
        let comment_id = req.body.comment_id;
        try {
            let like = await db.UpdateDocument('comments', {'comments': {$elemMatch: {_id: comment_id}}}, {$inc: {"comments.$.like": 1}});
            let getreply = await db.GetOneDocument('comments', {'comments': {$elemMatch: {_id: comment_id}}}, {'comments': {$elemMatch: {_id: comment_id}}});
            res.send({'status': 1, 'data': getreply})
        } catch (e) {
            console.log('eee = ', e)
        }
    }
    router.replyLike = async (req, res) => {
        let reply_id = req.body.reply_id;
        let comment_id = req.body.comment_id;

        try {
            let like = await db.UpdateDocument('comments', {'replies': {$elemMatch: {_id: reply_id}}}, {$inc: {"replies.$.like": 1}});
            let getreply = await db.GetOneDocument('comments', {'replies': {$elemMatch: {_id: reply_id}}}, {'replies': {$elemMatch: {_id: reply_id}}});
            res.send({'status': 1, 'data': getreply})
        } catch (e) {
            console.log('eee = ', e)
        }
    }
    return router;
}