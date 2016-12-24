import Request from './request';

/**
 * AWS Lambda Proxy Router
 */
export default class Alpr {
  /**
   * Adds all the AWS Lambda handler function parameters to the current instance for the router to
   * match with.
   *
   * @return {void}
   */
  constructor(data = {}) {
    this.routeMatched = false;
    this.event = data.event || {};
    this.context = data.context || {};
    this.callback = data.callback;

    if (typeof this.callback !== 'function') {
      throw new Error('A callback must be specified.');
    }
  }

  /**
   * Router function. Should be called for each route you want to create.
   *
   * @param {Object} params
   * Parameters object containing the route information
   *
   * @param {string|Array} params.method
   * HTTP verb to create the route for.
   *
   * @param {string|Array} params.path
   * The path to match the route on.
   *
   * @param {Callback} params.handler
   * Function to be called when the route is matched. Should take two parameters, those being
   * request and response.
   *
   * @return {Callback|boolean}
   * Calls the handler method specified in the route information when a route matches, else returns
   * false.
   */
  route(params) {
    if (this.routeMatched || !this.routeMatcher(params)) {
      return false;
    }

    this.routeMatched = true;

    const request = new Request({ event: this.event, context: this.context });
    const instancedClass = this;

    /**
     * Should be used to send a response back to the client, acting as a wrapper for Lambda's
     * callback function, except this only sends data as the second parameter.
     *
     * @param {mixed} data
     * The response to send back to the client. Should follow the structure for lambda proxy
     * responses outlined here: https://goo.gl/pI0ApC. If the response structure is not followed, a
     * default of no headers and a status code of 200 will be applied with the body being a json
     * stringified result of the whole data parameter.
     *
     * @param {number} data.statusCode
     * The HTTP status code that the response should be. By default this will be set to 200.
     *
     * @param {Object} data.headers
     * Any headers to return with the API result.
     *
     * @param {mixed} body
     * Payload to send back as the API response. This will be json stringified.
     */
    const response = (data = {}) => {
      const responseData = {};

      responseData.statusCode = Number.isInteger(data.statusCode) ? data.statusCode : 200;
      responseData.headers = typeof data.headers === 'object' ? data.headers : {};
      responseData.body = JSON.stringify(data.body ? data.body : data);

      return instancedClass.callback(null, responseData);
    };

    return params.handler(request, response);
  }

  /**
   * Makes an attempt to match the route based on the parameters specified to the route method.
   *
   * @param {Object} params
   * Parameters object containing the route information
   *
   * @param {string|Array} params.method
   * HTTP verb to create the route for.
   *
   * @param {string|Array} params.path
   * The path to match the route on.
   *
   * @return {boolean}
   * Returns true or false depending on if the route was matched.
   */
  routeMatcher(params) {
    let resourceMatched = false;
    let methodMatched = false;

    methodMatched = Alpr.inArrayOrIsString(this.event.httpMethod, params.method);
    resourceMatched = Alpr.inArrayOrIsString(this.event.resource, params.path);

    return (methodMatched && resourceMatched);
  }

  /**
   * Retusn true when the needle is in the haystack Array or strictly when the needle is equal to
   * the haystack.
   *
   * @param {string} needle
   * Value to find in the array or to match on the string.
   *
   * @param {string|Array} haystack
   * If this is an array we check if the array contains the needle, if this is a string we check if
   * the values are strictly equal.
   *
   * @return {boolean}
   * Returns true when the haystack is not an array and it is strictly equal to the needle. Or when
   * the haystack is an array and the needle includes the value.
   */
  static inArrayOrIsString(needle = '', haystack = []) {
    if (Array.isArray(haystack)) {
      return haystack.includes(needle);
    }

    return haystack === needle;
  }
}
