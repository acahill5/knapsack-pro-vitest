# @knapsack-pro/cypress

[![CircleCI](https://circleci.com/gh/KnapsackPro/knapsack-pro-cypress.svg?style=svg)](https://circleci.com/gh/KnapsackPro/knapsack-pro-cypress)

`@knapsack-pro/cypress` runs your E2E tests with [Cypress.io](https://www.cypress.io) test runner and does dynamic tests allocation across parallel CI nodes using [KnapsackPro.com](https://knapsackpro.com) Queue Mode to provide the fastest CI build time (optimal test suite timing).

Learn about Knapsack Pro Queue Mode in the video [how to run tests with dynamic test suite split](https://youtu.be/hUEB1XDKEFY) and learn what CI problems can be solved thanks to it.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Installation](#installation)
- [How to use](#how-to-use)
  - [Configuration steps](#configuration-steps)
  - [CI steps](#ci-steps)
    - [CircleCI](#circleci)
    - [Travis CI](#travis-ci)
    - [Buildkite.com](#buildkitecom)
    - [Codeship.com](#codeshipcom)
    - [Heroku CI](#heroku-ci)
    - [Solano CI](#solano-ci)
    - [AppVeyor](#appveyor)
    - [Gitlab CI](#gitlab-ci)
    - [SemaphoreCI.com](#semaphorecicom)
    - [Cirrus-CI.org](#cirrus-ciorg)
    - [Jenkins](#jenkins)
    - [Other CI provider](#other-ci-provider)
- [FAQ](#faq)
  - [How to run tests only from specific directory?](#how-to-run-tests-only-from-specific-directory)
- [Development](#development)
  - [Dependencies](#dependencies)
  - [Setup](#setup)
  - [Publishing](#publishing)
  - [Testing](#testing)
    - [CI](#ci)
    - [Example Cypress test suite](#example-cypress-test-suite)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
$ npm install --save-dev @knapsack-pro/cypress
```

## How to use

### Configuration steps

1. Please add to your CI environment variables `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS`. You can generate API token in [user dashboard](https://knapsackpro.com/dashboard).

2. (optional) Do you want to use "retry single failed parallel CI node" feature for your CI? For instance some of CI providers like Travis CI, Buildkite or Codeship allows you to retry only one of failed parallel CI node instead of retrying the whole CI build with all parallel CI nodes. If you want to be able to retry only single failed parallel CI node then you need to tell Knapsack Pro API to remember the way how test files where allocated across parallel CI nodes by adding to your CI environment variables `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true`.

    The default is `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=false` which means when you want to retry the whole failed CI build then a new dynamic test suite split will happen across all retried parallel CI nodes thanks to Knapsack Pro Queue Mode. Some people may prefer to retry the whole failed CI build with test files allocated across parallel CI nodes in the same order as it happend for the failed CI build - in such case you should set `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true`.

3. (optional) `@knapsack-pro/cypress` detects information about CI build from supported CI environment variables. When information like git branch name and git commit hash cannot be detect from CI environment variables then `@knapsack-pro/cypress` will try to use git installed on CI machine to detect the infomation. If you don't have git installed then you should set the information using environment variables:

    `KNAPSACK_PRO_COMMIT_HASH` - git commit hash (SHA1)
    `KNAPSACK_PRO_BRANCH` - git branch name
    `KNAPSACK_PRO_CI_NODE_BUILD_ID` - a unique ID for your CI build. All parallel CI nodes being part of single CI build must have the same node build ID. Example how to generate node build ID: `KNAPSACK_PRO_CI_NODE_BUILD_ID=$(openssl rand - base64 32)`.

4. Please select your CI provider and follow instructions to run tests with `@knapsack-pro/cypress`.

    - [CircleCI](#circleci)
    - [Travis CI](#travis-ci)
    - [Buildkite.com](#buildkitecom)
    - [Codeship.com](#codeshipcom)
    - [Heroku CI](#heroku-ci)
    - [Solano CI](#solano-ci)
    - [AppVeyor](#appveyor)
    - [Gitlab CI](#gitlab-ci)
    - [SemaphoreCI.com](#semaphorecicom)
    - [Cirrus-CI.org](#cirrus-ciorg)
    - [Jenkins](#jenkins)
    - [Other CI provider](#other-ci-provider)

### CI steps

#### CircleCI

Example configuration for CircleCI 2.0 platform.

```YAML
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    parallelism: 2 # run 2 parallel CI nodes

    steps:
      - checkout

      - run:
        name: Run Cypress.io tests with @knapsack-pro/cypress using Knapsack Pro Queue Mode
        command: $(npm bin)/knapsack-pro-cypress
```

Please remember to add additional parallel containers for your project in CircleCI settings.

#### Travis CI

You can parallelize your CI build across virtual machines with [travis matrix feature](https://docs.travis-ci.com/user/speeding-up-the-build/#parallelizing-your-builds-across-virtual-machines).

```yaml
# .travis.yml
script:
  - "$(npm bin)/knapsack-pro-cypress"

env:
  global:
    - KNAPSACK_PRO_CI_NODE_TOTAL=2
    # allows to be able to retry failed tests on one of parallel job (CI node)
    - KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true

  matrix:
    - KNAPSACK_PRO_CI_NODE_INDEX=0
    - KNAPSACK_PRO_CI_NODE_INDEX=1
```

The configuration will generate matrix with 2 parallel jobs (2 parallel CI nodes):

```
# first CI node (first parallel job)
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=0

# second CI node (second parallel job)
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=1
```

More info about global and matrix ENV configuration in [travis docs](https://docs.travis-ci.com/user/customizing-the-build/#build-matrix).

#### Buildkite.com

The only thing you need to do is to configure the parallelism parameter (number of parallel agents) in your build step and run the below command in your build:

```
$(npm bin)/knapsack-pro-cypress
```

If you want to use Buildkite retry single agent feature to retry just failed tests on particular agent (CI node) then you should set `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true`.

__Other useful resources:__

Here you can find article [how to set up a new pipeline for your project in Buildkite and configure Knapsack Pro](http://docs.knapsackpro.com/2017/auto-balancing-7-hours-tests-between-100-parallel-jobs-on-ci-buildkite-example) and 2 example repositories for Ruby/Rails projects:

* [Buildkite Rails Parallel Example with Knapsack Pro](https://github.com/KnapsackPro/buildkite-rails-parallel-example-with-knapsack_pro)
* [Buildkite Rails Docker Parallel Example with Knapsack Pro](https://github.com/KnapsackPro/buildkite-rails-docker-parallel-example-with-knapsack_pro)

#### Codeship.com

Codeship does not provide parallel jobs environment variables so you will have to define `KNAPSACK_PRO_CI_NODE_TOTAL` and `KNAPSACK_PRO_CI_NODE_INDEX` for each [parallel test pipeline](https://documentation.codeship.com/basic/builds-and-configuration/parallel-tests/#using-parallel-test-pipelines). Below is an example for 2 parallel test pipelines.

Configure test pipelines (1/2 used)

```
# first CI node running in parallel
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=0 $(npm bin)/knapsack-pro-cypress
```

Configure test pipelines (2/2 used)

```
# second CI node running in parallel
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=1 $(npm bin)/knapsack-pro-cypress
```

Remember to add API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` to `Environment` page of your project settings in Codeship.

If you want to use Codeship retry single CI node feature to retry just failed tests on particular CI node then you should set `KNAPSACK_PRO_FIXED_QUEUE_SPLIT=true`.

#### Heroku CI

You can parallelize your tests on [Heroku CI](https://devcenter.heroku.com/articles/heroku-ci) by configuring `app.json` for your project.

You can set how many parallel dynos with tests you want to run with `quantity` value.
Use `test` key to run tests with `@knapsack-pro/cypress` as shown in below example.

You need to specify also the environment variable `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` with API token for Knapsack Pro.
For any sensitive environment variables (like Knapsack Pro API token) that you do not want commited in your `app.json` manifest, you can add them to your pipeline’s Heroku CI settings.

```
# app.json
{
  "environments": {
    "test": {
      "formation": {
        "test": {
          "quantity": 2
        }
      },
      "addons": [
        "heroku-postgresql"
      ],
      "scripts": {
        "test": "$(npm bin)/knapsack-pro-cypress"
      },
      "env": {
        "KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS": "example"
      }
    }
  }
}
```

Note the [Heroku CI Parallel Test Runs](https://devcenter.heroku.com/articles/heroku-ci-parallel-test-runs) are in Beta and you may need to ask Heroku support to enable it for your project.

You can learn more about [Heroku CI](https://devcenter.heroku.com/articles/heroku-ci).

#### Solano CI

[Solano CI](https://www.solanolabs.com) does not provide parallel jobs environment variables so you will have to define `KNAPSACK_PRO_CI_NODE_TOTAL` and `KNAPSACK_PRO_CI_NODE_INDEX` for each parallel job running as part of the same CI build.

```
# Step for first CI node
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=0 $(npm bin)/knapsack-pro-cypress

# Step for second CI node
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=1 $(npm bin)/knapsack-pro-cypress
```

Please remember to set up API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` as global environment.

#### AppVeyor

[AppVeyor](https://www.appveyor.com) does not provide parallel jobs environment variables so you will have to define `KNAPSACK_PRO_CI_NODE_TOTAL` and `KNAPSACK_PRO_CI_NODE_INDEX` for each parallel job running as part of the same CI build.

```
# Step for first CI node
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=0 $(npm bin)/knapsack-pro-cypress

# Step for second CI node
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=1 $(npm bin)/knapsack-pro-cypress
```

Please remember to set up API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` as global environment.

#### Gitlab CI

Gitlab CI does not provide parallel jobs environment variables so you will have to define `KNAPSACK_PRO_CI_NODE_TOTAL` and `KNAPSACK_PRO_CI_NODE_INDEX` for each parallel job running as part of the same `test` stage. Below is relevant part of `.gitlab-ci.yml` configuration for 2 parallel jobs.

```
# .gitlab-ci.yml
stages:
  - test

variables:
  KNAPSACK_PRO_CI_NODE_TOTAL: 2

# first CI node running in parallel
test_ci_node_0:
  stage: test
  script:
    - export KNAPSACK_PRO_CI_NODE_INDEX=0
    - $(npm bin)/knapsack-pro-cypress

# second CI node running in parallel
test_ci_node_1:
  stage: test
  script:
    - export KNAPSACK_PRO_CI_NODE_INDEX=1
    - $(npm bin)/knapsack-pro-cypress
```

Remember to add API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` to [Secret Variables](https://gitlab.com/help/ci/variables/README.md#secret-variables) in `Gitlab CI Settings -> CI/CD Pipelines -> Secret Variables`.

#### SemaphoreCI.com

The only thing you need to do is set up `@knapsack-pro/cypress` for as many parallel threads as you need. Here is an example:

```
# Thread 1
$(npm bin)/knapsack-pro-cypress

# Thread 2
$(npm bin)/knapsack-pro-cypress
```

Tests will be split across 2 parallel threads.

Please remember to set up API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` as global environment.

#### Cirrus-CI.org

The only thing you need to do is to configure number of parallel CI nodes for your project by using [matrix modification](https://cirrus-ci.org/guide/writing-tasks/#matrix-modification). See example for 2 parallel CI nodes.

```
# .cirrus.yml
task:
  matrix:
    name: CI node 0
    name: CI node 1
  cypress_script: $(npm bin)/knapsack-pro-cypress
```

Please remember to set up API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` as global environment.

Here is Ruby example for [`.cirrus.yml` configuration file](https://cirrus-ci.org/examples/#ruby) that you may find useful.

#### Jenkins

In order to run parallel jobs with Jenkins you should use Jenkins Pipeline.
You can learn basics about it in the article [Parallelism and Distributed Builds with Jenkins](https://www.cloudbees.com/blog/parallelism-and-distributed-builds-jenkins).

Here is example `Jenkinsfile` working with Jenkins Pipeline.

```
timeout(time: 60, unit: 'MINUTES') {
  node() {
    stage('Checkout') {
      checkout([/* checkout code from git */])

      // determine git commit hash because we need to pass it to Knapsack Pro
      COMMIT_HASH = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()

      stash 'source'
    }
  }

  def num_nodes = 4; // define your total number of CI nodes (how many parallel jobs will be executed)
  def nodes = [:]

  for (int i = 0; i < num_nodes; i++) {
    def index = i;
    nodes["ci_node_${i}"] = {
      node() {
        stage('Setup') {
          unstash 'source'
          // other setup steps
        }

        def knapsack_options = """\
            KNAPSACK_PRO_CI_NODE_TOTAL=${num_nodes}\
            KNAPSACK_PRO_CI_NODE_INDEX=${index}\
            KNAPSACK_PRO_COMMIT_HASH=${COMMIT_HASH}\
            KNAPSACK_PRO_BRANCH=${env.BRANCH_NAME}\
            KNAPSACK_PRO_CI_NODE_BUILD_ID=${env.BUILD_TAG}\
        """

        // example how to run tests with Knapsack Pro
        stage('Run tests') {
          sh """${knapsack_options} $(npm bin)/knapsack-pro-cypress"""
        }
      }
    }
  }

  parallel nodes // run CI nodes in parallel
}
```

Remember to set environment variable `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` in Jenkins configuration with your API token.

#### Other CI provider

You have to define `KNAPSACK_PRO_CI_NODE_TOTAL` and `KNAPSACK_PRO_CI_NODE_INDEX` for each parallel job running as part of the same CI build.

```
# Step for first CI node
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=0 $(npm bin)/knapsack-pro-cypress

# Step for second CI node
KNAPSACK_PRO_CI_NODE_TOTAL=2 KNAPSACK_PRO_CI_NODE_INDEX=1 $(npm bin)/knapsack-pro-cypress
```

Please remember to set up API token `KNAPSACK_PRO_TEST_SUITE_TOKEN_CYPRESS` as global environment.

## FAQ

### How to run tests only from specific directory?

You can set `KNAPSACK_PRO_TEST_FILE_PATTERN=cypress/integration/**/*.{js,jsx,coffee,cjsx}` and change pattern to match your directory with test files. You can use [glob](https://github.com/isaacs/node-glob) pattern.

## Development

### Dependencies

* [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js)

### Setup

1. Setup [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js) project.

2. Install dependencies:

    ```
    $ npm install
    ```

3. In order to use local version of `@knapsack-pro/core` run:

    ```
    $ npm link @knapsack-pro/core
    ```

4. Compile TypeScript code to `lib` directory by running:

    ```
    $ npm start
    ```

5. Register `@knapsack-pro/cypress` package globally in your local system. This way we will be able to develop other npm packages dependent on it:

    ```
    $ npm link
    ```

### Publishing

1. Sign in to npm registry with command:

    ```
    $ npm adduser
    ```

2. Ensure you have the latest version of `@knapsack-pro/core` in `package.json`:

    ```
    {
      "dependencies": {
        "@knapsack-pro/core": "^x.x.x"
      }
    }
    ```

    Then run `npm install`. This way you will be able to test `@knapsack-pro/core` installed from npm registry instead of local one that was linked with `npm link @knapsack-pro/core`.

    Now commit updated `package.json` and `package-lock.json`.

    ```
    $ git commit -am "Update @knapsack-pro/core"
    ```

3. Before releasing a new version of package please update `CHANGELOG.md` with [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator):

    ```
    $ gem install github_changelog_generator

    # generate CHANGELOG.md
    $ github_changelog_generator KnapsackPro/knapsack-pro-cypress
    ```

4. If you have added new files to the repository and they should be part of the released npm package then please ensure they are included in `files` array in `package.json`.

5. If you have changed any headers in `README.md` please refresh table of contents with:

    ```
    $ npm run doctoc
    ```

6. Compile project:

    ```
    $ npm start
    ```

7. In order to [bump version of the package](https://docs.npmjs.com/cli/version) run below command. It will also create a version commit and tag for the release:

    ```
    # bump patch version 0.0.x
    $ npm version patch

    # bump minor version 0.x.0
    $ npm version minor
    ```

8. Push to git repository created commit and tag:

    ```
    $ git push origin master --tags
    ```

9. Now when git tag is on Github you can update `CHANGELOG.md` again.

    ```
    $ github_changelog_generator KnapsackPro/knapsack-pro-cypress
    $ git commit -am "Update CHANGELOG.md"
    $ git push origin master
    ```

10. Now you can publish package to npm registry:

    ```
    $ npm publish
    ```

### Testing

#### CI

If your feature requires code change in [@knapsack-pro/core](https://github.com/KnapsackPro/knapsack-pro-core-js) then please push the `@knapsack-pro/core` to GitHub first. Then you can push changes for `@knapsack-pro/cypress` to ensure the CI will use the latest `@knapsack-pro/core`.

#### Example Cypress test suite

To test `@knapsack-pro/cypress` against real test suite we use forked [cypress-example-kitchensink](https://github.com/KnapsackPro/cypress-example-kitchensink/blob/knapsack-pro/README.knapsack-pro.md) project.
