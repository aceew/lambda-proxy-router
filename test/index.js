import { Alpr } from './../src/index.js';
import data from './aws-data-file.json';
import test from 'ava';

const alprGlobal = new Alpr(data);

test('Route Matching > matches path strings and resource strings', t => {
  const result = alprGlobal.routeMatcher({
    method: data.event.httpMethod,
    path: data.event.resource,
  });

  t.is(result, true);
});

test('Route Matching > matches resource path and resource arrays', t => {
  const result = alprGlobal.routeMatcher({
    method: [
      data.event.httpMethod,
      'anotherString',
    ],
    path: [
      data.event.resource,
      'anotherString',
    ]
  });

  t.is(result, true);
});

test('Route Matching > does not match when the arrays do not contain the method or path', t => {
  const result = alprGlobal.routeMatcher({
    method: [
      'randomString',
      'anotherString',
    ],
    path: [
      'randomString',
      'anotherString',
    ]
  });

  t.is(result, false);
});

test('Route Matching > does not match when the strings do not contain the method or path', t => {
  const result = alprGlobal.routeMatcher({
    method: 'string',
    path: 'anotherString',
  });

  t.is(result, false);
});
