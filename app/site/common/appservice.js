'use strict'
var app = angular.module('comments.common')
app.factory('AppService', AppService);
AppService.$inject = ['$http', '$q', '$rootScope', '$cookies'];
function AppService($http, $q) {
    var appService = {};
    appService.httpRequest = function (api, data) {
        const deferred = $q.defer()
        $http({
            method: api.method,
            url: api.url,
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        },function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    return appService;
}
