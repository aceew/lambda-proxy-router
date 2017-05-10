# aws-lambda-proxy-router
> A hapi inspired router for AWS Lambda proxy functions

[![Coverage Status](https://coveralls.io/repos/github/aceew/lambda-proxy-router/badge.svg?branch=master)](https://coveralls.io/github/aceew/lambda-proxy-router?branch=master)
[![Build Status](https://travis-ci.org/aceew/lambda-proxy-router.svg?branch=master)](https://travis-ci.org/aceew/lambda-proxy-router)

The purpose of this package is to easily organize the mapping between your code and your API request within Lambda functions that have more than one purpose. This takes away the need for the configuration of mapping templates and handles the standard event object that Amazon sends through with Lambda functions with proxy configuration. The desired effect of the package is to make it easier to build microservices that have multiple API Gateway endpoints.

## Contents
- [Usage](#usage)
- [Defining Routes](#routes)
- [Handler Function](#handler)
- [Request Object](#request)
- [Response Function](#response)
- [Contributing](#contributing)

## Usage
### Add aws-lambda-proxy-router to your project
```console
$ npm install --save alpr
```
If you're using yarn:
```console
$ yarn add alpr
```

Lambda index handler:

```
import Alpr from 'alpr';

function handler(event, context, callback) {
  const alpr = new Alpr({ event, context, callback });

  alpr.route({
    method: 'GET',
    path: '/url/{variableName}',
    handler: (request, response) => {
      response({
        statusCode: 200,
        headers: {},
        body: { hello: "world" }
      });
    },
  });

  alpr.route({
    method: [
      'GET',
      'POST',
    ],
    path: [
      '/url/url-level-2/{variableName}',
      '/url/url-level-2/data/{variableName}',
    ],
    handler: (request, response) => {
      response({
        statusCode: 200,
        headers: {},
        body: { hello: "world" }
      });
    },
  });

  if (!alpr.routeMatched) {
    // request resource did not match a route
    callback({
      statusCode: 404,
      headers: {},
      body: { message: "Route not found" }
    });
  }
}

export { handler };
```
### Setting up your endpoint in API Gateway
Create your endpoint in API Gateway for the Lambda function and check the `Use Lambda Proxy integration` box. Then point your endpoint to the lambda function that has that route specified.

## Routes
Routes are used to match a request to a given handler and are easily defined by the route method on the instance of the router. The route method takes one object parameter which should contain 3 keys.

| Key | Type | Value
|---|---|---
| method | string/Array | The http method the route should match for. More than one can be specified
| path | string/Array | This should match the value of the route specified in API gateway including path parameter names
| [handler](#handler) | Function | The handler function for the given route. Should take two parameters of [request](#request) and [response](#response).

Before creating a route the router must be instanced. This is done like so:

`const alpr = new Alpr(event, context, callback);`

Creating an instance requires specifying all the Lambda parameters as parameters to the router.


An example of defining routes that match on single and multiple endpoints can be found in the [usage](#usage) section.

It is important to note that only one route can be matched per instance. In cases where the route and method is the same in multiple route definitions only the first route will call the handler, the second will be ignored.

## Handler
The handler is the method that get called when a route matches. It accepts two parameters [request](#request) and [response](#response).

## Request
The request parameter is an object that contains details about the request, everything that is sent through the event and context parameters in the Lambda function is accessible through this object.

Here's all the keys that are currently available in the request object:

| Key | Type | Value
|---|---|---
| request.contextObject | Object | The whole lambda context object.
| request.eventObject | Object | The whole lambda event object.
| request.stageVariables | Object | The API Gateway stage variables.
| request.queryStringParameters | Object | Query string parameters.
| request.body | Object | The JSON parsed body.
| request.rawBody | string | The raw body input.
| request.pathParameters | Object | Request path parameters.
| request.headers | Object | Request headers.
| request.allParams | Object | The pathParameters, queryStringParameters and body, merged into one object. Note if variables have identical names, queryStringParameters will overwrite pathParameters and pathParameters will overwrite body.


## Response
The response parameter is used to send a response back to API gateway. This method requires a parameter object to specify the body, headers and http status code.

| Key | Type | Value | Default
|---|---|---|---
| params | Object | Parameters object | {}
| params.statusCode | integer | The HTTP status code | 200
| params.headers | Object | Any headers to be returned in the response. | {}
| params.body | mixed | Your response body, whatever is specified will be `JSON.stringify`'d. If body is not set the body will be defined as the params object. | `JSON.stringify(params)`
| params.isBase64Encoded | boolean | This is usually used for serving binary data from an API. | false

Here is the recommended way to call the response method.
```
response({
    statusCode: 200,
    headers: { "x-your-header": "header value" },
    body: { "response-object-key": "data" },
});
```

More information about the proxy response object can be found on the [AWS documentation](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html).

If any of the correct parameters are not specified, default values of empty headers, statusCode 200, and a stringified value of whatever was sent in the parameter for the body are used to make the response valid.

So `response('hello world')` would work out as:
```
{
    statusCode: 200,
    headers: {},
    body: "hello world"
}
```

The specific structure used here is what API Gateway requires to map the responses correctly.

## Contributing
 - Start a feature branched from master
 - Tests should be written for any new features in the test directory.
 - Code should follow the installed style guide of airbnb.
 - Tests and linting can be run with `npm test`.
 - Once your feature is complete submit a PR to the master branch.
