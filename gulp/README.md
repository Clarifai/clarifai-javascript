## Build From Source

If you'd like to build this from source, you can by following these steps:

1. Clone this repo
2. `npm install`
3. `gulp build`

After `gulp build` you will have a new directory in the project called *build*. These will be your compiled
files. **These are not under source control.**

## Development

#### Helpful development tasks

* `gulp build` - this does everything below and puts your compiled files into a *build* dir
* `gulp watch` - this will do an initial build, then build on any changes to *src*
* `gulp browserify` - browserify *src/js* to *build/js*
* `gulp html` - copy *examples* to *build/examples*
* `gulp test` - test JS files in the *src/spec* folder (See [Testing](#test) section below)
* `gulp jslint` - shows warnings about `src/**/*.js` files in accordance with our JavaScript style guide

#### Some more helpful tasks:

* `gulp webserver` - starts a webserver on port 3000 to serve the *build* folder
* `gulp cleanbuild` - empty and remove your *build* folder

#### Gulp command line optional params

* `--stage` - if set will build with the env vars found in `gulpfile.js`. Possible values are: `dev`
(default), `test`, `staging`, `prod`
* `--port 4000` - if set the webserver will run on the port passed in (default 3000)
* `--lintFailOnError true` - if set to true, will terminate process on error (default false)

#### JSDocs

To compile docs, run `jsdoc src/* -t node_modules/minami -d build/docs` in the root folder.

## Examples

* Run in the browser: `CLIENT_ID=foo CLIENT_SECRET=bar gulp build`
* Run in node.js: `CLIENT_ID=foo CLIENT_SECRET=bar node examples/node-example`
