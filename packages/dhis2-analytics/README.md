# Function Analytics Library

Javascript Library based on micro-service design pattern to support and improve the development of function indicators. Built with best practices in mind from the experience of writing function indicators.

Function analytics makes it easy for developers to focus on the business logic of their functions indicator while also considering the best way to perform analytics operations with out of the box performance execution strategy.

## Features

- Fetching data for analytics.
- Fetching DHIS Identifiable objects.
- Perform execution of functions with optimization

## Quickstart Guide

### Install

Start with adding fn-analytics to your project:

`npm install @iapps/function-analytics`

After installing you will be able to import the library into your project by using the files in the `lib` folder:

```js
// Using ES2015 imports
import { Fn } from '@iapps/function-analytics';

// Using CommonJS imports
var Fn = require('@iapps/function-analytics').Fn;
```

## Initializing the library

To be able to use fn-analytics you will first need to initialise the library. This is required to let the library know where it should load its data from.

```js
Fn.init({
  baseUrl: 'api_url_to_dhis_server',
  username: 'username', //Optional if in a DHIS app
  pasword: 'password' //Optional if in a DHIS app
});
```

## Fetch analytics

You can fetch analytic with a few lines of code

```js
new Fn.Analytics()
  .setData('dx')
  .setOrgUnit('ou')
  .setPeriod('pe')
  .postProcess(function(analyticsResult) {
    // This adds post processing after fetching is done
    return analyticsResult;
  })
  .get()
  .progress(function(value) {
    // Do something with the progress value
  })
  .then(function(analyticsResult) {
    //The result after fetching and processing with the post process callback
  });
```

## Dependency

You can put together dependencies if calls depend on one another

```js
var orgunit = new Fn.IdentifiableObject('organisationUnits'); // Example of an organisation fetcher

orgunit.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);
//Declare business process to run after orgunit results
var bussinessAfterOrgunitProcess = (orgUnitResult, analytics) => {
  // Adds dependency
  let ous = orgUnitResult.organisationUnits
    .map(organisationUnit => {
      return organisationUnit.id;
    })
    .join(';');

  analytics.setPeriod('2016').setOrgUnit(ous);
};
var analytics = new Fn.Analytics();

analytics.preProcess(new Fn.Dependency(orgunit, bussinessAfterOrgunitProcess));
analytics.get().then(results => {});
```

## Multiple Processing

You can invoke multiple processes

```js
var orgunit = new Fn.IdentifiableObject('organisationUnits');

orgunit.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);

var analytics = new Fn.Analytics();

analytics.setPeriod('2016').setOrgUnit('Rp268JB6Ne4;Rp268JB6Ne2');

var multiProcesses = Fn.all([orgunit, analytics]);
multiProcesses.postProcess(res => {
  //res[0] is from orgunit
  //res[1] is from analytics
  return [res[1], res[0]];
});
multiProcesses.get().then(results => {});
```

## Microservice Architecture

![](https://lh3.googleusercontent.com/xNrhIlfv2WVT8z9tC0D1LzGaTWCjatL1SPadkGyld2SMND0ySjcYQ9fvRNBtSAD0Q5WhC7-3eLPOaZCfjrC_uqNg9-xwdj4bKt5a3k6gsezq0ULuGG21sJKKsYUrNvl8snbWg-9ICM1PIzOCOqePR1v6ihQu6EimcA5OffKZ0-cbDDFgbvZRr0Rab-nrRayXJjTi_1JIvLIByCFdDkmiKm3wDduIkGxI5jET3cm_1cHIuE3QvIDaBgnP44Y-Dy4alyq8MZMDLnj7pJlK9_pmCxwUG9dfuXMC6x90WWYjXDE_UsfjpXqc8CR6QBdvXX5RD5ByfwjTlMJjeqEVo2tiLM-VUm-NJ6XdnT1fFwvnokQ-ENGTmotf8PR1m3cOF3N3hBC1OPhV7bv2cooF_gAFwsIeGYKxOXeky7Mkg48sqMv5VcnoVN1TfrOGQah2L9-04q9bFv6No8li6tj8aYpCvtfgYx3E8Vv0CpCk83_v_ilrRJDl7LEl3j_rejoCEtSECrMNivXUyG2FpXtdSAeEkiZuvzMVEKE2yznrO0drYUfBIcL-cT-VQb5wLPkAGQzfxOyKd2-yIrnrRLQ90bsza1JKipxMonZhGXq7dIQ=w1299-h738)

With microservice architecture, function indicators have been designed to be a collection of loosely coupled services,which alows continous delivery and deployment of service, re-usable accross dhis2 instances and implementations.

Functions analytics microservice design has been implemented to run on both client-side as well as service server side implementation.

## Advantages of function analytics

1. Lighter functions size and overhead on datastore storage
2. Easier and faster chores on maintenance/upgrading of functions(only logic)
3. Easier and faster debugging(only logic), all services and utilities outsourced to function analytics
4. Easier performance improvements and shipping of code fixes(fix once enjoy everywhere), through iterative improvement of analytics library
5. Room for unit testing across multiple scenarios(instead of going to server/network we can simulate returned results and automate lot of scenarios and bring logic tests of codes ASAP, minimize chances of failures)
6. Room for improving efficiency with local storage and shared resources(within d2 abstraction)
7. Extension and re-use of d2 library and process, improving on existing foundation, with less work and have cheat sheet doc of available methods right there in the editor.
8. Makes room for focusing on excel like UI and ux, extending d2 with excel like function library re-usable on-demand via function expressions
9. Minimal and shorter syntax, logic, promises and ajax error failures and better try and catch workflow, as user won't write any ajax
10. Much less knowledge/learning-curve needed to write functions(no need to know dhis2 api or ajax promises)
11. No more dependency necessary to any framework(jQuery, etc...), as majority of needed utilities are abstracted in function analytics
12. Sets a center stage for functions to be viable for back-end microservice computation, easily invoked in backend with any server utilities and programs
13. Allows easier stress and time-lag testing of functions in case of huge volume of selections, and anticipate impacts of functions long before they're put to production
14. Potential support for code completion during development as entire library is right there for use(making development even easier)
15. Room for porting of javascript implementation to postgres procedures and other language implementation that can be transpiled for execution in backend with any other technologies other than javascript
