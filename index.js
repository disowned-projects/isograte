/**
 * As this module only exposes two core functions, I haven't added any kind of
 * build setup to keep things simple. Any future changes in this file should
 * be es5 compatible so it runs on old versions of node and browser without 
 * compiling.
 *  
 */

/**
 * isolate takes a function and an optional return value. return value defaults
 * to null.
 * It returns an isolated function that only runs if process.env.NODE_ENV is
 * set to 'production' or if  isolated.__integrated is set to true before 
 * calling the function. Any arguments passed to the isolated function is
 * passed to the inner function and what that function returns back is returned
 * by the isolated function.
 * In case the function is no called, the default reutrn value is returned.
 * 
 */
function isolate(func, returnValue) {
  returnValue = returnValue || null

  return function isolated() {
    return process.env.NODE_ENV === 'production' ||
    isolated.__integrated === true
      ? func.apply(null, arguments)
      : returnValue
  }
}

/**
 * 
 * integrate takes an isolated function and integrates it back. This should 
 * mostly be used when testing an isolated function. When you call the 
 * integrated function, that function might be making calls to other isolated
 * functions. Note that those functions still remain isolated.
 * 
 */
function integrate(func) {
  return function() {
    func.__integrated = true
    var returnValue = func.apply(this, arguments)
    delete func.__integrated
    return returnValue
  }
}

module.exports.isolate = isolate
module.exports.integrate = integrate
