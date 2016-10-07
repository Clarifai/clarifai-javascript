# Clarifai JavaScript Client

The official JavaScript client for interacting with the [Clarifai API](https://developer-preview.clarifai.com).

## Basic Use

To start, install the SDK via NPM: `npm install clarifai` and initialize with your clientId and
clientSecret:

*This will work in node.js and browsers via [Browserify](http://browserify.org/)*

```js
var Clarifai = require('clarifai');
var app = new Clarifai.App(
  '{clientId}',
  '{clientSecret}'
);

```

You can also use the SDK by adding this script to your HTML:

```js

<script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-2.0.9.js"></script>
<script>
  var app = new Clarifai.App(
    '{clientId}',
    '{clientSecret}'
  );
</script>
```

## Docs

Dive right into code examples to get up and running as quickly as possible with our [Quick Start](https://developer-preview.clarifai.com/quick-start/).

Learn the basics — predicting the contents of an image, searching across a collection and creating your own models with our [Guide](https://developer-preview.clarifai.com/guide/).

Looking for a different client? We have many languages available with lots of documentation [API Reference](https://developer-preview.clarifai.com/reference/)
