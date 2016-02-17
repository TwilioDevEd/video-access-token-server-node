# Video Quickstart for Node.js

This application should give you a ready-made starting point for writing your
own video chatting apps with Twilio Video. Before we begin, we need to collect
all the credentials we need to run the application:

Credential | Description
---------- | -----------
Twilio Account SID | Your main Twilio account identifier - [find it on your dashboard](https://www.stage.twilio.com/user/account/settings).
Twilio Credential SID | Adds notification ability to your app - [generate one here](https://www.stage.twilio.com/user/account/ip-messaging/credentials)

Create a configuration file for your application:

```bash
cp .env.example .env
```

Edit `.env` with the four configuration parameters we gathered from above.

Next, we need to install our dependencies from npm:

```bash
npm install
```

Now we should be all set! Run the application using the `npm` command.

```bash
npm start
```

Your application should now be running at http://localhost:5000. Now, when your app receives a 'registration' in the form of a POST request from a mobile client, it will send it a notification!

## License

MIT
