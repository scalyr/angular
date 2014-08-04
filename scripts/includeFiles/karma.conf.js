// Karma configuration
// This assumes you run karma from the root of the repository.
//

module.exports = function(config) {
  config.set({
      // base path, that will be used to resolve files and exclude
      basePath: '../../',

      // Jasmine is our unit test framework.
      frameworks: ['jasmine'],

      // list of files / patterns to load in the browser
      files: [
          'src/js/thirdparty/angular.js',
          'src/tests/thirdparty/angular-mocks.js',
          'src/tests/thirdparty/sinon.js',
          'src/js/core.js',
          'src/js/lib/*.js',
          'src/js/directives/*.js',
          'src/tests/*.js',
          'src/tests/lib/*.js',
          'src/tests/directives/*.js',
          { pattern: 'src/tests/directives/*.html', included: false, served: true },
          { pattern: 'src/tests/lib/*.html', included: false, served: true },
          { pattern: 'src/tests/thirdparty/jasmine/*.js', included: false, served: true },
          { pattern: 'src/tests/thirdparty/jasmine/*.css', included: false, served: true },
      ],

      // Tell the http server to sever all files from http://localhost:9876/src/
      proxies:  {
          '/src/': 'http://localhost:9876/base/src/',
      },

      // list of files to exclude
      exclude: [
      ],

      // test results reporter to use
      // possible values: 'dots', 'progress', 'junit'
      reporters: ['progress'],


      // web server port
      port: 9876,


      // cli runner port
      runnerPort: 9100,

      // enable / disable colors in the output (reporters and logs)
      colors: true,

      // level of logging
      // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
      logLevel: config.LOG_INFO,

      // enable / disable watching file and executing tests whenever any file changes
      autoWatch: true,

      // Start these browsers, currently available:
      // - Chrome
      // - ChromeCanary
      // - Firefox
      // - Opera
      // - Safari (only Mac)
      // - PhantomJS
      // - IE (only Windows)
      browsers: ['Chrome'],


      // If browser does not capture in given timeout [ms], kill it
      captureTimeout: 60000,

      // Continuous Integration mode
      // if true, it capture browsers, run tests and exit
      singleRun: false,

      plugins: [
          'karma-jasmine',
          'karma-chrome-launcher',
      ],
  });
}

