'use strict'
var app = angular.module('comments.auth')
app.factory('AuthService', AuthService);
AuthService.$inject = ['$http', '$q', '$rootScope', '$cookies'];

function AuthService($http, $q, $rootScope, $cookies) {
    var authservice = {};
    authservice.setCredentials = function (name, token) {
        var authdata = token;
        $rootScope.currentUser = {
            username: name,
            authToken: token
        }
        $http.defaults.headers.common['Authorization'] = authdata;
        $cookies.putObject('comments', $rootScope.currentUser);
    };
    authservice.getCredential = function () {
        return $rootScope.currentUser;
    }
    authservice.clearCredentials = function () {
        $rootScope.currentUser = {}
        $cookies.remove('comments');
        $http.defaults.headers.common.Authorization = '';
    }
    authservice.isAuthenticated = function () {
        var user = $cookies.getObject('comments');
        if(!user || Object.keys(user).length === 0) {
            return false;
        } else {
            return true;
        }
    }
    return authservice;
}