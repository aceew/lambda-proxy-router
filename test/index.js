import test from 'ava';
import sinon from 'sinon';
import Alpr from './../src/index';
import data from './aws-data-file.json';

data.callback = () => {};

const alprGlobal = new Alpr(data);
const sandbox = sinon.sandbox;

test.afterEach(() => {
  sandbox.restore();
});

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

test.cb(
  'Route handler > calls back with an empty object as the body when no params are provided',
  (t) => {
    t.plan(2);
    const lambdaCallback = (err, response) => {
      t.is(typeof response, 'object');
      t.deepEqual(response.body, '{}');
      t.end();
    };

    const alprParams = Object.assign({}, data);
    alprParams.callback = lambdaCallback;

    const alprLocal = new Alpr(alprParams);
    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => response(),
    });
  }
);

test.cb(
  'Route handler > returns isBase64Encoded on the response object when true in response data',
  (t) => {
    t.plan(3);
    const lambdaCallback = (err, response) => {
      t.is(typeof response, 'object');
      t.deepEqual(response.body, {});
      t.true(response.isBase64Encoded);
      t.end();
    };

    const alprParams = Object.assign({}, data);
    alprParams.callback = lambdaCallback;

    const alprLocal = new Alpr(alprParams);
    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => response({ body: {}, isBase64Encoded: true }),
    });
  }
);

test.cb(
  'Route handler > returns isBase64Encoded on the response object when true in response data',
  (t) => {
    t.plan(3);
    const lambdaCallback = (err, response) => {
      t.is(typeof response, 'object');
      t.deepEqual(response.body, '');
      t.true(response.isBase64Encoded);
      t.end();
    };

    const alprParams = Object.assign({}, data);
    alprParams.callback = lambdaCallback;

    const alprLocal = new Alpr(alprParams);
    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => response({ isBase64Encoded: true }),
    });
  }
);

test.cb(
  'Route handler > returns response object without isBase64Encoded when undefined in response data',
  (t) => {
    t.plan(2);
    const lambdaCallback = (err, response) => {
      t.is(typeof response, 'object');
      t.not(response.isBase64Encoded, true);
      t.end();
    };

    const alprParams = Object.assign({}, data);
    alprParams.callback = lambdaCallback;

    const alprLocal = new Alpr(alprParams);
    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, response) => response(),
    });
  }
);

test('String Matching > will return false when no params are provided', (t) => {
  // Just for default params
  t.is(Alpr.inArrayOrIsString(), false);
});

test('Logging request ids > Logs out the ids when they are available', (t) => {
  const spy = sandbox.spy(console, 'log');

  alprGlobal.logRequestIds();
  const consoleLog = spy.getCall(0).args[0];
  t.true(consoleLog.includes(data.event.requestContext.requestId));
  t.true(consoleLog.includes(data.context.awsRequestId));
});

test('Logging request ids > Does not log out the ids when they are not available', (t) => {
  const alprLocal = new Alpr({ callback: () => {} });
  alprLocal.logRequestIds();
  const spy = sandbox.spy(console, 'log');
  t.false(spy.calledOnce);
});
