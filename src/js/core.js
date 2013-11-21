/**
 * @fileoverview 
 * Defines core functions used throughout the Scalyr javascript
 * code base.  This file is included on every page.
 *
 * @author Steven Czerwinski <czerwin@scalyr.com>
 */

/**
 * @param {Object} value The value to check
 * @returns {Boolean} True if value is an Array
 */
function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is a Boolean
 */
function isBoolean(value) {
  return typeof value == 'boolean';
}

/**
 * @param {Object} value The value to check
 * @returns {Boolean} True if value is a Date object
 */
function isDate(value) {
  return Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is undefined
 */
function isDefined(value) {
  return typeof value != 'undefined';
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is a Function
 */
function isFunction(value) {
  return typeof value == 'function';
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is null
 */
function isNull(value) {
  return value === null;
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is a Number
 */
function isNumber(value) {
  return typeof value == 'number'; 
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is an Object, not including null
 */
function isObject(value) {
  return value !== null && typeof value == 'object';
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is a string
 */
function isString(value) {
  return typeof value == 'string';
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} True if value is undefined
 */
function isUndefined(value) {
  return typeof value == 'undefined';
}

/**
 * Converts a String or Boolean value to a Boolean.
 *
 * @param {String|Boolean} value The value to convert
 * @returns {Boolean} Returns true for any String that is not
 *   null, empty String, or 'false'.  If value is a Boolean,
 *   returns value
 */
function convertToBoolean(value) {
  if (isBoolean(value))
    return value;
  return value !== null && value !== '' && value !== 'false';
}

/**
 * Determines if obj has a property named prop.
 *
 * @param {Object} obj The object to check
 * @returns {Boolean} Returns true if obj has a property named
 *   prop.  Only considers the object's own properties
 */
function hasProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} Returns true if value is a String
 *   and has zero length, or if null or undefined
 */
function isStringEmpty(value) {
  return isNull(value) || isUndefined(value) ||
    (isString(value) && (value.length == 0));
}

/**
 * @param {*} value The value to check
 * @returns {Boolean} Returns true if value is a String
 *   and has non-zero length
 */
function isStringNonempty(value) {
  return isString(value) && (value.length > 0);
}

/**
 * Returns input with the first letter capitalized.
 * The input may not be zero length.
 *
 * @param {String} input The String to capitalize.
 * @returns {String} Returns input with the first letter
 *   capitalized.
 */
function upperCaseFirstLetter(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Returns true if obj1 and obj2 are equal.  This should
 * only be used for Arrays, Objects, and value types.  This is a deep
 * comparison, comparing each property and recursive property to
 * be equal (not just ===).
 *
 * Two Objects or values are considered equivalent if at least one of the following is true:
 *  - Both objects or values pass `===` comparison.
 *  - Both objects or values are of the same type and all of their properties pass areEqual
 *    comparison.
 *  - Both values are NaN. (In JavasScript, NaN == NaN => false. But we consider two NaN as equal).
 *
 * Note, during property comparision, properties with function values are ignores as are property
 * names beginning with '$'.
 *
 * See angular.equal for more details.
 *
 * @param {Object|Array|value} obj1 The first object
 * @param {Object|Array|value} obj2 The second object
 * @returns {Boolean} True if the two objects are equal using a deep
 *   comparison. 
 */
function areEqual(obj1, obj2) {
  return angular.equals(obj1, obj2);
}

/**
 * @param {Number} a The first Number
 * @param {Number} b The second Number
 * @returns {Number} The minimum of a and b
 */
function min(a, b) {
  return a < b ? a : b;
}

/**
 * @param {Number} a The first Number
 * @param {Number} b The second Number
 * @returns {Number} The maximum of a and b
 */
function max(a, b) {
  return a > b ? a : b;
}

/**
 * Returns true if the specified String begins with prefix.
 *
 * @param {*} input The input to check
 @ @param {String} prefix The prefix
 * @returns {Boolean} True if input is a string that begins with prefix
 */
function beginsWith(input, prefix) {
  return isString(input) && input.lastIndexOf(prefix, 0) == 0;
}

/**
 * Returns true if the specified String ends with prefix.
 *
 * @param {*} input The input to check
 @ @param {String} postfix The postfix
 * @returns {Boolean} True if input is a string that ends with postfix
 */
function endsWith(input, postfix) {
  return isString(input) && input.indexOf(postfix, input.length - postfix.length) !== -1;
}

/**
 * Returns a deep copy of source, where source can be an Object or an Array.  If a destination is
 * provided, all of its elements (for Array) or properties (for Objects) are deleted and then all
 * elements/properties from the source are copied to it.   If source is not an Object or Array, 
 * source is returned.
 *
 * See angular.copy for more details.
 * @param {Object|Array} source The source
 * @param {Object|Array} destination Optional object to copy the elements to
 * @returns {Object|Array} The deep copy of source
 */
function copy(source, destination) {
  return angular.copy(source, destination);
}

/**
 * Removes property from obj.
 *
 * @param {Object} obj The object
 * @param {String} property The property name to delete
 */
function removeProperty(obj, property) {
  delete obj[property];
}

/**
 * Removes all properties in the array from obj.
 *
 * @param {Object} obj The object
 * @param {Array} properties The properties to remove
 */
function removeProperties(obj, properties) {
  for (var i = 0; i < properties.length; ++i)
    delete obj[properties[i]];
}

/**
 * Invokes the iterator function once for each item in obj collection, which can be either
 * an Object or an Array. The iterator function is invoked with iterator(value, key),
 * where value is the value of an object property or an array element and key is the
 * object property key or array element index. Specifying a context for the function is
 * optional.  If specified, it becomes 'this' when iterator function is invoked.
 *
 * See angular.forEach for more details.
 *
 * @param {Object|Array} The Object or Array over which to iterate
 * @param {Function} iterator The iterator function to invoke
 * @param {Object} context The value to set for 'this' when invoking the
 *   iterator function. This is optional
 */
function forEach(obj, iterator, context) {
  return angular.forEach(obj, iterator, context);
}

/**
 * Used to define a Scalyr javascript library and optionally declare
 * dependencies on other libraries.  All javascript code not defined in
 * this file should be defined as part of a library.
 *
 * The first argument is the name to call the library.  The second argument
 * is either a Constructor object for the library or an array where the last
 * element is the Constructor for the library and the first to N-1 are string
 * names of the libraries this one depends on.  If you do declare dependencies,
 * the libraries are passed in the Constructor create method in the same order
 * as the strings are defined.
 *
 * Example:
 *  defineScalyrJsLibrary('myUtils', function() {
 *    var fooFunction = function(a, b) {
 *        return a + b;
 *    };
 *    return {
 *      foo: fooFunction
 *    };
 *  });
 *
 *  defineScalyrJsLibrary('anotherUtils', [ 'myUtils', function(myUtils) {
 *    var barFunction = function(a, b) {
 *      return myUtils.foo(a, b);
 *    };
 *    return {
 *      bar: barFunction
 *    };
 *  });
 *
 * @param {String} libraryName The name for the library
 * @param {Constructor|Array} libraryExporter The exporter for the
 *   library.  See above for details
 */
function defineScalyrJsLibrary(libraryName, libraryExporter) {
  var moduleDependencies = [];
  if (libraryExporter instanceof Array) {
    for (var i = 0; i < libraryExporter.length - 1; ++i)
      moduleDependencies.push(libraryExporter[i]);
  }
  
  return angular.module(libraryName, moduleDependencies)
    .factory(libraryName, libraryExporter);              
}

/**
 * Similar to defineScalyrJsLibary but instead of declaring
 * a purely javascript library, this declares an Angular module
 * library.  The moduleName should be a string used to identify
 * this module.  The dependencies is an array with the string
 * names of Angular modules, Scalyr Angular modules, or Scalyr
 * javascript libraries to depend on.  The returned object
 * can be used to define directives, etc similar to angular.module.
 *
 * Example:
 *  defineScalyrAngularModule('slyMyModule', [ 'myTextUtils'])
 *  .filter('camelCase', function(myTextUtils) {
 *     return function(input) {
 *       return myTextUtils.camelCase(input);
 *     };
 *  });
 *
 * @param {String} moduleName The name of the module
 * @param {Array} dependencies The names of modules to depend on
 */
function defineScalyrAngularModule(moduleName, dependencies) {
  return angular.module(moduleName, dependencies);
}
