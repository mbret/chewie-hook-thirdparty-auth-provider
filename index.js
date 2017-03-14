const EventEmitter = require("events");
const packageInfo = require("./package.json");
let _ = require("lodash");
let router = require('express').Router();
let FB = require('fb');
let debug = require('debug');
let express = require("express");
let STORAGE_KEY = "saved-auth";
let STORAGE_KEY_FACEBOOK = STORAGE_KEY + ":facebook";
let DEBUG_KEY = "chewie:hooks:" + packageInfo.name;

/**
 * class AuthServiceTokenGenerator
 *
 * docs:
 * https://github.com/node-facebook/facebook-node-sdk
 * https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension
 */
class AuthServiceTokenGenerator extends EventEmitter {

    /**
     * @param {Object} chewie
     * @param {Object} config
     * @param {Object} helper
     */
    constructor(chewie, config, helper) {
        super();
        this.chewie = chewie;
        this.config = config;
        this.helper = helper;
        this.logger = this.chewie.logger.getLogger("hooks:" + packageInfo.name);
        this.baseUrl = this.chewie.config.webServerUrl + "/hooks/" + packageInfo.name;
    }

    /**
     * @returns {Promise}
     */
    initialize() {
        let self = this;

        // Register partial web app and server routes
        this.chewie.on("hook:client-web-server:initialized", function() {
            let clientWebServer = self.chewie.hooks["client-web-server"];
            require(__dirname + "/lib/partial-server-routes")(self, router);
            require(__dirname + "/lib/routes-google")(self, router);
            clientWebServer.app.use("/hooks/" + packageInfo.name, express.static(__dirname + "/lib/public"));
            clientWebServer.app.use("/hooks/" + packageInfo.name, router);
        });

        // Run watchers
        this.chewie.on("ready", function() {
            // display helpful info to user to console.
            self.logger.info("The direct routes to retrieve access token is %s", self.baseUrl);

            // check and refresh active tokens
            self.helper.getStorage(STORAGE_KEY_FACEBOOK)
                .then(function(data) {
                    _.forEach(data, function(value, key) {
                        self._watchFacebookToken(key);
                    });
                });
        });

        // init the hook storage
        return this.helper.initStorage(STORAGE_KEY_FACEBOOK, {});
    }

    onShutdown() {
        this.emit("shutdown");
        return Promise.resolve();
    }

    _retrieveFacebookLongLivingToken(accessToken, appSecret) {
        let self = this;
        FB.setAccessToken(accessToken);
        return new Promise(function(resolve, reject) {
            FB.api('oauth/access_token', {
                client_id: self.config.facebook.appId,
                client_secret: appSecret,
                grant_type: "fb_exchange_token",
                fb_exchange_token: FB.getAccessToken()
            }, function(response) {
                // { error:
                // { message: 'Error validating access token: Session has expired on Wednesday, 22-Feb-17 11:00:00 PST. The current time is Wednesday, 22-Feb-17 11:00:50 PST.',
                //     type: 'OAuthException',
                //     code: 190,
                //     error_subcode: 463,
                //     fbtrace_id: 'DKBd6eFwMOy' } }
                if(!response || response.error) {
                    console.log(response);
                    return reject(new Error(response.error.message));
                }

                return resolve(response);
            });
        });
    }

    _watchFacebookToken(name) {
        let self = this;
        debug(DEBUG_KEY)("start watching facebook token refresh for %s", name);

        // always retrieve a new token
        refreshToken();
        let timer = setInterval(refreshToken, 86400000); // every 24 hours
        self.on("shutdown", function() {
            clearInterval(timer);
        });

        function refreshToken() {
            self.helper.getStorage(STORAGE_KEY_FACEBOOK)
                .then(function(data) {
                    if (!data[name]) {
                        return new Error("Storage " + STORAGE_KEY_FACEBOOK + " should exist for name " + name);
                    }
                    self._retrieveFacebookLongLivingToken(data[name].accessToken, data[name].appSecret)
                        .then(function(response) {
                            return self.helper.setStorage(STORAGE_KEY_FACEBOOK, {
                                [name]: {accessToken: response.access_token}
                            }, {partial: true})
                                .then(function() {
                                    debug(DEBUG_KEY)("Facebook access token for [%s] has been updated and is valid for approximately %s days", name, Math.round(response.expires / 60 / 60 / 24));
                                });
                        })
                })
                .catch(function(err) {
                    console.error(err);
                });
        }
    }
}

module.exports = AuthServiceTokenGenerator;
