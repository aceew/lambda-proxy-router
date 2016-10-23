/**
 * Used as the first parameter in route handler methods.
 */
export default class Request {
  /**
   * Adds the event and context to the instance.
   *
   * @param {Object} params
   * Parameters containing request information
   *
   * @param {Object} params.event
   * The lambda event object.
   *
   * @param {Object} params.context
   * The lambda context object.
   */
  constructor(params = {}) {
    this.event = params.event || {};
    this.context = params.context || {};
  }

  /**
   * Gets the whole lambda context object.
   *
   * @return {Object}
   * The lambda context object
   */
  get contextObject() {
    return this.context;
  }

  /**
   * Gets the whole lambda event object.
   *
   * @return {Object}
   * The lambda event object
   */
  get eventObject() {
    return this.event;
  }

  /**
   * Gets the stage variables from the event object.
   *
   * @return {Object}
   * Returns the stage variables if they are available. Will return an empty object if not.
   */
  get stageVariables() {
    return this.event.stageVariables || {};
  }

  /**
   * Gets the query string parameters from the event.
   *
   * @return {Object}
   * An object containing all the query string parameters.
   */
  get queryStringParameters() {
    return this.event.queryStringParameters || {};
  }

  /**
   * Gets the JSON parsed body from the request. If the body is not parseable an empty object is
   * returned.
   *
   * @return {Object}
   * JSON parsed body input.
   */
  get body() {
    let body;

    try {
      body = JSON.parse(this.event.body);
    } catch (error) {
      body = {};
    }

    return body;
  }

  /**
   * Returns the raw body sent in the request without it being JSON parsed.
   *
   * @return {string}
   * The raw body from the request.
   */
  get rawBody() {
    return this.event.body;
  }

  /**
   * Returns the inputted pathParameters from the event object.
   *
   * @return {Object}
   * The path parameters object.
   */
  get pathParameters() {
    return this.event.pathParameters || {};
  }

  /**
   * Return the headers object or an empty object from the event.
   *
   * @return {Object}
   * The headers from the request
   */
  get headers() {
    return this.event.headers || {};
  }

  /**
   * Gets all of the input parameters combined. Note if variables have identical names,
   * queryStringParameters will overwrite pathParameters and pathParameters will overwrite body.
   *
   * @return {Object}
   * An object containing all of the request parameters.
   */
  get allParams() {
    return Object.assign({}, this.body, this.pathParameters, this.queryStringParameters);
  }
}
