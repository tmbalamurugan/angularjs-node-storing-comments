angular.module('comments.auth').controller('AuthController', AuthController);
AuthController.$inject = ["$state", "$rootScope", "toastr", "RestApi", "AppService", "AuthService"]

function AuthController($state, $rootScope, toastr, RestApi, AppService, AuthService) {
    const ac = this;
    ac.login = function (valid, form) {
        if (valid) {
            const loginApi = {
                "method": "POST",
                "url": RestApi.login
            };
            AppService.httpRequest(loginApi, form).then(function (data) {
                if(data.status === 1){
                    AuthService.setCredentials(data.data._id, data.token);
                    $state.go('app.comments');
                }else{
                    toastr.error('Unable to login')
                }
            }).catch(function (err) {
                console.log('err = ', err);
            });
        } else {
            toastr.info('Please enter all fields');
        }
    }
    ac.signUp = function (valid, form) {
        if (valid) {
            const signupApi = {
                "method": "POST",
                "url": RestApi.signup
            };
            AppService.httpRequest(signupApi, form).then(function (data) {
                $state.go('app.login',{}, {reload:false});
            }).catch(function (err) {
                console.log('err = ', err);
            });
        } else {
            toastr.info('Please enter all fields');
        }
    }
}


