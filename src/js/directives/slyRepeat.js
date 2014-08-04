/**
 * @fileoverview
 * Module:  slyRepeat
 *
 * Contains the slyRepeat directive, which is is a modified version of the
 * ngRepeat directive that is meant to be more efficient for creating and
 * recreating large lists of bound elements.  In particular, it has an
 * optimization that will prevent DOM elements from being constantly created
 * and destroyed as the contents of the repeated elements change.  It does this
 * by not destroying DOM elements when they are no longer needed, but instead,
 * just hiding them. This might not work for all use cases, but for it does
 * for the ones we do wish to heavily optimize.  For eample, through profiling,
 * we found that destroying DOM elements when flipping through log view pages
 * represented a large chunk of CPU time.
 *
 * Cavaets:  The collection expression must evaluate to an array.  Animators
 *   will not work.  Track By does not work.  Use at your own peril.
 *
 * @author Steven Czerwinski <czerwin@scalyr.com>
 */
defineScalyrAngularModule('slyRepeat', ['gatedScope'])
.directive('slyRepeat', ['$animate', '$parse', function ($animate, $parse) {
  
  /**
   * Sets the scope contained in elementScope to gate all its
   * watchers based on the isActiveForRepeat proprety.
   *
   * @param {Object} elementScope The object containing the
   *   scope and isActiveForRepeat properties.
   */
  function gateWatchersForScope(elementScope) {
    elementScope.scope.$addWatcherGate(function() {
      return elementScope.isActiveForRepeat;
    });
  }

  return {
    restrict: 'A',
    scope: true,
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, linker) {
      // Most of the work is done in the post-link function.
      return function($scope, $element, $attr) {
        // This code is largely based on ngRepeat.

        // Parse the expression.  It should look like:
        // x in some-expression
        var expression = $attr.slyRepeat;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)$/);
        if (!match) {
          throw Error("Expected slyRepeat in form of '_item_ in _collection_' but got '" +
              expression + "'.");
        }

        var iterVar = match[1];
        var collectionExpr = match[2];

        match = iterVar.match(/^(?:([\$\w]+))$/);
        if (!match) {
          throw Error("'item' in 'item in collection' should be identifier but got '" +
              lhs + "'.");
        }
        
        // previousElements will store references to the already existing (DOM) elements
        // that were last used for the last rendering of this repeat and were visible.
        // We will re-use these elements when executing the next rendering of the repeat when
        // the iteration value changes.
        var previousElements = [];
        // previousElementsBuffer will store references to the already existing (DOM) elements
        // that are in the page but were not used for the last rendering of this repeat and were
        // therefore marked as inactive and not visible.  This happens if the length of the repeat
        // iteration goes down over time, since we do not remove the elements.  If the repeat length
        // was first 10, then 5, we will end up with the last 5 elements in the previousElementBuffer.
        // We keep this in case the length increases again.
        var previousElementBuffer = [];

        var deregisterCallback = $scope.$watchCollection(collectionExpr, function(collection) {
          if (!collection)
            return;
          if (!isArray(collection))
            throw Error("'collection' did not evaluate to an array.  expression was " + collectionExpr);
          var originalPreviousElementsLength = previousElements.length;
          // First, reconcile previousElements and collection with respect to the previousElementBuffer.
          // Basically, try to grow previousElements to collection.length if we can.
          if ((previousElements.length < collection.length) && (previousElementBuffer.length > 0)) {
            var limit = previousElements.length + previousElementBuffer.length;
            if (limit > collection.length)
              limit = collection.length;       
            previousElements = previousElements.concat(previousElementBuffer.splice(0, limit - previousElements.length));
          }
          
          var currentElements = null;
          var currentElementBuffer = [];

          var newElements = [];
          if (collection.length > previousElements.length) {
            // Add in enough elements to account for the larger collection.
            for (var i = previousElements.length; i < collection.length; ++i) {
              // Need to add in an element for each new item in the collection.
              var newElement = {
                  scope: $scope.$new(),
                  isActiveForRepeat: true,
              };
              
              gateWatchersForScope(newElement);
              newElement.scope.$index = i;
              newElement.scope.$first = (i == 0);
              newElements.push(newElement);
            }
            currentElements = previousElements.concat(newElements);
            currentElementBuffer = previousElementBuffer;
          } else if (collection.length < previousElements.length) {
            for (var i = collection.length; i < previousElements.length; ++i)
              previousElements[i].isActiveForRepeat = false;

            currentElementBuffer = previousElements.splice(collection.length, previousElements.length - collection.length).concat(
                previousElementBuffer);
            currentElements = previousElements;
          } else {
            currentElements = previousElements;
            currentElementBuffer = previousElementBuffer;
          }
          
          // We have to fix up the last and middle values in the scope for each element in
          // currentElements, since their roles may have changed with the new length.
          // We always have to fix the last element.
          if (currentElements.length > 0) {
            var firstIndexToFix = currentElements.length - 1;
            var lastIndexToFix = currentElements.length - 1;
            // We also have to fix any new elements that were added.
            if (originalPreviousElementsLength < currentElements.length) {
              firstIndexToFix = originalPreviousElementsLength;
            }
            // And we usually have to fix the element before the first element we modified
            // in case it used to be last.
            if (firstIndexToFix > 0) {
              firstIndexToFix = firstIndexToFix - 1;
            }
            for (var i = firstIndexToFix; i <= lastIndexToFix; ++i) {
              currentElements[i].scope.$last = (i == (currentElements.length - 1));
              currentElements[i].scope.$middle = ((i != 0) && (i != (currentElements.length - 1)));
              if (!currentElements[i].isActiveForRepeat) {
                // If it is not marked as active, make it active.  This is also indicates that
                // the element is currently hidden, so we have to unhide it.
                currentElements[i].isActiveForRepeat = true; 
                currentElements[i].element.css('display', '');
              }
            }
          }
          
          // Hide all elements that have recently become inactive.
          for (var i = 0; i < currentElementBuffer.length; ++i) {
            if (currentElementBuffer[i].isActiveForRepeat)
              break;
            currentElementBuffer[i].element.css('display', 'none');
          }

          // Assign the new value for the iter variable for each scope.
          for (var i = 0; i < currentElements.length; ++i) {
            currentElements[i].scope[iterVar] = collection[i];
          }

          // We have to go back now and clone the DOM element for any new elements we
          // added and link them in.  We clone the last DOM element we had created already
          // for this Repeat.
          var prevElement = $element;
          if (previousElements.length > 0)
            prevElement = previousElements[previousElements.length - 1].element;
          for (var i = 0; i < newElements.length; ++i) {
            linker(newElements[i].scope, function(clone) {
              $animate.enter(clone, null, prevElement);
              prevElement = clone;
              newElements[i].element = clone;
            });
          }
            
          previousElements = currentElements;
          previousElementBuffer = currentElementBuffer;
        });
        $scope.$on('$destroy', function() {
          deregisterCallback();
        });
      };
    }
  };
}]);
