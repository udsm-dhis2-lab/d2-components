# D2 components

Combination of different components/libraries to simplify the development of DHIS2 based application using Angular ecosystem

## Local development

If you want to collaborate to the codebase, to run the codebase locally;

1. Clone the source code

`git clone https://github.com/udsm-dhis2-lab/d2-components.git`

2. Install all needed dependencies

`npm install` or `yarn install`

**NOTE**: Sometimes npm installation may failed due to mismatch in resolving package version dependencies. If you are using npm then run `npm install --legacy-peer-deps` to ensure all packages regardless of unmatched dependencies are getting installed. This may however break the code if the packages dependencies are incompatible

3. You will be required to set up a proxy config file named `proxy-config.json`. You can simply copy `proxy-config.example.json` and modify your access credentials to DHIS2 instances to run the demo application.

4. To run the demo app, in order to view and test the components `npm run serve:demo` or `yarn serve:demo`

## Deployment

- To build, run `npm run build:<library name>` or `yarn build:<library name>`
- To pack, run `npm run pack:<library name>` or `yarn pack:<library name>`
- To publish to npm, run `npm run publish:<library name>` or `yarn publish:<library name>`. But you will be required to have access to `@iapps` npm namespace and have already logged in under your terminal. Run `npm login` to login with your terminal

## Local deployment

If you want to publish the library in you local registry, assuming you are using `verdaccio` run

`npm run publish-local:<library name>` or `yarn publish-local:<library name>`

For more information about installing `verddacio`, please visit https://verdaccio.org/
