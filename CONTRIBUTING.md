## Building

1. Clone this repo
2. `npm i`
3. `npm run build`

This will create three folders:

- `dist`: compiled source files, suitable for the server 
- `sdk`: bundled and minified versions of the library, suitable for browser environments
- `docs` documentation generated from source code

## Development

#### Helpful development tasks

* `npm run watch` - this will do an initial build, then build on any changes to *src*
* `npm run test` - test JS files in the */spec* folder
  * tests require the following environment variables to be set:
    * `CLARIFAI_API_KEY`
* `npm run clean` - empty and remove the folders created on build

#### Command line optional params

* `--stage` - if set will build with the env vars found in `gulpfile.js`. Possible values are: `dev`
(default), `test`, `staging`, `prod`

#### JSDocs

To compile docs, run `npm run jsdocs`
