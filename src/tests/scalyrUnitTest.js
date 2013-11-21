/**
 * @fileoverview
 * The core testing abstractions used by Scalyr.
 * Currently, we use Jasmine for our tests.  This
 * file only contains the additional testing support
 * code we require.
 */

/**
 * Run all unit tests defined in scope.  These unit
 * tests are created using Jasmine's
 * 'describe' and 'it' methods.  This method is meant
 * to be invoked in the head of the HTML page created to
 * a suite of tests, after all those tests are defined.
 */
function runUnitTests() {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    execJasmine();
  };

  function execJasmine() {
    jasmineEnv.execute();
  }  
}



