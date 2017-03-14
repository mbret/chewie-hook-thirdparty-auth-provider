angular
    .module("app", ["ngRoute"])
    .constant("CONFIG", window.CONFIG)
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider.otherwise({redirectTo: '/'});
        $routeProvider
            .when('/', {
                templateUrl: 'detail.html',
                controller: 'IndexCtrl'
            })
            .when("/auth/facebook/new", {
                templateUrl: "auth-facebook-new.html",
                controller: "AuthFacebookNew"
            })
            .when("/auth/facebook/generate", {
                templateUrl: "auth-facebook-generate.html",
                controller: "AuthFacebookGenerate"
            })
            .when("/auth/google/generate", {
                templateUrl: "auth-google-generate.html",
                controller: "AuthGoogleGenerate"
            })
    }])
    .run(function($window, $rootScope) {
        $rootScope.CONFIG = $window.CONFIG;
        $rootScope.facebook = {};
        $window.fbAsyncInit = function() {
            // Executed when the SDK is loaded
            FB.init({
                appId: $window.CONFIG.facebook.appId,
                channelUrl: 'app/channel.html',
                status: true,
                cookie: true,
                xfbml: true,
                version: 'v2.4'
            });
            FB.getLoginStatus(function(response) {
                console.info("FB.getLoginStatus", response);
                if (response.status === 'connected') {
                    onFacebookConnected(response);
                    FB.logout();
                } else if (response.status === 'not_authorized') {
                    // the user is logged in to Facebook,
                    // but has not authenticated your app
                    console.error("app not authenticated");
                } else {
                    FB.login(function(response) {
                        onFacebookConnected(response);
                    });
                }
            });
        };
        // facebook sdk
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        function fillFacebookData(response) {
            $rootScope.facebook.status = response.status;
            $rootScope.facebook.id = response.authResponse.userID;
            $rootScope.facebook.accessToken = response.authResponse.accessToken;
            $rootScope.facebook.expiresIn = response.authResponse.expiresIn;
        }

        function onFacebookConnected(response) {
            fillFacebookData(response);
            FB.api("/me", function(res) {
                $rootScope.facebook.name = res.name;
                $rootScope.$apply();
            });
        }
    });