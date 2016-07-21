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

<script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-2.0.1.js"></script>
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

#### Images

* [Add an image via url](#add-an-image-via-url)
* [Add an image via url and id](#add-an-image-via-url-and-id)
* [Add multiple images via url](#add-an-image-via-url)
* [Add an image via image bytes](#add-an-image-via-image-bytes)
* [Add images via file](#add-images-via-file)
* [Get all images](#get-all-images)
* [Get all images with pagination](#get-all-images-with-pagination)
* [Get a single image by id](#get-a-single-image-by-id)
* [Delete a single image by id](#delete-a-single-image-by-id)
* [Get images status](#get-images-status)

#### Search

* [Visually search images](#visually-search-images)
* [Visually search images with crop area](#visually-search-images-with-crop-area)
* [Search images by all predictions matched](#search-images-by-all-predictions-matched)
* [Search images by any predictions matched](#search-images-by-any-predictions-matched)
* [Search images and exclude all predictions matched](#search-images-and-exclude-all-predictions-matched)
* [Search images by all predictions matched with pagination](#search-images-by-all-predictions-matched-with-pagination)

#### Inputs

* [Add an annotated input](#add-an-annotated-input)

#### Models

* [Create a model](#create-a-model)
* [Train a model](#train-a-model)
* [Predict](#predict)

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

### Images

### Add an image via url

```js
Clarifai.addImages({
  'url': 'https://samples.clarifai.com/metro-north.jpg'
}).then(
  handleResponse,
  handleError
);
```

### Add an image via url and id

```js
Clarifai.addImages({
  'url': 'https://samples.clarifai.com/metro-north.jpg',
  'id': 'someId'
}).then(
  handleResponse,
  handleError
);
```

### Add multiple images via url

```js
Clarifai.addImages([
  {
    'url': 'https://samples.clarifai.com/metro-north.jpg'
  },
  {
    'url': 'https://samples.clarifai.com/wedding.jpg'
  }
]).then(
  handleResponse,
  handleError
);
```

### Add an image via image bytes

```js
Clarifai.addImages({
  'base64': '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAE...'
}).then(
  handleResponse,
  handleError
);
```

### Add images via file

#### Browser

```js
Clarifai.addImagesByFile(file).then(
  handleResponse,
  handleError
);
```

#### Node.js

```js
Clarifai.addImagesByFile(fs.createReadStream('test.csv')).then(
  handleResponse,
  handleError
);
```

### Get all images

```js
Clarifai.getImages().then(
  handleResponse,
  handleError
);
```

### Get all images with pagination

```js
Clarifai.getImages({
  'page': 2,
  'perPage': 30 
}).then(
  handleResponse,
  handleError
);
```

### Get a single image by id

```js
Clarifai.getImageById('aUNrZDyWTpWwUJlmcImuDA').then(
  handleResponse,
  handleError
);
```

### Delete a single image by id

```js
Clarifai.deleteImageById('aUNrZDyWTpWwUJlmcImuDA').then(
  handleResponse,
  handleError
);
```

### Get images status

```js
Clarifai.getImagesStatus().then(
  handleResponse,
  handleError
);
```

### Search

### Visually search images

```js
Clarifai.searchImages({
  'image': {
    'url': 'https://samples.clarifai.com/metro-north.jpg'
  }
}).then(
  handleResponse,
  handleError
);
```

### Visually search images with crop area

Crop parameter is an array of 4 floats in the range 0 - 1.0 that defines `[top, left, bottom, right]` respectively.

```js
Clarifai.searchImages({
  'image': {
    'url': 'https://samples.clarifai.com/metro-north.jpg',
    'crop': [0.25, 0.25, 0.75, 0.75]
  }
}).then(
  handleResponse,
  handleError
);
```

### Search images by all predictions matched

```js
Clarifai.searchImages({
  'andTerms': ['sky', 'dress']
}).then(
  handleResponse,
  handleError
);
```

### Search images by any predictions matched

```js
Clarifai.searchImages({
  'orTerms': ['sky', 'dress']
}).then(
  handleResponse,
  handleError
);
```

### Search images and exclude all predictions matched

```js
Clarifai.searchImages({
  'notTerms': ['sky', 'dress']
}).then(
  handleResponse,
  handleError
);
```

### Search images by all predictions matched with pagination

```js
Clarifai.searchImages({
  'andTerms': ['sky', 'dress']
}, {
  'page': 2,
  'perPage': 30 
}).then(
  handleResponse,
  handleError
);
```

### Inputs

#### Add an annotated input

```js
Clarifai.addInputs([
  { 
    "image": {
        "url": "http://i.imgur.com/HEoT5xR.png"
    },
    "annotation":{
        "tags": [{"id":"ferrari", "present":true}]
    }
  },
  { 
    "image": {
        "url": "http://i.imgur.com/It5JRaj.jpg"
    },
    "annotation":{
        "tags": [{"id":"ferrari", "present":true}]
    }
  }
]).then(
  handleResponse,
  handleError
);
```

### Models

#### Create a model

```js
Clarifai.createModel({
  'name': 'test',
  'concepts': [
    {
      'id': 'ferrari'
    }
  ]
}).then(
  handleResponse,
  handleError
);
```

#### Train a model

```js
Clarifai.trainModel('vG0S5NEYSHCqKzZJQ5JfZA').then(
  handleResponse,
  handleError
);
```

#### Predict

```js
Clarifai.predict({
  'modelId': 'vG0S5NEYSHCqKzZJQ5JfZA',
  'inputs': [
    {
      'image': {
        'url': 'http://www.ramtrucks.com/assets/towing_guide/images/before_you_buy/truck.png'}
      },
    {
      'image': {
        'url': 'http://www.planwallpaper.com/static/images/ferrari-9.jpg'
      }
    }
  ]
}).then(
  handleResponse,
  handleError
);
```

### Promises and Callbacks

All methods return promises. If you'd rather user callbacks, just pass in a callback function as the last
param to any method. If there are multiple params and some are optional, you'll need to pass in `null` for
those.
