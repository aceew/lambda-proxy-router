export class Alpr {
  constructor(data) {
    this.routeMatched = false;
    this.event = data.event;
    this.context = data.context;
    this.callback = data.callback;
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
    return params.handler({}, this.response);
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

    methodMatched = params.method.indexOf(this.event.httpMethod) > -1;
    resourceMatched = params.path.indexOf(this.event.resource) > -1;

    return (methodMatched && resourceMatched);
  }


  /**
   * Should be used to send a response back to the client, acting as a wrapper for Lambda's callback
   * function, except this only sends data as the second parameter.
   *
   * @param {mixed} data
   * The response to send back to the client.
   */
  response(data) {
    return this.callback(null, data);
  }
}
