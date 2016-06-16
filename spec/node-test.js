fs = require('fs');
var Clarifai = require('./../index.js');
var imageBytes = require('./image-bytes');

var sampleImage = 'https://samples.clarifai.com/metro-north.jpg';
var sampleImage2 = 'https://samples.clarifai.com/wedding.jpg';
var sampleImage3 = 'https://samples.clarifai.com/cookies.jpeg';

describe('Clarifai JS SDK', function() {
  
  beforeAll(function() {
    Clarifai.initialize({
      'clientId': process.env.CLIENT_ID,
      'clientSecret': process.env.CLIENT_SECRET
    });
  });
  
  
  describe('Token', function() {
  
    it('Gets a token as a string', function(done) {
      Clarifai.getToken().then(
        function(response) {
          expect(response).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Sets a token with an object', function(done) {
      var token = {
        'access_token': 'foo',
        'token_type': 'Bearer',
        'expires_in': 176400,
        'scope': 'api_access_write api_access api_access_read'
      };
      var tokenSet = Clarifai.setToken(token);
      Clarifai.getToken().then(
        function(response) {
          expect(tokenSet).toEqual(true);
          expect(response).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Sets a token with a string', function(done) {
      var tokenSet = Clarifai.setToken('foo');
      Clarifai.getToken().then(
        function(response) {
          expect(tokenSet).toEqual(true);
          expect(response).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Deletes a token', function() {
      Clarifai.deleteToken();
    });
    
  });
  

  describe('Tag', function() {
  
    it('Gets tags for an image via url', function(done) {
      Clarifai.getTagsByUrl(sampleImage2).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets tags for multiple images via url', function(done) {
      Clarifai.getTagsByUrl([
        sampleImage2,
        sampleImage3
      ]).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(2);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets tags for an image via bytes', function(done) {
      Clarifai.getTagsByImageBytes(imageBytes).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url passing in a model', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'model': 'nsfw-v0.1'
      }).then(
        function(response) {
          expect(response.meta.tag.model).toBe('nsfw-v0.1');
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url passing in a language', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'language': 'es'
      }).then(
        function(response) {
          expect(response.results[0].result.tag.classes[0]).toBe('ceremonia');
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url and set a localId', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'localId': 'myLocalId'
      }).then(
        function(response) {
          expect(response.results[0].local_id).toBe('myLocalId');
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url and restrict the tags returned', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'selectClasses': ['people', 'wedding']
      }).then(
        function(response) {
          expect(response.results[0].result.tag.classes.length).toBe(2);
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
 
  describe('Info', function() {
  
    it('Gets info from the API', function(done) {
      Clarifai.getInfo().then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.results.max_image_size).toBeDefined();
          expect(response.results.default_language).toBeDefined();
          expect(response.results.max_video_size).toBeDefined();
          expect(response.results.max_image_bytes).toBeDefined();
          expect(response.results.min_image_size).toBeDefined();
          expect(response.results.default_model).toBeDefined();
          expect(response.results.max_video_bytes).toBeDefined();
          expect(response.results.max_video_duration).toBeDefined();
          expect(response.results.max_batch_size).toBeDefined();
          expect(response.results.max_video_batch_size).toBeDefined();
          expect(response.results.min_video_size).toBeDefined();
          expect(response.results.api_version).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Usage', function() {
  
    it('Gets usage from the API', function(done) {
      Clarifai.getUsage().then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.results.user_throttles).toBeDefined();
          expect(response.results.app_throttles).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Languages', function() {
  
    it('Gets languages from the API', function(done) {
      Clarifai.getLanguages().then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.languages).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Color', function() {
  
    it('Gets color for an image via url', function(done) {
      Clarifai.getColorsByUrl(sampleImage2).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          expect(response.results[0].colors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets color for multiple images via url', function(done) {
      Clarifai.getColorsByUrl([
        sampleImage2,
        sampleImage3
      ]).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(2);
          expect(response.results[0].colors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets color for an image via bytes', function(done) {
      Clarifai.getColorsByImageBytes(imageBytes).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          expect(response.results[0].colors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Feedback', function() {
  
    it('Sends feedback to the API', function(done) {
      Clarifai.createFeedback(sampleImage, {
        'addTags': ['snow', 'evening',],
        'removeTags': ['road', 'business'],
      }).then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.status_msg).toBe('Feedback successfully recorded. ');
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Images', function() {
    
    var imageId = 'someId';
    
    it('Adds an image via url', function(done) {
      Clarifai.addImages({
        'url': sampleImage
      }).then(
        function(response) {
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBe(1);
          expect(images[0].created_at).toBeDefined();
          expect(images[0].id).toBeDefined();
          expect(images[0].url).toBe(sampleImage);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Adds an image via url and id', function(done) {
      Clarifai.addImages({
        'url': sampleImage,
        'id': imageId
      }).then(
        function(response) {
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBe(1);
          expect(images[0].created_at).toBeDefined();
          expect(images[0].id).toBe(imageId);
          expect(images[0].url).toBe(sampleImage);
          done();
        },
        errorHandler.bind(done)
      );
    });
      
    it('Adds multiple images via url', function(done) {
      Clarifai.addImages([
        {
          'url': sampleImage
        },
        {
          'url': sampleImage2
        }
      ]).then(
        function(response) {
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBe(2);
          var image = images[0];
          var image2 = images[1];
          expect(image.id).toBeDefined();
          expect(image.created_at).toBeDefined();
          expect(image.url).toBe(sampleImage);
          expect(image2.id).toBeDefined();
          expect(image2.created_at).toBeDefined();
          expect(image2.url).toBe(sampleImage2);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
/*
    it('Adds images via csv file', function(done) {
      Clarifai.addImagesByFile(fs.createReadStream('./../spec/test.csv')).then(
        function(response) {
          console.log(response);
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBe(1);
          expect(images[0].created_at).toBeDefined();
          expect(images[0].id).toBeDefined();
          expect(images[0].url).toBe(sampleImage);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Adds images via tsv file', function(done) {
      Clarifai.addImagesByFile(fs.createReadStream('./../spec/test.tsv')).then(
        function(response) {
          console.log(response);
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBe(1);
          expect(images[0].created_at).toBeDefined();
          expect(images[0].id).toBeDefined();
          expect(images[0].url).toBe(sampleImage);
          done();
        },
        errorHandler.bind(done)
      );
    });
*/
    
    it('Creates an image via bytes', function(done) {
      Clarifai.addImages({
        'base64': imageBytes
      }).then(
        function(response) {
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBe(1);
          expect(images[0].created_at).toBeDefined();
          expect(images[0].id).toBeDefined();
          expect(images[0].url).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets a single image by id', function(done) {
      Clarifai.getImageById(imageId).then(
        function(response) {
          expect(response.image).toBeDefined();
          expect(response.image.id).toBe(imageId);
          expect(response.image.created_at).toBeDefined();
          expect(response.image.url).toBe(sampleImage);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets all images', function(done) {
      Clarifai.getImages().then(
        function(response) {
          expect(response.images).toBeDefined();
          var images = response.images;
          expect(images.length).toBeGreaterThan(0);
          var image = images[0];
          expect(image.id).toBeDefined();
          expect(image.created_at).toBeDefined();
          expect(image.url).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Deletes a single image by id', function(done) {
      Clarifai.deleteImageById(imageId).then(
        function(response) {
          expect(response.status_code).toBe('OK');
          done();
        },
        errorHandler.bind(done)
      );
    });
   
    it('Gets images status', function(done) {
      Clarifai.getImagesStatus().then(
        function(response) {
          expect(response.counts).toBeDefined();
          var counts = response.counts;
          expect(counts.processed).toBeDefined();
          expect(counts.to_process).toBeDefined();
          expect(counts.errors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
  
  });
  
  describe('Search', function() {
    
    it('Visually searches images', function(done) {
      Clarifai.searchImages({
        'image': {
          'url': sampleImage
        }
      }).then(
        function(response) {
          testScoredImageResponse(response, done);
        },
        errorHandler.bind(done)
      );
    });
    
    it('Visually searches images with crop area', function(done) {
      Clarifai.searchImages({
        'image': {
          'url': sampleImage,
          'crop': [0.25, 0.25, 0.75, 0.75]
        }
      }).then(
        function(response) {
          testScoredImageResponse(response, done);
        },
        errorHandler.bind(done)
      );
    });
    
    it('Searches images by all predictions matched', function(done) {
      Clarifai.searchImages({
        'andTerms': ['train']
      }).then(
        function(response) {
          testScoredImageResponse(response, done);
        },
        errorHandler.bind(done)
      );
    });
    
    it('Searches images by all predictions matched with pagination', function(done) {
      Clarifai.searchImages({
        'andTerms': ['train']
      }, {
        'page': 5000,
        'perPage': 100
      }).then(
        function(response) {
          expect(response.scored_items).toBeDefined();
          var scoredItems = response.scored_items;
          expect(scoredItems.length).toBe(0);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Searches images by any predictions matched', function(done) {
      Clarifai.searchImages({
        'orTerms': ['train', 'foo']
      }).then(
        function(response) {
          testScoredImageResponse(response, done);
        },
        errorHandler.bind(done)
      );
    });
    
    it('Searches images and exclude all predictions matched', function(done) {
      Clarifai.searchImages({
        'notTerms': ['doo', 'foo']
      }).then(
        function(response) {
          testScoredImageResponse(response, done);
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
});

function responseHandler(response) {
  expect(true).toBe(true);
  this();
};

function errorHandler(err) {
  console.log(err);
  expect(err).toBe(true);
  this();
};

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
};

function testScoredImageResponse(response, done) {
  expect(response.scored_items).toBeDefined();
  var scoredItems = response.scored_items;
  expect(scoredItems.length).toBeGreaterThan(0);
  var scoredItem = scoredItems[0];
  expect(scoredItem.score).toBeDefined();
  expect(scoredItem.image).toBeDefined();
  expect(scoredItem.image.id).toBeDefined();
  expect(scoredItem.image.created_at).toBeDefined();
  expect(scoredItem.image.url).toBeDefined();
  done();
};
