# Deploying

Deploys are done directly from public Travis CI (.org). Simply tagging the `master` branch triggers the deploy.

See [.travis.yml](.travis.yml) for implementation.

This is assuming you are working in the private repo and have the public repo added as a remote named `public`.

* When you are ready to release a new version make sure your changes are on the `master` branch.
* Make a commit to bump the version and update the [CHANGELOG.md](CHANGELOG.md) - [example](https://github.com/Clarifai/clarifai-javascript/commit/a691ddc76daab7caf039317eb5f4d6ec6ef89d2f).
* Push/merge `master` changes to the public and private repos.

```
git push origin master
git push public master
```

* Wait for CI to pass.
* Tag the master branch with your version number and push to `public`. 

```
git tag 1.0.0 master
git push public 1.0.0
```

* Ensure the deploy is successful from public Travis CI (.org).

The reason a soft tag (not annotated) tag is used and pushed separately is that using `git push public master --folow-tags` would push up all past tags that don't exist which could lead to unintentional releases. It might be worth looking into setting this up in the future to avoid the double Travis build (master push and tag push).
