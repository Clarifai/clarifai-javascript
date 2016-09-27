# Clarifai JavaScript Client

The official JavaScript client for interacting with the [Clarifai API](https://developer.clarifai.com).

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

<script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-2.0.2.js"></script>
<script>
  var app = new Clarifai.App(
    '{clientId}',
    '{clientSecret}'
  );
</script>
```

## Table of Contents

#### Tag

* [Get tags for an image via URL](#get-tags-for-an-image-via-url)
* [Get tags for multiple images via url](#get-tags-for-multiple-images-via-url)
* [Get tags for an image via image bytes](#get-tags-for-an-image-via-image-bytes)

#### Color

* [Get colors for an image via url](#get-colors-for-an-image-via-url)

#### Token

* [Get a token](#get-a-token)
* [Set a token](#set-a-token)

#### Promises and Callbacks

* [Instructions](#promises-and-callbacks)

## Examples

### Tag

#### Get tags for an image via url

```js
// give model id
app.models.predict('aaa03c23b3724a16a56b629203edc62c', 'https://samples.clarifai.com/wedding.jpg').then(
  handleResponse,
  handleError
);

// or if you have model object via app.models.get or app.models.search
model.predict('https://samples.clarifai.com/wedding.jpg').then(
  handleResponse,
  handleError
);
```

#### Get tags for multiple images via url

```js
app.models.predict('aaa03c23b3724a16a56b629203edc62c', [
  'https://samples.clarifai.com/wedding.jpg',
  'https://samples.clarifai.com/cookies.jpeg'
]).then(
  handleResponse,
  handleError
);
```

#### Get tags for an image via image bytes

```js
app.models.predict('aaa03c23b3724a16a56b629203edc62c', 'R0lGODlhZAHIAPcAAKeno6Oinc3Do6iVeMe7o1ZEM...').then(
  handleResponse,
  handleError
);
```

### Color

#### Get colors for an image via url

```js
app.models.predict('eeed0b6733a644cea07cf4c60f87ebb7', 'https://samples.clarifai.com/wedding.jpg').then(
  handleResponse,
  handleError
);
```

#### Get colors for an image via image bytes

```js
app.models.predict('eeed0b6733a644cea07cf4c60f87ebb7', 'R0lGODlhZAHIAPcAAKeno6Oinc3Do6iVeMe7o1ZEM...').then(
  handleResponse,
  handleError
);
```

### Token

#### Get a token

**Note:** You should not have to call this directly in most cases. Any method that needs a token will call
it for you.

```js
Clarifai.getToken().then(
  function(response) {
    console.log(response);
  },
  function(err){
    console.log(err);
  }
);
```

#### Set a token

```js
var tokenSetBoolean = Clarifai.setToken('some-token-string');
```

### Promises and Callbacks

All methods return promises. If there are multiple params and some are optional, you'll need to pass in `null` for
those.
