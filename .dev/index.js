'use strict';

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

const chewie = require("chewie-system");

// Start the system
chewie.start({
    settings: {
        system: {
            tmpDir: "./.chewie/.tmp",
            appDataPath: "./.chewie"
        },
        hooks: {
            // "client-web-server": false,
            "scenarios": false,
            "plugins": false,
            "chewie-hook-thirdparty-auth-provider": {
                // required because of symlink
                modulePath: __dirname + "/..",
                config: {
                    facebook: {
                        appId: "105360643322915"
                    }
                }
            }
        }
    }
});