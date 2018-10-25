'use strict';
angular.module('comments.auth', []);
angular.module('comments.dashboard', []);
angular.module('comments.common', []);

angular.module('comments.site', [
    'ui.router',
    'ngCookies',
    'ui.bootstrap',
    'toastr',
    'ngtimeago',
    'infinite-scroll',
    "comments.auth",
    'comments.dashboard',
    "comments.common"
]);
angular.module('comments.site')
    .config(config)
    .run(run)
    .factory('myHttpInterceptor', function ($location, $rootScope, $q, $cookies) {
        return {
            'request': function (config) {
                $rootScope.imgSrc = "/uploads/images/loader.gif";
                return config || $q.when(config);
            },
            'response': function (response) {
                if (response.data === 'unauthorized') {
                    $cookies.remove('comments');
                    $location.path('/app/login');
                }
                $rootScope.imgSrc = false;
                return response;
            }
        }
    })
    .config(function (toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: true,
            maxOpened: 1,
            tapToDismiss: true,
            closeButton: true,
            closeHtml: '<i class="fa fa-times"></i>'
        });
    })
    .controller('MainCtrl', function ($scope, $rootScope, $http, $cookies, $state, toastr, AuthService, $location) {
        $rootScope.app = $cookies.getObject('comments');
        if (!$rootScope.app || Object.keys($rootScope.app).length === 0) {
            $location.path('/app/login');
            AuthService.clearCredentials()
        } else {
            // $location.path('/app/comments');
            $location.path($location.absUrl());
        }
    })
    .provider('RestApi', function () {
        this.$get = function () {
            return {
                "login": "/api/site/login",
                "signup": "/api/site/signup",
                "getuser": "/api/site/user",
                "comment": "/api/site/save-comment",
                "getcommets": "/api/site/get-comments",
                "getcurrentcommets": "/api/site/get-current-comment",
                "reply": "/api/site/comment-reply",
                "get_reply": "/api/site/get-reply-comments",
                "comment_like": "/api/site/comment-like",
                "reply_like": "/api/site/reply-like"

            };
        }
    })

function run($rootScope, $state, $location, $cookies, $http, $stateParams, $modalStack, $q, AuthService, $transitions, $trace) {
    $rootScope.cms = $cookies.getObject('comments') || {};
    if ($rootScope.cms.username) {
        $http.defaults.headers.common['Authorization'] = $rootScope.cms.authToken;
    }
    // $trace.enable('TRANSITIONS');
    $transitions.onStart({}, function (trans) {
        var auth = trans.injector().get('AuthService');
        if (AuthService.isAuthenticated()) {
            $rootScope.app = $cookies.getObject('comments');
            // console.log('location === ',$location.absUrl())
            $location.path($location.absUrl());
        } else {
            $location.path('/app/login');
        }
    });
}

function config($stateProvider, $urlRouterProvider, $httpProvider, $urlMatcherFactoryProvider, $locationProvider) {

    $httpProvider.interceptors.push('myHttpInterceptor');
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
    $urlMatcherFactoryProvider.defaultSquashPolicy(true);
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path(),
            normalized = path.toLowerCase();

        if (path !== normalized) {
            return normalized;
        }
    });

    $urlRouterProvider.otherwise('/app/comments');
    $stateProvider
        .state('app', {
            url: '/app',
            controller: 'MainCtrl',
            controllerAs: 'MC',
        })
        .state('app.signup', {
            url: '/signup',
            controller: 'AuthController',
            controllerAs: 'AC',
            templateUrl: 'app/site/auth/view/signup.html'
        })
        .state('app.login', {
            url: '/login',
            controller: 'AuthController',
            controllerAs: 'AC',
            templateUrl: 'app/site/auth/view/login.html'
        })
        .state('app.comments', {
            url: '/comments',
            controller: 'CommentController',
            controllerAs: 'CC',
            templateUrl: 'app/site/comments/view/comments.html',
            resolve: {
                currentUser: function (AppService, RestApi, AuthService, $rootScope) {
                    var currentUser = $rootScope.app;
                    var commentApi = {
                        "method": "POST",
                        "url": RestApi.getuser
                    }
                    var data = {
                        "_id": currentUser.username
                    }
                    return AppService.httpRequest(commentApi, data);
                },
                commentResolve: function (AppService, RestApi, $rootScope) {
                    var currentUser = $rootScope.app;

                    var commentApi = {
                        "method": "POST",
                        "url": RestApi.getcommets
                    }
                    var data = {
                        "_id": currentUser.username
                    }

                    return AppService.httpRequest(commentApi, data);
                }
            }
        })
        // .state('app.logout', {
        //     url: '/logout',
        //     controller: 'logoutController',
        //     controllerAs: 'LC',
        // })
        .state('app.reply', {
            url: '/reply/:id',
            controller: 'replyController',
            controllerAs: 'RC',
            templateUrl: 'app/site/comments/view/reply.html',
            resolve: {
                CurrentCommentResolve: function (AppService, RestApi, $rootScope, $stateParams) {
                    var currentUser = $rootScope.app;

                    var commentApi = {
                        "method": "POST",
                        "url": RestApi.getcurrentcommets
                    }
                    var data = {
                        "slug": $stateParams.id,
                        "_id": currentUser.username,
                    }
                    return AppService.httpRequest(commentApi, data);
                },
                CurrentReplyResolve: function (AppService, RestApi, $rootScope, $stateParams) {
                    var currentUser = $rootScope.app;

                    var commentApi = {
                        "method": "POST",
                        "url": RestApi.get_reply
                    }
                    var data = {
                        "slug": $stateParams.id,
                        "_id": currentUser.username,
                    }
                    return AppService.httpRequest(commentApi, data);
                }
            }
        })
}