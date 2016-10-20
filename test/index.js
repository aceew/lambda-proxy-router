import Alpr from './../src/index';
import data from './aws-data-file.json';
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

test('Routing > Returns false when a route has already been made', (t) => {
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

test('Routing > Returns false when no route is found', (t) => {
  const result = alprGlobal.route({
    method: '',
    path: '',
  });

  t.is(result, false);
});

test.cb(
  'Routing > Calls the handler function when a route matches with the merged event and context',
  (t) => {
    const alprLocal = new Alpr(data);
    t.plan(4);

    alprLocal.route({
      method: data.event.httpMethod,
      path: data.event.resource,
      handler: (requestData, callback) => {
        t.is(typeof requestData, 'object');
        t.is(typeof requestData.context, 'object');
        t.deepEqual(requestData.context, data.context);
        t.is(typeof callback, 'function');

        t.end();
      },
    });
  }
);
