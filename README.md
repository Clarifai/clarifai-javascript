![Clarifai logo](logo.png)

# Clarifai API JavaScript Client

This is the official JavaScript client for interacting with our powerful recognition 
[API](https://developer.clarifai.com). The Clarifai API offers image and video recognition as a service. Whether you 
have one image or billions, you are only steps away from using artificial intelligence to recognize your visual content.

* Try the Clarifai demo at: https://clarifai.com/demo
* Sign up for a free account at: https://clarifai.com/developer/account/signup/
* Read the developer guide at: https://clarifai.com/developer/guide/


[![Build Status](https://travis-ci.org/Clarifai/clarifai-javascript.svg?branch=master)](https://travis-ci.org/Clarifai/clarifai-javascript)
[![npm version](https://badge.fury.io/js/clarifai.svg)](https://badge.fury.io/js/clarifai)

## Installation
Install the API client:
```
npm install clarifai
```

## Basic Use

Firstly, generate your Clarifai API key [on the API keys page](https://clarifai.com/developer/account/keys). The client
uses it for authentication.

Then, use the code below to create a `Clarifai.App` instance using which you interact with the client.

```js
const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'YOUR_API_KEY'
});
```

*This will work in node.js and browsers via [Browserify](http://browserify.org/).*

You can also use the SDK by adding this script to your HTML:

```html
<script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-latest.js"></script>
```

## Documentation

Dive right into code examples to get up and running as quickly as possible with our [Quick Start](https://developer.clarifai.com/quick-start/).

Learn the basics — predicting the contents of an image, searching across a collection and creating your own models with our [Guide](https://developer.clarifai.com/guide/).

Check out the [JSDoc](https://sdk.clarifai.com/js/latest/index.html) for a deeper reference.

Looking for a different client? We have many languages available with lots of documentation [Technical Reference](https://clarifai.com/developer/reference)

## React Native

You'll most likely encounter the error `process.nextTick is not a function` while using this library with React Native.

To solve this, add `process.nextTick = setImmediate;` as close to the top of your entrypoint as you can. See [#20](https://github.com/Clarifai/clarifai-javascript/issues/20) for more info.


## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
