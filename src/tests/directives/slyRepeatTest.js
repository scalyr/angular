/**
 * @fileoverview
 * Test cases for the slyRepeat module.
 *
 * @author Steven Czerwinski <czerwin@scalyr.com>
 */
describe('slyRepeat.slyRepeat', function() {
  // Items will hold references to the DOM elements
  // li from the sample HTML page.
  var items = null,
    scope = null,
    page = null;

  // Require the slyRepeat module.
  beforeEach(module('slyRepeat'));

  // Create the sample DOM elements with a repeat directive in them.
  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope;
    scope.xValues = [ 5, 6, 7];

    // Create a list made of values of xValues, where the first word is the
    // value from the array, and then the three boolean fields $first, $middle, $last
    // which are automatically created for each element scope.
    page = angular.element(
            '<div>' +
              '<ul>' +
                '<li sly-repeat="y in xValues">{{y}} first: {{$first}} middle: {{$middle}} last: {{$last}}</li>' +
              '</ul>' +
            '</div>');

    $compile(page)(scope);
    scope.$digest();
    
    // Set the DOM references.
    items = page.find('li');
  }));

  it('should iterate over items', function() {
    // Just check basic functionality.
    expect(items.length).toBe(3);
    expect(items.eq(0).text()).toBe('5 first: true middle: false last: false');
    expect(items.eq(1).text()).toBe('6 first: false middle: true last: false');
    expect(items.eq(2).text()).toBe('7 first: false middle: false last: true');
  });
  
  it('should increase to new collection size', function() {
    // If the array changes, so should the elements.
    scope.xValues = [ 5, 6, 7, 8 ];
    scope.$digest();
    items = page.find('li');
    expect(items.length).toBe(4);
    expect(items.eq(0).text()).toBe('5 first: true middle: false last: false');
    expect(items.eq(1).text()).toBe('6 first: false middle: true last: false');
    expect(items.eq(2).text()).toBe('7 first: false middle: true last: false');
    expect(items.eq(3).text()).toBe('8 first: false middle: false last: true');
  });
  
  it('should hide and not re-eval unused elements when collection size decreases', function() {
    // Make sure if we shorten the list, unused DOM elements are still there but
    // their values have not been updated and they are hidden.
    scope.xValues = [ 3, 4 ];
    scope.$digest();
    items = page.find('li');
    expect(items.length).toBe(3);
    expect(items.eq(0).text()).toBe('3 first: true middle: false last: false');
    expect(items.eq(1).text()).toBe('4 first: false middle: false last: true');
    expect(items.eq(2).text()).toBe('7 first: false middle: false last: true');
    expect(items.eq(2).css('display')).toBe('none');
  });
  
  it('should unhide previously unused elements when collection shrinks then grows', function() {
    scope.xValues = [ 3, 4 ];
    scope.$digest();
    scope.xValues = [ 8, 9, 10, 11, 12];
    scope.$digest();
    
    items = page.find('li');
    expect(items.length).toBe(5);
    expect(items.eq(0).text()).toBe('8 first: true middle: false last: false');
    expect(items.eq(1).text()).toBe('9 first: false middle: true last: false');
    expect(items.eq(2).text()).toBe('10 first: false middle: true last: false');
    expect(items.eq(3).text()).toBe('11 first: false middle: true last: false');
    expect(items.eq(4).text()).toBe('12 first: false middle: false last: true');
    
    for (var i = 0; i < 5; ++i)
      expect(items.eq(i).css('display')).toBe('');
  });
  
  it('should handle shrinking to zero size and then growing back', function() {
    scope.xValues = [];
    scope.$digest();
    scope.xValues = [ 8, 9, 10, 11, 12];
    scope.$digest();
    
    items = page.find('li');
    expect(items.length).toBe(5);
    expect(items.eq(0).text()).toBe('8 first: true middle: false last: false');
    expect(items.eq(1).text()).toBe('9 first: false middle: true last: false');
    expect(items.eq(2).text()).toBe('10 first: false middle: true last: false');
    expect(items.eq(3).text()).toBe('11 first: false middle: true last: false');
    expect(items.eq(4).text()).toBe('12 first: false middle: false last: true');
    
    for (var i = 0; i < 5; ++i)
      expect(items.eq(i).css('display')).toBe('');
  });
  
  it('should not evaluate unused elements that have derived scopes', inject(function($compile) {
    // We need to verify that our overriden scope creates child scopes that
    // still correctly intercept the watch function.  To do this, we use a
    // controller since controllers cause the outer scope to create a child scope.
    scope.values = [ 1, 2, 3, 4];

    scope.FooBar = function FooBar($scope) {
    };
    
    page = angular.element(
            '<div>' +
                '<div sly-repeat="x in values">' +
                  '<span ng-controller="FooBar">{{x}} </span>' +
                '</div>' +
            '</div>');

    $compile(page)(scope);
    scope.$digest();
    
    // Normal operation.
    items = page.find('div');
    expect(items.length).toBe(4);
    for (var i = 0; i < 4; ++i) {
      expect(items.eq(i).text()).toBe((i + 1) + ' ');
      expect(items.eq(i).css('display')).toBe('');
    }

    // Now shrink it.  We shouldn't see any errors due to badly evaluated
    // elements.
    scope.values = [ 5, 6];
    scope.$digest();
    
    items = page.find('div');
    expect(items.length).toBe(4);
    for (var i = 0; i < 2; ++i) {
      expect(items.eq(i).text()).toBe((i + 5) + ' ');
      expect(items.eq(i).css('display')).toBe('');
    }
    
    // Make sure the unused elements have not changed from their
    // previous values and are hidden.
    for (var i = 2; i < 4; ++i) {
      expect(items.eq(i).text()).toBe((i + 1) + ' ');  
      expect(items.eq(i).css('display')).toBe('none');
    }
  }));
});
