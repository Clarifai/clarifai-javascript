var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var notify = require('gulp-notify');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace-task');
var envify = require('envify');
var htmlmin = require('gulp-htmlmin');
var webserver = require('gulp-webserver');
var rename = require('gulp-rename');
var insert = require('gulp-insert');
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine');
var del = require('del');
var fs = require('fs');
var zip = require('gulp-zip');
var awspublish = require('gulp-awspublish');
var VERSION = require('./../package.json').version;


var tasks = [
  'jslint',
  'browserify'
];

gulp.task('build', tasks);

gulp.task(
  'watch',
  tasks,
  watchFiles
);

// will do an initial build, then build on any changes to src
function watchFiles() {
  gulp.watch('./../index.js', ['jslint', 'browserify']);
  gulp.watch('./../src/**', ['jslint', 'browserify']);
  gulp.watch('./../examples/**', ['html']);
}

// browserify src/js to build/js
gulp.task('browserify', function() {
  var buildVars = getBuildVars();
  var replacePatterns = [
    {
      'match': 'buildTimestamp',
      'replacement': new Date().getTime()
    },
    {
      'match': 'stage',
      'replacement': buildVars.stage
    },
    {
      'match': 'VERSION',
      'replacement': VERSION
    }
  ];

  return gulp.src('./../index.js')
    .pipe(browserify({
      'insertGlobals': false,
      'debug': false,
      'transform': ['babelify']
    }).on('error', notify.onError(function(error) {
      var message = 'Browserify error: ' + error.message;
      if ( buildVars.browserifyFailOnError === true ) {
        console.log(error);
        process.exit(1);
      }
      return message;
    })))
    .pipe(replace({
      patterns: replacePatterns
    }))
    .pipe(gulpif( buildVars.uglify, uglify() ))
    .pipe(rename(function (path) {
      path.basename = 'clarifai-' + VERSION;
    }))
    .pipe(insert.prepend(BROWSER_HEADER))
    .pipe(gulp.dest('./../build/'));
});

// build examples
gulp.task('html', function() {
  var buildVars = getBuildVars();
  var CLIENT_ID = process.env.CLIENT_ID || '';
  var CLIENT_SECRET = process.env.CLIENT_SECRET || '';
  return gulp.src('./../examples/**.html')
    .pipe(gulpif( buildVars.uglify, htmlmin({collapseWhitespace: true}) ))
    .pipe(replace({
      patterns: [
        {
          'match': 'VERSION',
          'replacement': VERSION
        },
        {
          'match': 'CLIENT_ID',
          'replacement': CLIENT_ID
        },
        {
          'match': 'CLIENT_SECRET',
          'replacement': CLIENT_SECRET
        }
      ]
    }))
    .pipe(gulp.dest('./../build/examples'));
});

// webserver for examples
gulp.task('webserver', function() {
  var port = gutil.env.port || '3000';
  return gulp.src('./../build')
    .pipe(webserver({
      'livereload': false,
      'open': false,
      'host': '0.0.0.0',
      'port': port,
      'directoryListing': {
        'enable':false,
        'path': 'build'
      }
    }));
});

var buildVars = {};

buildVars.dev = {
  'stage': 'dev',
  'browserifyDebug': true,
  'uglify': false,
  'lintFailOnError': false,
  'browserifyFailOnError': false
};

buildVars.test = {
  'stage': 'test',
  'browserifyDebug': true,
  'uglify': false,
  'lintFailOnError': true,
  'browserifyFailOnError': true
};

buildVars.staging = {
  'stage': 'staging',
  'browserifyDebug': false,
  'uglify': true,
  'lintFailOnError': true,
  'browserifyFailOnError': true
};

buildVars.prod = {
  'stage': 'prod',
  'browserifyDebug': false,
  'uglify': true,
  'lintFailOnError': true,
  'buildMock': false,
  'browserifyFailOnError': true
};

