import Alpr from './../src/index';
import data from './aws-data-file.json';

data.callback = () => {};
// eslint-disable-next-line
import test from 'ava';

const alprGlobal = new Alpr(data);

test('Route Matching > matches path strings and resource strings', (t) => {
  const result = alprGlobal.routeMatcher({
    method: data.event.httpMethod,
    path: data.event.resource,
  });

  t.is(result, true);
});

test('Route Matching > matches resource path and resource arrays', (t) => {
  const result = alprGlobal.routeMatcher({
    method: [
      data.event.httpMethod,
      'anotherString',
    ],
    path: [
      data.event.resource,
      'anotherString',
    ],
  });

  t.is(result, true);
});

test('Route Matching > does not match when the arrays do not contain the method or path', (t) => {
  const result = alprGlobal.routeMatcher({
    method: [
      'randomString',
      'anotherString',
    ],
    path: [
      'randomString',
      'anotherString',
    ],
  });

  t.is(result, false);
});

test('Route Matching > does not match when the strings do not contain the method or path', (t) => {
  const result = alprGlobal.routeMatcher({
    method: 'string',
    path: 'anotherString',
  });

  t.is(result, false);
});

test('Routing > returns false when a route has already been made', (t) => {
  // Use a new instance because we're relying on instance variables that can be changed.
  const alprLocal = new Alpr(data);

  const matchedRoute = {
    method: data.event.httpMethod,
    path: data.event.resource,
    handler: () => {},
  };

  alprLocal.route(matchedRoute);

  const result = alprLocal.route(matchedRoute);
  t.is(result, false);
});

test('Routing > returns false when no route is found', (t) => {
  const result = alprGlobal.route({
    method: '',
    path: '',
  });

  t.is(result, false);
});

test.cb(
  'Routing > calls the handler function when a route matches',
  (t) => {
    const alprLocal = new Alpr(data);
    t.plan(2);

    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => {
        t.is(typeof requestData, 'object');
        t.is(typeof response, 'function');
        t.end();
      },
    });
  }
);

test('Route Class > throws an error when a callback function is not specified', (t) => {
  let alprCallbackError = '';

  try {
    alprCallbackError = new Alpr();
  } catch (err) {
    // Check the redefinition failed
    t.is(alprCallbackError, '');
    t.pass();
  }
});

test.cb(
  'Route handler > calls back with the correct structure when an invalid one is returned',
  (t) => {
    t.plan(6);
    const returnedString = 'Hello World!';

    const lambdaCallback = (err, response) => {
      t.is(typeof response, 'object');
      t.is(response.statusCode, 200);
      t.is(typeof response.headers, 'object');
      t.deepEqual(response.headers, {});
      t.is(typeof response.body, 'string');
      t.is(JSON.parse(response.body), returnedString);
      t.end();
    };

    const alprParams = Object.assign({}, data);
    alprParams.callback = lambdaCallback;

    const alprLocal = new Alpr(alprParams);
    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => response(returnedString),
    });
  }
);

test.cb(
  'Route handler > calls back with the correct structure when the correct one is returned', (t) => {
    t.plan(2);

    const returnedResponse = {
      statusCode: 400,
      headers: {
        data: 'field',
      },
      body: {
        foo: 'bar',
        bar: 'foo',
      },
    };

    const lambdaCallback = (err, response) => {
      t.is(typeof response, 'object');

      // The returned response will be deep equal once the body has been parsed.
      const parsedResponse = response;
      parsedResponse.body = JSON.parse(parsedResponse.body);

      t.deepEqual(parsedResponse, returnedResponse);
      t.end();
    };

    const alprParams = Object.assign({}, data);
    alprParams.callback = lambdaCallback;

    const alprLocal = new Alpr(alprParams);
    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => response(returnedResponse),
    });
  }
);
