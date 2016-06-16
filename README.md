# Clarifai JavaScript Client

The official JavaScript client for interacting with the [Clarifai API](https://developer.clarifai.com).

## Basic Use

To start, install the SDK via NPM: `npm install clarifai` and initialize with your clientId and
clientSecret:

*This will work in node.js and browsers via [Browserify](http://browserify.org/)*

```js
var Clarifai = require('clarifai');

Clarifai.initialize({
  'clientId': '{clientId}',
  'clientSecret': '{clientSecret}'
});

```

You can also use the SDK by adding this script to your HTML:

```js
<script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-1.2.1.js"></script>
<script>
  Clarifai.initialize({
    'clientId': '{clientId}',
    'clientSecret': '{clientSecret}'
  });
</script>
```

## Table of Contents

#### Tag

* [Get tags for an image via URL](#get-tags-for-an-image-via-url)
* [Get tags for an image via bytes](#get-tags-for-an-image-via-image-bytes)
* [Get tags for multiple images via url](#get-tags-for-multiple-images-via-url)
* [Get tags for an image via url passing in a model](#get-tags-for-an-image-via-url-passing-in-a-model)
* [Get tags for an image via url passing in a language](#get-tags-for-an-image-via-url-passing-in-a-language)
* [Get tags for an image via url and set a localId](#get-tags-for-an-image-via-url-and-set-a-localid)
* [Get tags for an image via url and restrict the tags returned](#get-tags-for-an-image-via-url-and-restrict-the-tags-returned)

#### Info

* [Get API info](#get-api-info)

#### Languages

* [Get supported languages](#get-supported-languages)

#### Color

* [Get colors for an image via url](#get-colors-for-an-image-via-url)

#### Usage

* [Get API usage](#get-api-usage)

#### Feedback

* [Send feedback to the API](#send-feedback-to-the-api)

#### Token

* [Get a token](#get-a-token)
* [Set a token](#set-a-token)
* [Delete a token](#delete-a-token)

#### Promises and Callbacks

* [Instructions](#promises-and-callbacks)

## Examples

### Tag

#### Get tags for an image via url

```js
Clarifai.getTagsByUrl('https://samples.clarifai.com/wedding.jpg').then(
  handleResponse,
  handleError
);
```

#### Get tags for multiple images via url

```js
Clarifai.getTagsByUrl([
  'https://samples.clarifai.com/wedding.jpg',
  'https://samples.clarifai.com/cookies.jpeg'
]).then(
  handleResponse,
  handleError
);
```

#### Get tags for an image via image bytes

```js
Clarifai.getTagsByImageBytes('R0lGODlhZAHIAPcAAKeno6Oinc3Do6iVeMe7o1ZEM...').then(
  handleResponse,
  handleError
);
```

#### Get tags for an image via url passing in a model

```js
Clarifai.getTagsByUrl('https://samples.clarifai.com/wedding.jpg', {
  'model': 'nsfw-v0.1'
}).then(
  handleResponse,
  handleError
);
```

#### Get tags for an image via url passing in a language

```js
Clarifai.getTagsByUrl('https://samples.clarifai.com/wedding.jpg', {
  'language': 'es'
}).then(
  handleResponse,
  handleError
);
```

#### Get tags for an image via url and set a localId

```js
Clarifai.getTagsByUrl('https://samples.clarifai.com/wedding.jpg', {
  'localId': 'myLocalId'
}).then(
  handleResponse,
  handleError
);
```

#### Get tags for an image via url and restrict the tags returned

```js
Clarifai.getTagsByUrl(
  'https://samples.clarifai.com/wedding.jpg',
  {
    'selectClasses': ['people', 'dress', 'wedding']
  }
).then(
  handleResponse,
  handleError
);
```

### Info

#### Get API info

```js
Clarifai.getInfo().then(
  handleResponse,
  handleError
);
```

### Languages

#### Get supported languages

```js
Clarifai.getLanguages().then(
  handleResponse,
  handleError
);
```

### Color

#### Get colors for an image via url

```js
Clarifai.getColorsByUrl('https://samples.clarifai.com/wedding.jpg').then(
  handleResponse,
  handleError
);
```

#### Get colors for an image via image bytes

```js
Clarifai.getColorsByImageBytes('R0lGODlhZAHIAPcAAKeno6Oinc3Do6iVeMe7o1ZEM...').then(
  handleResponse,
  handleError
);
```

### Usage

#### Get API usage

```js
Clarifai.getUsage().then(
  handleResponse,
  handleError
);
```

### Feedback

#### Send feedback to the API

```js
Clarifai.createFeedback('https://samples.clarifai.com/wedding.jpg', {
  'addTags': ['family', 'friends',],
  'removeTags': ['military', 'protest'],
}).then(
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

#### Delete a token

```js
Clarifai.deleteToken();
```

### Promises and Callbacks

All methods return promises. If you'd rather user callbacks, just pass in a callback function as the last
param to any method. If there are multiple params and some are optional, you'll need to pass in `null` for
those.
