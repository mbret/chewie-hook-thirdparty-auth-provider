# chewie-hook-thirdparty-auth-provider

This chewie hook allow you to use providers (google, facebook, etc) authentication easily with your tasks. Instead of generally
providing authentication token as raw text to the task options fields, you are now able to register several authentication and use token as a placeholder.
The good part of it is that the hook will take care of refreshing your authentication itself and always provide a valid token to the task.

# Quick start (facebook)
1. register a new auth `myAuth1` at [your-chewie-api-url/hooks/chewie-hook-thirdparty-auth-provider](your-chewie-api-url/hook/chewie-hook-thirdparty-auth-provider)
2. Use the placeholder {{hook:chewie-hook-thirdparty-auth-provider:facebook:myAuth1}} inside your task option.
That's all! When the task will need its option to process the action the hook will replace the placeholder with a valid token.

The process is basically the same for any provider.

# Limitations
Due to the life time of tokens and the way each provider handle it, it's possible that at some point an authentication will not be valid anymore.
For example the long living token of Facebook have a lifetime of about 60 days. If your system is not running more than 60 days the hook will not be
able to provide a valid token. Of course you will be notified if the problem occurs but the task will have invalid token as long as you do not update
the authentication.