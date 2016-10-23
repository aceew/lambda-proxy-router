# aws-lambda-proxy-router
> A hapi inspired router for AWS Lambda proxy functions

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
$ npm install --save aws-lambda-proxy-router
```
If you're using yarn:
```console
$ yarn add aws-lambda-proxy-router
```

Lambda index handler:

```
import Alpr from 'aws-lambda-proxy-router';

function handler(event, context, callback) {
  const alpr = new Alpr(event, context, callback);

  alpr.route({
    method: 'GET',
    path: '/url/{variableName}',
    handler: (request, response) => {
      response({
        statusCode: 200,
        headers: {},
        body { hello: "world" }
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
        body { hello: "world" }
      });
    },
  });
}

export { handler };
```

## Routes
Routes are used to match a request to a given handler and are easily defined by the route method on the instance of the router. The route method takes one object parameter which should contain 3 keys.

| Key | Type | Value |
|---|---|---|---|
| method | string/array | The http method the route should match for. More than one can be specified
| path | string/array | This should match the value of the route specified in API gateway including path parameter names
| [handler](#handler) | function | The handler function for the given route. Should take two parameters of [request](#request) and [response](#response).

Before creating a route the router must be instanced. This is done like so:

`const alpr = new Alpr(event, context, callback);`

Creating an instance requires specifying all the Lambda parameters as parameters to the router.


An example of defining routes that match on single and multiple endpoints can be found in the [usage](#usage) section.

It is important to note that only one route can be matched per instance. In cases where the route and method is the same in multiple route definitions only the first route will call the handler, the second will be ignored.

## Handler
## Request
## Response
## Contributing
