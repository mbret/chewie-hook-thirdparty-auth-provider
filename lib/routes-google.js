let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;

module.exports = function(hook, router) {

    /**
     * Return tokens (access, refresh, etc)
     */
    router.get("/auth/google/token", function(req, res) {
        let code = req.query.code;
        let clientId = req.query.clientId;
        let clientSecret = req.query.clientSecret;
        // did not find how to bypass redirect uri. By default we use
        // https://localhost:3000
        let redirectUri = hook.chewie.config.webServerUrl;
        let oauth2Client = new OAuth2(
            clientId,
            clientSecret,
            redirectUri
        );
        oauth2Client.getToken(code, function (err, tokens) {
            if (err) {
                return res.serverError(err);
            }
            return res.ok(tokens);
        });
    });
};