# chewie-hook-thirdparty-auth-provider

This chewie hook allow you to use providers (google, facebook, etc) authentication easily with your tasks. Instead of generally
providing authentication token in raw to the task options, you are now able to register several authentication and use token as a placeholder
The good part of it is that the hook will take care of refreshing your authentication itself and always provide a valid token to the task.

# Quick start (facebook)
1. register a new auth `myAuth1` at [your-chewie-url/hook/chewie-hook-thirdparty-auth-provider](your-chewie-url/hook/chewie-hook-thirdparty-auth-provider)
2. Use the placeholder {{hook:chewie-hook-thirdparty-auth-provider:facebook:myAuth1}} inside your task option.
That's all! When the task will need its option to process the action the hook will replace the placeholder with a valid token.

The process is basically the same for any provider.