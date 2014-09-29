/** 
 * @fileoverview
 * Tests for the GatedScope abstraction.
 *
 * @author Steven Czerwinski <czerwin@scalyr.com>
 */
describe('GatedScope', function() {
  var $rootScope = null;

  beforeEach(module('gatedScope'));
  beforeEach(inject(['$rootScope', function(rootScope) {
    $rootScope = rootScope;
  }]));
  
  it('should provide rootScope with a $addWatcherGate method', function() {
    expect($rootScope.$addWatcherGate).toBeDefined();
  });

  it('should add a $addWatcherGate method for all new scopes', function() {
    expect($rootScope.$new().$addWatcherGate).toBeDefined();
  });

  it('should add a $addWatcherGate method for all new scopes even if isolated', function() {
    expect($rootScope.$new(true).$addWatcherGate).toBeDefined();
  });

  it('should evaluate all watchers on $digest when no gating', function() {
    // Just register a bunch of watchers on a set of scopes and make sure they are
    // evaluated.
    var childA = $rootScope.$new();
    var childB = $rootScope.$new();
    var grandChild = childA.$new();

    var counter = 0;
    function watcher() {
      ++counter;
      return 1;
    }

    childA.$watch(watcher);
    childB.$watch(watcher);
    grandChild.$watch(watcher);

    $rootScope.$digest();

    // Each watcher should be called twice since the first pass of the $digest loop will
    // result in each watcher indicating it was dirty.
    expect(counter).toEqual(6);
  });

  it('should not evaluate gated watchers when gating function returns false', function() {
    // Create a few scopes, set a gate function on one of them, and make sure it
    // prevents any watchers on it and its descendents from being evaluated.
    var childA = $rootScope.$new();
    childA.$addWatcherGate(function() {
      return false;
    });

    var childB = $rootScope.$new();
    var grandChild = childA.$new();

    var counter = 0;
    function watcher() {
      ++counter;
      return 1;
    }

    childA.$watch(watcher);
    childB.$watch(watcher);
    grandChild.$watch(watcher);

    $rootScope.$digest();

    // Only the watcher on B should fire, so we get two counts.
    expect(counter).toEqual(2);
  });

  it('should evaluate gated watchers when gating function returns true', function() {
    var gateClosed = true;

    var childA = $rootScope.$new();
    childA.$addWatcherGate(function() {
      return !gateClosed;
    });

    var childB = $rootScope.$new();
    var grandChild = childA.$new();

    var counter = 0;
    var watchedVal = 1;
    function watcher() {
      ++counter;
      return watchedVal;
    }

    childA.$watch(watcher);
    childB.$watch(watcher);
    grandChild.$watch(watcher);

    $rootScope.$digest();

    // Only the watcher on B should fire when gate closed.
    expect(counter).toEqual(2);

    counter = 0;
    gateClosed = false;
    
    $rootScope.$digest();
    // All three watchers will be evaluated twice.
    expect(counter).toEqual(6);

    // Next time through, as long as watchedVal doesn't change,
    // we should only evaluate each watcher once.
    counter = 0;
    $rootScope.$digest();
    expect(counter).toEqual(3);

    // When the watched value is dirty, then we have to eval each twice again.
    watchedVal = 2;
    counter = 0;
    $rootScope.$digest();
    expect(counter).toEqual(6);
  });

  it('should only evaluate gated watches on scope whose digest was invoked', function() {
    var gateClosed = false;

    var childA = $rootScope.$new();
    childA.$addWatcherGate(function() {
      return !gateClosed;
    });

    var childB = childA.$new();

    var counter = 0;
    var watchedVal = 1;
    function watcher() {
      ++counter;
      return watchedVal;
    }

    childA.$watch(watcher);
    childB.$watch(watcher);

    childB.$digest();

    // Only the watcher on B should fire since we invoked its digest.
    expect(counter).toEqual(2);

    counter = 0;
    watchedValue = 2;
    
    childA.$digest();
    // Both watches should evaluate twice (twice since the first time
    // will indicate it is is dirty).
    expect(counter).toEqual(4);
  });

  it('should only evaluate gated watchers for gating function that returned true', function() {
    var counter1 = 0;
    function watcher1() {
      ++counter1;
      return 1;
    }

    var counter2 = 0;
    function watcher2() {
      ++counter2;
      return 1;
    }

    // Create two different gate functions, one which returns true, the other that returns
    // false.

    var childA = $rootScope.$new();
    childA.$addWatcherGate(function() {
      return true;
    });

    childA.$watch(watcher1);
    childA.$watch(watcher1);

    var grandChild = childA.$new();
    grandChild.$watch(watcher1);

    grandChild.$addWatcherGate(function() {
      return false;
    });
    grandChild.$watch(watcher2);

    $rootScope.$digest();

    // The child watcher should fire six times, while the other zero.
    expect(counter1).toEqual(6);
    expect(counter2).toEqual(0);
  });

  it('should only add a watcher to the gated list if shouldGateFunction returns true', function() {
    var counter = 0;
    function watcher() {
      ++counter;
      return 1;
    }

    function myListener(newVal, oldVal) {
    }
    var shouldGateInvoked = false;

    var childA = $rootScope.$new();
    childA.$addWatcherGate(function() {
      return false;
    }, function(watchExp, listener, equality, name) {
      // We only add a watcher once, so just check it's arguments.
      // Probably should be using sinon mocks here.
      expect(watchExp).toBe(watcher);
      expect(listener).toBe(myListener);
      expect(equality).toBeTruthy();
      expect(name).toEqual('testDirective');
      shouldGateInvoked = true;
      return false;
    });

    childA.$watch(watcher, myListener, true, 'testDirective');

    // The watcher should be fired even though gate is returning false since.
    $rootScope.$digest();
    expect(counter).toEqual(2);
    expect(shouldGateInvoked).toBeTruthy();
  });


  it('should keep trying to evaluate nested gate if outer gate ever becomes true', function() {
    var counter = 0;
    function watcher() {
      ++counter;
      return 1;
    }

    // Create a nested gating function by registering two gating functions, one after another.
    // If the first one's gating function ever returns true, then the second one should
    // be attempted to be evaluated from then on until its gating function always returns true,
    // even if the first one returns false in the meantime.

    var firstGate = false;
    var secondGate = false;

    var childA = $rootScope.$new();
    childA.$addWatcherGate(function() {
      return firstGate;
    });

    childA.$addWatcherGate(function() {
      return secondGate;
    });

    childA.$watch(watcher);

    // When both gates are down, the watcher should not be evaluated.
    $rootScope.$digest();
    expect(counter).toEqual(0);

    // When the first gate goes up but the second is still down, then no evaluation.
    firstGate = true;
    $rootScope.$digest();
    expect(counter).toEqual(0);

    // Lower the first gate.
    firstGate = false;
    $rootScope.$digest();
    expect(counter).toEqual(0);

    // Now if the second gate comes up, then we should see an evaluation, even though
    // the first gate is now closed.
    secondGate = true;
    $rootScope.$digest();
    expect(counter).toEqual(1);

    // But, we will not see any more evaluations until the first gate is opened again.
    $rootScope.$digest();
    expect(counter).toEqual(1);

    // When the first gate is open again, we will see more evaluations.  Because the first
    // gate will return a signal to indicate it was dirty, we will see two evaluations
    // this time.
    firstGate = true;
    $rootScope.$digest();
    expect(counter).toEqual(3);

    // In steady state with both gates up, we will only see one evaluation per digest loop.
    $rootScope.$digest();
    expect(counter).toEqual(4);
  });

  it('should evaluate watchers registered with equality equal to true', function() {
    var objectToWatch = { value: 5 };

    var counter = 0;
    function watcher() {
      ++counter;
      return objectToWatch;
    }

    // Add a gate so that all future watchers are evaluated using our version of $digest.
    var scope = $rootScope.$new();
    scope.$addWatcherGate(function() {
      return true;
    });

    scope.$watch(watcher, function(newValue) {
    }, true);

    // When both gates are down, the watcher should not be evaluated.
    $rootScope.$digest();
  });

  it('should evaluate new watchers when gating function has shouldEvalNewWatchers = true', function() {
    var gateClosed = false;

    var child = $rootScope.$new();
    child.$addWatcherGate(function() {
      return !gateClosed;
    }, null, true);

    $rootScope.$digest();

    gateClosed = true;

    var counter = 0;
    var watchedVal = 1;
    function watcher() {
      ++counter;
      return watchedVal;
    }

    child.$watch(watcher);
    $rootScope.$digest();

    // Should have been evaluated twice, one for the first dirty cycle, and then for
    // cycle it was not dirty on.
    expect(counter).toEqual(2);
  });

  it('should not evaluate new watchers when gating function has shouldEvalNewWatchers = false', function() {
    var gateClosed = false;

    var child = $rootScope.$new();
    child.$addWatcherGate(function() {
      return !gateClosed;
    }, null, false);

    $rootScope.$digest();

    gateClosed = true;
    var counter = 0;
    var watchedVal = 1;
    function watcher() {
      ++counter;
      return watchedVal;
    }

    child.$watch(watcher);
    $rootScope.$digest();

    expect(counter).toEqual(0);
  });
});
