[![Build Status](https://travis-ci.org/Clarifai/clarifai-javascript.svg?branch=master)](https://travis-ci.org/Clarifai/clarifai-javascript)
[![npm version](https://badge.fury.io/js/clarifai.svg)](https://badge.fury.io/js/clarifai)

# Clarifai JavaScript Client

The official JavaScript client for interacting with the [Clarifai API](https://clarifai.com/developer/guide/).

## Basic Use

To start, install the SDK via NPM: `npm install clarifai` and initialize with your api key:

*This will work in node.js and browsers via [Browserify](http://browserify.org/)*

```js
const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'YOUR_API_KEY'
});
```

You can also use the SDK by adding this script to your HTML:

```html
<script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-latest.js"></script>
```

## React Native

You'll most likely encounter the error `process.nextTick is not a function` while using this library with React Native.

To solve this, add `process.nextTick = setImmediate;` as close to the top of your entrypoint as you can. See [#20](https://github.com/Clarifai/clarifai-javascript/issues/20) for more info.

## Docs

Dive right into code examples to get up and running as quickly as possible with our [Quick Start](https://developer.clarifai.com/quick-start/).

Learn the basics — predicting the contents of an image, searching across a collection and creating your own models with our [Guide](https://developer.clarifai.com/guide/).

Check out the [JSDoc](https://sdk.clarifai.com/js/latest/index.html) for a deeper reference.

Looking for a different client? We have many languages available with lots of documentation [Technical Reference](https://clarifai.com/developer/reference)

## Deploying

See [DEPLOY.md](DEPLOY.md) for instructions.
