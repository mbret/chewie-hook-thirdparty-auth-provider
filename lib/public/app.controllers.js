angular
    .module("app")

    /**
     *
     */
    .controller("IndexCtrl", function() {
        console.log("coucou");
    })

    /**
     *
     */
    .controller("AuthFacebookNew", function($scope, $http, $window) {
        $scope.data = {
            name: null,
            accessToken: null
        };
        $scope.submit = function(form) {
            $http
                .post("auth/facebook", {
                    name: $scope.data.name,
                    accessToken: $scope.data.accessToken,
                    appSecret: $scope.data.appSecret,
                })
                .then(function() {
                    alert("Registered");
                })
                .catch(function(res) {
                    console.error(res);
                    if (res.data.code === "alreadyExist") {
                        alert("an auth with name " + $scope.data.name + " already exist. Try to update instead.");
                    }
                });
        };
    })

    /**
     *
     */
    .controller("AuthFacebookGenerate", function($scope, $http) {
        console.log("AuthFacebookGenerate");

        $scope.submit = function(form) {
            console.log(form);
        };
    })

    /**
     * @see https://developers.google.com/api-client-library/javascript/samples/samples#authorizing-and-making-authorized-requests
     * @see https://developers.google.com/identity/sign-in/web/server-side-flow
     */
    .controller("AuthGoogleGenerate", function($scope, $http, CONFIG) {
        $scope.googleSdkLoading = true;
        $scope.tokenGenerated = null;
        $scope.alerts = [];
        $scope.data = {
            clientId: null,
            scopes: "profile",
            redirectUri: CONFIG.defaultGoogleRedirectUri
        };

        // load google sdk
        gapi.load('auth2', function() {
            $scope.$apply(function() {
                $scope.googleSdkLoading = false;

                $scope.submit = function(form) {
                    if (form.$valid) {
                        $scope.tokenGenerated = null;
                        // init js sdk for this client id
                        gapi.auth2
                            .init({
                                clientId: $scope.data.clientId,
                                scope: $scope.data.scopes,
                            })
                            .then(function(response) {
                                let GoogleAuth = gapi.auth2.getAuthInstance();

                                return GoogleAuth.grantOfflineAccess({
                                    prompt: "consent",
                                    scope: $scope.data.scopes,
                                }).then(function(res) {
                                    $http
                                        .get("auth/google/token", {params: {
                                            code: res.code,
                                            clientId: $scope.data.clientId,
                                            clientSecret: $scope.data.clientSecret
                                        }})
                                        .then(function(response) {
                                            $scope.tokenGenerated = response.data;
                                        })
                                        .catch(function(err) {
                                            console.error("Error on api", err);
                                            $scope.alerts = [];
                                            $scope.alerts.push({msg: "Error on api", type: "danger"});
                                        });
                                });
                            }, function(reason) {
                                $scope.$apply(function() {
                                    $scope.alerts = [];
                                    $scope.alerts.push({msg: reason.details, type: "danger"});
                                });
                            });
                    }
                }
            });
        });
    });