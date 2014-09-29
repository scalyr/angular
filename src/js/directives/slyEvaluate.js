/**
 * @fileoverview
 * Module: slyEvaluate
 *
 * Defines several directives related to preventing evaluating watchers
 * on scopes under certain conditions.  Here's a list of the directives
 * and brief descriptions.  See down below for more details.
 *
 *  slyEvaluateOnlyWhen:  A directive that prevents updating / evaluating
 *      all bindings for the current element and its children unless
 *      the expression has changed values.  If new children are added, they
 *      are always evaluated at least once.  It currently assumes the
 *      expression evaluates to an object and detects changes only by
 *      a change in object reference.  
 *
 *  slyAlwaysEvaluate: Can only be used in conjunction with the
 *      slyEvaluateOnlyWhen directive.  This directive will ensure that
 *      any expression that is being watched will always be evaluated
 *      if it contains the specified string (i.e., it will ignore whether
 *      or not the slyEvaluateOnlyWhen expression has changed.)  This
 *      is useful when you wish to check some expressions all the time.
 *
 *  slyPreventEvaluationWhenHidden:  Will only evaluate the bindings
 *      for the current element and its children if the current element
 *      is not hidden (detected by the element having the ng-hide CSS class.)
 *
 *  slyShow:  Will hide the element if the expression evaluates to false.
 *      Uses ng-hide to hide the element.  This is almost exactly the same
 *      as ngShow, but it has the advantage that it works better with
 *      slyPreventEvaluationWhenHidden by guaranteeing it will always evaluate
 *      its show expression to determine if it should or should not be hidden.
 */
defineScalyrAngularModule('slyEvaluate', ['gatedScope'])
/**
 * Directive for preventing all bound expressions in the current element and its children
 * from being evaluated unless the specified expression evaluates to a different object.
 * Currently, the value assigned to the 'slyEvaluateOnlyWhen' must evaluate to an object.
 * Also, reference equality is used to determine if the expression has changed.
 * TODO: Make this more versatile, similar to $watch.  For now, this is all we need.
 */
.directive('slyEvaluateOnlyWhen', ['$parse', function ($parse) {
  return {
    // We create a new scope just because it helps segment the gated watchers
    // from the parent scope.  Unclear if this is that important for perf.
    scope: true,
    restrict: 'A',
    compile: function compile(tElement, tAttrs) {       
      return {
        // We need a separate pre-link function because we want to modify the scope before any of the
        // children are passed it.
        pre: function preLink(scope, element, attrs) {
          var previousValue = null;
          var initialized = false;

          var expressionToCheck = $parse(attrs['slyEvaluateOnlyWhen']);
          var alwaysEvaluateString = null;
          if (hasProperty(attrs, 'slyAlwaysEvaluate')) {
            alwaysEvaluateString = attrs['slyAlwaysEvaluate'];
            if (isStringEmpty(alwaysEvaluateString))
              throw new Exception('Empty string is illegal for value of slyAlwaysEvaluate');
          }
          scope.$addWatcherGate(function evaluteOnlyWhenChecker() {
            // We should only return true if expressionToCheck evaluates to a value different
            // than previousValue.
            var currentValue = expressionToCheck(scope);
            if (!initialized) {
              initialized = true;
              previousValue = currentValue;
              return true;
            }
            var result = previousValue !== currentValue;
            previousValue = currentValue;
            return result;
          }, function shouldGateWatcher(watchExpression) {
            // Should return true if the given watcher that's about to be registered should
            // be gated.
            return isNull(alwaysEvaluateString) || 
                   !(isStringNonempty(watchExpression) && (watchExpression.indexOf(alwaysEvaluateString) >= 0));
          }, true /* Evaluate any newly added watchers when they are added */);
        },
      };
    },
  };
}])
/**
 * Directive for overriding the 'slyEvaluateOnlyWhen' expression for the current element.
 * This directive takes a single string value.  If this string value is found anywhere in
 * an expression that normally would not be evaluated due to the 'slyEvaluateOnlyWhen'
 * directive, it is evaluated, regardless of whether or not the value for the expression in
 * 'slyEvaluateOnlyWhen' has changed.  This is very useful when a certain expression used by
 * one of the children of the current element should always be evaluated and is not affected
 * by the expression specified in slyEvaluateOnlyWhen.
 */
.directive('slyAlwaysEvaluate', function() {
  // This is just a place holder to show that slyAlwaysEvaluate is a legal
  // directive.  The real work for this directive is done in slyEvaluateOnlyWhen.
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
    },
  };
})
/**
 * Directive for showing an element, very similar to ngShow.  However, this directive
 * works better with slyPreventEvaluationWhenHidden because it is ensure it always
 * will evaluate the show expression to determine if it should be shown or hidden
 * even if slyPreventEvaluationWhenHidden is in effect.  This directive also uses
 * the ng-hide css class to actually hide the element.
 *
 * NOTE: We might be able to get better performance if we have this directive directly
 * perform a callback on slyPreventEvaluationWhenHidden when it is shown/hidden rather
 * than having that directive register a watcher on the css class.
 */
.directive('slyShow', ['$animate', function($animate) {
  /**
   * @param {*} value The input
   * @return {Boolean} True if the value is truthy as determined by angular rules.
   *
   * Note:  This is copied from the Angular source because it is not exposed by Angular
   * but we want our directive to behave the same as ngShow.  Think about moving this
   * to core.js.
   */
  function toBoolean(value) {
    if (value && value.length !== 0) {
      var v = ("" + value);
      v = isString(v) ? v.toLowerCase() : v;
      value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
    } else {
      value = false;
    }
    return value;
  }

  return {
    restrict: 'A',
    link: function slyShowLink(scope, element, attr) {
      scope.$watch(attr.slyShow, function ngSlyShowAction(value){
        $animate[toBoolean(value) ? 'removeClass' : 'addClass'](element, 'ng-hide');
      }, false, 'slyShow'); },
  };
}])
/**
 * Directive for preventing all bound expressions in the current element and its children
 * from being evaluated if the current element is hidden as determined by whether or not
 * it has the ng-hide class.
 */
.directive('slyPreventEvaluationWhenHidden', function () {
  return {
    restrict: 'A',
    // We create a new scope just because it helps segment the gated watchers
    // from the parent scope.  Unclear if this is that important for perf.
    scope: true,
    compile: function compile(tElement, tAttrs) {       
      return {
        // We need a separate pre-link function because we want to modify the scope before any of the
        // children are passed it.
        pre: function preLink(scope, element, attrs) {
          scope.$addWatcherGate(function hiddenChecker() {
            // Should only return true if the element is not hidden.
            return !element.hasClass('ng-hide');
          }, function hiddenDecider(watchExpression, listener, equality, directiveName) {
            // Make an exception for slyShow.. do not gate its watcher.
            if (isDefined(directiveName) && (directiveName == 'slyShow'))
              return false;
            return true;
          });
        },
      };
    },
  };
});

