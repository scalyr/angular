/**
 * @fileoverview
 * Test cases for the slyEvaluate module.
 *
 * @author Steven Czerwinski <czerwin@scalyr.com>
 */
describe('slyEvaluate.slyEvaluateOnlyWhen', function() {
  // Elements from the test page.
  var scope = null;
  var page = null;
  var span = null;

  // Require the slyEvaluate module.
  beforeEach(module('slyEvaluate'));

  // Create the sample DOM elements using sly-evaluate-only-when.
  // Specifically, make all updates to page dependent on dataObject
  // and have a span containing x.
  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope;
    scope.dataObject = {
      value: 5,
    };
    scope.x = 10;

    page = angular.element(
            '<div sly-evaluate-only-when="dataObject">' +
              '<span>{{x}}</span>' +
            '</div>');

    $compile(page)(scope);
    scope.$digest();
    
    // Set the DOM references.
    span = page.find('span');
  }));

  it('should initialize all bindings', function() {
    // Just check basic functionality.
    expect(span.eq(0).text()).toEqual('10');
  });

  it('should not update bindings if object has not changed', function() {
    // Change x and do a digest.  The binding should not have updated
    // since object has not changed.
    scope.x = 12;
    scope.$digest();

    expect(span.eq(0).text()).toEqual('10');
  });

  it('should not update bindings even if contents of object has changed', function() {
    // Change x and do a digest.  The binding should not have updated
    // since object has not changed.
    scope.x = 12;
    scope.dataObject.value = 6;
    scope.$digest();

    expect(span.eq(0).text()).toEqual('10');
  });

  it('should update bindings after object reference has changed', function() {
    // Change both x and dataObject
    scope.x = 12;
    scope.dataObject = {
      value: 5,
    };
    scope.$digest();

    expect(span.eq(0).text()).toEqual('12');
  });

  it('should evaluate a new child no matter what', 
     inject(function($rootScope, $compile) {
       scope = $rootScope;
       scope.dataObject = {
         value: 5,
       };
       scope.x = 12;
      
      page = angular.element('<div sly-evaluate-only-when="dataObject"></div>');

      $compile(page)(scope);
      scope.$digest();

      // We simulate adding a new child to the div by just creating a new element
      // and compiling it in.  This is a bit hacky and hopefully won't break.
      divScope = page.scope();
      span = angular.element('<span>{{x}}</span>');
      $compile(span)(divScope);

      scope.$digest();

      expect(span.eq(0).text()).toEqual('12');
  }));
});

describe('slyEvaluate.slyAlwaysEvaluate', function() {
  // Elements from the test page.
  var scope = null;
  var page = null;
  var spanX = null;
  var spanY = null;

  // Require the slyEvaluate module.
  beforeEach(module('slyEvaluate'));

  // Create the sample DOM elements slyAlwaysEvaluate.  Specifically,
  // gate all changes on dataObject, but put in an exception for 'x'.
  // Create spans containing X and Y.
  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope;
    scope.dataObject = {
      value: 5,
    };
    scope.x = 10;
    scope.y = 'a';

    page = angular.element(
            '<div sly-evaluate-only-when="dataObject" sly-always-evaluate="x">' +
              '<span ng-bind="x"></span>' +
              '<span ng-bind="y"></span>' +
            '</div>');

    $compile(page)(scope);
    scope.$digest();
    
    // Set the DOM references.
    var span = page.find('span');
    spanX = span.eq(0);
    spanY = span.eq(1);
  }));

  it('should initialize bindings correctly', function() {
    // Just check basic functionality.
    expect(spanX.text()).toEqual('10');
    expect(spanY.text()).toEqual('a');
  });

  it('should always evaluate expressions containing the exception string', function() {
    // If we change both x and y, only x's change should show up after a digest.
    scope.x = 15;
    scope.y = 'b';
    scope.$digest();

    expect(spanX.text()).toEqual('15');
    expect(spanY.text()).toEqual('a');
  });

  it('should always evaluate all expressions when slyEvaluateOnlyWhen object changes', function() {
    // If we change both x and y and the dataObject
    scope.x = 15;
    scope.y = 'b';
    scope.dataObject = {
      value: 10,
    };
    scope.$digest();

    expect(spanX.text()).toEqual('15');
    expect(spanY.text()).toEqual('b');
  });
});

describe('slyEvaluate.slyShow', function() {
  // Elements from the test page.
  var scope = null;
  var page = null;
  var span = null;

  // Require the slyEvaluate module.
  beforeEach(module('slyEvaluate'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope;
    scope.isHidden = false;
    scope.x = 1;

    page = angular.element(
            '<div>' +
              '<span sly-show="!isHidden">Hi</span>' +
            '</div>');

    $compile(page)(scope);
    scope.$digest();
    
    // Set the DOM references.
    span = page.find('span').eq(0);
  }));

  it('should initialize showing state correctly', function() {
    // Just check basic functionality.
    expect(span.hasClass('ng-hide')).toBeFalsy();
  });

  it('should hide element when expression becomes false', function() {
    scope.isHidden = true;
    scope.$digest();
    expect(span.hasClass('ng-hide')).toBeTruthy();
  });

  it('should show element when expression becomes true', function() {
    scope.isHidden = true;
    scope.$digest();

    scope.isHidden = false;
    scope.$digest();
    expect(span.hasClass('ng-hide')).toBeFalsy();
  });
});

describe('slyEvaluate.slyPreventEvaluationWhenHidden', function() {
  // Elements from the test page.
  var scope = null;
  var page = null;
  var spanX = null;

  // Require the slyEvaluate module.
  beforeEach(module('slyEvaluate'));

  // Create the sample DOM elements slyAlwaysEvaluate.  Specifically,
  // gate all changes on dataObject, but put in an exception for 'x'.
  // Create spans containing X and Y.
  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope;
    scope.isHidden = false;
    scope.x = 1;

    page = angular.element(
            '<div>' +
              '<span sly-prevent-evaluation-when-hidden=""  sly-show="!isHidden">{{x}}</span>' +
            '</div>');

    $compile(page)(scope);
    scope.$digest();
    
    // Set the DOM references.
    spanX = page.find('span').eq(0);
  }));

  it('should initialize bindings correctly', function() {
    // Just check basic functionality.
    expect(spanX.text()).toEqual('1');
  });

  it('should not update bindings when hidden', function() {
    scope.isHidden = true;
    scope.$digest();

    // Change x to some new value.  It should not be updated in the page.
    scope.x = 10;
    scope.$digest();
    
    expect(spanX.text()).toEqual('1');
  });

  it('should update bindings when shown', function() {
    scope.isHidden = true;
    scope.$digest();

    scope.x = 10;
    scope.$digest();

    scope.isHidden = false;
    scope.$digest();    
    expect(spanX.text()).toEqual('10');
  });
});