function getBuildVars() {
  var stageString = gutil.env.stage || 'dev';
  return buildVars[stageString];
};

var BROWSER_HEADER = (
  '/**\n' +
  ' * Clarifai JavaScript SDK v' + VERSION + '\n' +
  ' *\n' +
  ' * Last updated: ' + new Date() + '\n' +
  ' *\n' +
  ' * Visit https://developer.clarifai.com\n' +
  ' *\n' +
  ' * Copyright (c) 2016-present, Clarifai, Inc.\n' +
  ' * All rights reserved.\n' +
  ' * Licensed under the Apache License, Version 2.0.\n' +
  ' *\n' +
  ' * The source tree of this library can be found at\n' +
  ' *   https://github.com/Clarifai/clarifai-javascript\n' +
  ' */\n'
);

var lintOptions = {
  'env': [
    'browser',
    'node'
  ],
  'rules': {
    'spaced-comment': [2, "always"],
    'semi': [2, "always"],
    'curly': [2, "all"],
    'no-else-return': 2,
    'no-unreachable': 2,
    'no-return-assign': 2,
    'indent': [2, 2],
    'no-unused-vars': [2, {vars: "all", args: "none"}],
    'key-spacing': [2, {afterColon: true}],
    'quotes': [2, "single"],
    'camelcase': 2,
    'new-cap': 2,
    'no-const-assign': 2,
    'eqeqeq': 2,
    'no-multi-str': 2
  }
}

gulp.task('jslint', function () {
  var buildVars = getBuildVars();
  if ( buildVars.lintFailOnError === true ) {
    return failOnError();
  } else {
    return dontFailOnError();
  }
});

function dontFailOnError() {
  return gulp.src(['./../src/**/*.js'])
    .pipe(eslint(lintOptions))
    .pipe(eslint.format())
    .pipe(eslint.failOnError().on('error', notify.onError("Error: <%= error.message %>")));
};

function failOnError() {
  return gulp.src(['./../src/**/*.js'])
    .pipe(eslint(lintOptions))
    .pipe(eslint.format())
    .pipe(eslint.failOnError().on('error', function(e) {
      console.log('jslint error:', e);
      process.exit(1);
    }));
};

gulp.task('test', function() {
  return gulp.src('./../spec/*.js')
    .pipe(jasmine({
      'includeStackTrace': true,
      'verbose': true,
      'timeout': 60000,
      'config': {
        'helpers': [
          './../node_modules/babel-register/lib/node.js'
        ]
      }
    }).on('end', function() {
      process.exit();
    }).on('error', function() {
      process.exit(1);
    }));
});

// delete the contents of build folder
gulp.task('cleanbuild', function() {
  return del([
    './../build/**',
   ], {'force': true});
});

// deploy to the S3 bucket set in aws.json
gulp.task(
  'deploy',
  tasks,
  publish
);

// publish to S3
function publish() {
  var aws;
  if ( gutil.env.aws ) {
    console.log('Using aws:', 'vars');
    aws = JSON.parse(gutil.env.aws);
  } else {
    console.log('Using aws:', 'file');
    aws = JSON.parse(fs.readFileSync('./../aws.json'));
  }
  console.log('Deploying to bucket:', aws.params.Bucket);
  var publisher = awspublish.create(aws);
  //315360000
  var headers = {
    'Cache-Control': 'max-age=21600, no-transform, public'
  };
  return gulp.src('./../build/**')
    .pipe(rename(function (path) {
        path.dirname = '/js/' + path.dirname;
    }))
    .pipe(publisher.publish(headers))
    .pipe(awspublish.reporter());
}

gulp.task('zip', ['jslint'], function() {
  return gulp.src([
    './../index.js',
    './../README.md',
    './../spec',
    './../src/*',
    './../package.json',
    './../examples/*'
  ],{ 'base': './../' })
		.pipe(zip('clarifai-' + VERSION + '.zip'))
		.pipe(gulp.dest('./../build'));
});
