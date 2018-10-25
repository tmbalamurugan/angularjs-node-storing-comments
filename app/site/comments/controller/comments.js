angular.module('comments.dashboard').controller('CommentController', CommentController);
CommentController.$inject = ["$state", "$rootScope", "toastr", "RestApi", "AppService", 'currentUser', 'commentResolve']

function CommentController($state, $rootScope, toastr, RestApi, AppService, currentUser, commentResolve) {
    var cc = this;
    cc.commentUser = currentUser.data.name;
    if (commentResolve.data.length > 0) {
        cc.comments = commentResolve.data;
    }
    if (angular.isDefined(currentUser)) {
        cc.currentUser = currentUser.data;
    }

    cc.comment = function (valid, data) {
        if (valid) {
            var data = {
                user: cc.currentUser._id,
                username: cc.currentUser.name,
                text: data.comment
            }
            var commentApi = {
                "method": "POST",
                "url": RestApi.comment
            }
            AppService.httpRequest(commentApi, data).then(function (data) {
                if (data.status === 1) {
                    cc.comments = data.data;
                }
            }).catch(function (err) {
                console.log('err = ', err);
            });
        } else {
            toastr.error('Unable to save data');
        }
    }
    cc.like = function (comment, index) {
        var index = index
        var likeApi = {
            "method": "POST",
            "url": RestApi.comment_like
        }
        AppService.httpRequest(likeApi, {comment_id: comment._id}).then(function (data) {
            if (data) {
                cc.comments[index].like = data.data.comments[0].like;
            }
        }).catch(function (err) {
            console.log('err = ', err);
        });
    }
}

angular.module('comments.dashboard').controller('replyController', replyController);
replyController.$inject = ["$state", "$rootScope", "toastr", "RestApi", "AppService", "CurrentCommentResolve", "CurrentReplyResolve", "$location"]

function replyController($state, $rootScope, toastr, RestApi, AppService, CurrentCommentResolve, CurrentReplyResolve, $location) {
    var rc = this;
    rc.user = $rootScope.app.username;
    if (angular.isDefined(CurrentReplyResolve.data[0])) {
        rc.replies = CurrentReplyResolve.data[0].reply;
    }
    var commentId = $location.$$path.split('/').pop()
    rc.replycomment = function (valid, data) {
        if (valid) {
            var data = {
                user: rc.user,
                parent: commentId,
                text: data
            }
            var commentApi = {
                "method": "POST",
                "url": RestApi.reply
            }
            AppService.httpRequest(commentApi, data).then(function (data) {
                if (data.status === 1) {
                    rc.replies = data.data[0].reply;
                    // $state.go('app.reply', {id: commentId}, {reload: true});
                }
            }).catch(function (err) {
                console.log('err = ', err);
            });
        } else {
            toastr.error('Unable to save data');
        }
    }

    rc.like_reply = function (reply, key) {
        var key = key;
        var likeApi = {
            "method": "POST",
            "url": RestApi.reply_like
        }
        AppService.httpRequest(likeApi, {reply_id: reply._id, comment_id: commentId}).then(function (data) {
            if (data) {
                rc.replies[key].like = data.data.replies[0].like;
            }
        }).catch(function (err) {
            console.log('err = ', err);
        });
    }
}