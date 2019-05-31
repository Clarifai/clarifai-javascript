const gulp = require('gulp');
const gutil = require('gulp-util');
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace-task');
const rename = require('gulp-rename');
const insert = require('gulp-insert');
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine');
const del = require('del');
const VERSION = require('./package.json').version;

const buildVars = {
  dev: {
    'stage': 'dev',
    'browserifyDebug': true,
    'uglify': false,
    'lintFailOnError': false,
    'browserifyFailOnError': false
  },
  test: {
    'stage': 'test',
    'browserifyDebug': true,
    'uglify': false,
    'lintFailOnError': true,
    'browserifyFailOnError': true
  },
  unittest: {
    'stage': 'unittest',
    'browserifyDebug': true,
    'uglify': false,
    'lintFailOnError': true,
    'browserifyFailOnError': true
  },
  staging: {
    'stage': 'staging',
    'browserifyDebug': false,
    'uglify': true,
    'lintFailOnError': true,
    'browserifyFailOnError': true
  },

  prod: {
    'stage': 'prod',
    'browserifyDebug': false,
    'uglify': true,
    'lintFailOnError': true,
    'buildMock': false,
    'bowserifyFailOnError': true
  }
};


const BROWSER_HEADER = (
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

const lintOptions = {
  env: [
    'browser',
    'node'
  ],
  rules: {
    'spaced-comment': [2, 'always'],
    'semi': [2, 'always'],
    'curly': [2, 'all'],
    'no-else-return': 2,
    'no-unreachable': 2,
    'no-return-assign': 2,
    'indent': [2, 2],
    'no-unused-vars': [2, {vars: 'all', args: 'none'}],
    'key-spacing': [2, {afterColon: true}],
    'quotes': [2, 'single'],
    'camelcase': 2,
    'new-cap': 2,
    'no-const-assign': 2,
    'eqeqeq': 2,
    'no-multi-str': 2
  }
};


function getBuildVars() {
  const stageString = process.env.CLARIFAI_DEPLOY || gutil.env.stage || 'dev';
  return buildVars[stageString];
}

function dontFailOnError() {
  return gulp.src(['./src/**/*.js'])
    .pipe(eslint(lintOptions))
    .pipe(eslint.format())
    .pipe(eslint.failOnError().on('error', notify.onError('Error: <%= error.message %>')));
}

function failOnError() {
  return gulp.src(['./src/**/*.js'])
    .pipe(eslint(lintOptions))
    .pipe(eslint.format())
    .pipe(eslint.failOnError().on('error', function(e) {
      console.log('jslint error:', e);
      process.exit(1);
    }));
}

// will do an initial build, then build on any changes to src
function watchFiles() {
  gulp.watch('./src/**', ['jslint', 'browserify']);
}

const tasks = [
  'jslint',
  'browserify',
  'dist'
];

gulp.task('build', tasks);

gulp.task(
  'watch',
  tasks,
  watchFiles
);

gulp.task('test', function() {
  return gulp.src('./tests/*/*.js')
    .pipe(jasmine({
      'includeStackTrace': true,
      'verbose': true,
      'timeout': 60000,
      'config': {
        'helpers': [
          './node_modules/babel-register/lib/node.js'
        ],
        'random': false,
      }
    }).on('end', function() {
      process.exit();
    }).on('error', function(e) {
      console.log(e);
      process.exit(1);
    }));
});

gulp.task('unittest', function() {
  return gulp.src('./tests/unit/*.js')
    .pipe(jasmine({
      'includeStackTrace': true,
      'verbose': true,
      'timeout': 60000,
      'config': {
        'helpers': [
          './node_modules/babel-register/lib/node.js'
        ]
      }
    }).on('end', function() {
      process.exit();
    }).on('error', function(e) {
      console.log(e);
      process.exit(1);
    }));
});

gulp.task('jslint', function() {
  const buildVars = getBuildVars();
  if (buildVars.lintFailOnError === true) {
    return failOnError();
  }
  return dontFailOnError();
});


// delete the contents of build folder
gulp.task('cleanbuild', function() {
  return del([
    './dist/**',
    './sdk/**',
    './docs/**',
  ], {'force': true});
});

// browserify src/js to dist/browser/js
gulp.task('browserify', ['cleanbuild'], function() {
  const buildVars = getBuildVars();
  const replacePatterns = [
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

  return gulp.src('./src/index.js')
    .pipe(browserify({
      'insertGlobals': true,
      'debug': false,
      'transform': ['babelify']
    }).on('error', notify.onError(function(error) {
      const message = 'Browserify error: ' + error.message;
      if (buildVars.browserifyFailOnError === true) {
        console.log(error);
        process.exit(1);
      }
      return message;
    })))
    .pipe(replace({
      patterns: replacePatterns
    }))
    .pipe(rename(function(path) {
      path.basename = 'clarifai-' + VERSION;
    }))
    .pipe(insert.prepend(BROWSER_HEADER))
    .pipe(gulp.dest('./sdk'))
    .pipe(rename(function(path) {
      path.basename = 'clarifai-latest';
    }))
    .pipe(gulp.dest('./sdk'))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename = 'clarifai-' + VERSION + '.min';
    }))
    .pipe(gulp.dest('./sdk'))
    .pipe(rename(function(path) {
      path.basename = 'clarifai-latest.min';
    }))
    .pipe(gulp.dest('./sdk'));
});

gulp.task('dist', ['browserify'], function() {
  return gulp.src('./src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./dist'));
});

