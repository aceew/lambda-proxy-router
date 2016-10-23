import Request from './../src/request';
import data from './aws-data-file.json';
// eslint-disable-next-line
import test from 'ava';

const requestGlobal = new Request(data);
const requestNullGlobal = new Request({});

test('Getting the context object', (t) => {
  const context = requestGlobal.contextObject;
  t.deepEqual(context, data.context);
});

test('Getting the event object', (t) => {
  const event = requestGlobal.eventObject;
  t.deepEqual(event, data.event);
});

test('Getting stage variables', (t) => {
  const stageVariables = requestGlobal.stageVariables;
  t.deepEqual(stageVariables, data.event.stageVariables);

  const nullStageVariables = requestNullGlobal.stageVariables;
  t.deepEqual(nullStageVariables, {}, 'Empty object if stageVariables are unavailable');
});

test('Getting the queryStringParameters', (t) => {
  const queryStringParameters = requestGlobal.queryStringParameters;
  t.deepEqual(queryStringParameters, data.event.queryStringParameters);

  const nullQueryStringParameters = requestNullGlobal.queryStringParameters;
  t.deepEqual(
    nullQueryStringParameters, {}, 'Empty object if queryStringParameters are unavailable'
  );
});

test('Getting the body object', (t) => {
  const body = requestGlobal.body;
  t.is(typeof body, 'object');

  const bodyInvalidJson = requestNullGlobal.body;
  t.is(typeof bodyInvalidJson, 'object', 'Empty object when the json was not parsable');
});

test('Getting the rawBody', (t) => {
  const rawBody = requestGlobal.rawBody;
  t.is(rawBody, data.event.body);
});

test('Getting the pathParameters', (t) => {
  const pathParameters = requestGlobal.pathParameters;
  t.deepEqual(pathParameters, data.event.pathParameters);

  const nullPathParameters = requestNullGlobal.pathParameters;
  t.deepEqual(nullPathParameters, {}, 'Empty object if pathParameters are unavailable');
});

test('Getting the headers', (t) => {
  const headers = requestGlobal.headers;
  t.deepEqual(headers, data.event.headers);

  const nullHeaders = requestNullGlobal.headers;
  t.deepEqual(nullHeaders, {}, 'Empty object if headers are unavailable');
});

test('Getting all the parameters', (t) => {
  const allParams = requestGlobal.allParams;

  t.is(allParams.param1, data.event.queryStringParameters.param1);
  t.is(allParams.testVar, data.event.pathParameters.testVar);
  t.is(allParams.request, JSON.parse(data.event.body).request);
});
