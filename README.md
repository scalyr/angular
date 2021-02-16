Angular Directives by Scalyr
---

This is the source code for the optimization directives Scalyr created to
improve the responsiveness of its user interface, as discussed in the blog post
[Optimizing AngularJS: 1200ms to 35ms](https://www.scalyr.com/blog/angularjs-1200ms-to-35ms).

These directives are meant to demonstrate the optimization techniques discussed
in the blog post.  The directives were really only meant for internal use, but
since there was sufficient interest from readers, we are publishing the source.
Unfortunately, we cannot make maintaining this library a high priority. We will 
push bug fixes and accept pull requests from other developers, but beyond that,
the source is provided as is.  We expect this source will act more as a
starting point for other developers rather than as a complete standalone
Javascript library.

Also note, because some of the optimization techniques rely on non-public
AngularJS variables and methods, these directives may not work for all versions
of AngularJS. The current tests validate them against 1.2.1.

Furthermore, the directives were built with particular use cases in mind so
they may not have all of the features you would expect.  For example, our
repeat directive 'slyRepeat' does not support animations and other features
that 'ngRepeat' does.

The [scalyr.js](scalyr.js) file contains the Javascript bundle required to use
the directives.  More information for each directive can be found in the
src/js/directives  directory.  Here is a brief description of what is included:


  <tr>sly<td></td><td></td></tr>
</table>


<table>
<tr><th>Name</th><th>Description</th></tr>

<tr><td>
slyEvaluateOnlyWhen
</td><td>
An attribute directive that prevents updating / evaluating
all bindings and expressions for the current element and its children
unless the object referenced by the attribute's value changes.
It currently assumes the expression contained in the attribute value
evaluates to an object and detects changes only by a change in object reference.
</td></tr>
<tr><td>
slyAlwaysEvaluate
</td><td>
An attribute directive that can only be used in conjunction with the
slyEvaluateOnlyWhen directive.  This directive will ensure that
any expression that is being watched will always be evaluated
if it contains the string specified in the attribute value (i.e., 
it will ignore whether or not the slyEvaluateOnlyWhen expression has changed.)
This is useful when you wish to check some expressions all the time.
Note, this only works if the directives register a string watch expression
so this may or may not work for some directives depending on their
implementation.
</td></tr>
<tr><td>
slyPreventEvaluationWhenHidden
</td><td>
An attribute directive that will only 
evaluate the bindings and expressions for the current element and its children
if the current element is not hidden (detected by the element having the
'ng-hide' CSS class.)
</td></tr>
<tr><td>
slyShow
</td><td>
An attribute directive that Will hide the element if the expression specified
in the atttribute value evaluates to false.  Uses the CSS class 'ng-hide' to
hide the element.  This is almost exactly the same as ngShow, but it has the
advantage that it works better with slyPreventEvaluationWhenHidden by
guaranteeing it show expression is always evaluated regardless of the effects
of slyPreventEvaluationWhenHidden.
</td></tr>
<tr><td>
slyRepeat
</td><td>
An attribute directive that is a modified version of the
ngRepeat directive.  It is meant to be more efficient for creating and
recreating large lists of elements.  In particular, it has an
optimization that will prevent DOM elements from being constantly created
and destroyed as the number of the repeated elements change.  It does this
by not destroying DOM elements when they are no longer needed, but instead,
just hiding them. This might not work for all use cases.  Cavaets:  The
collection expression must evaluate to an array.  Animators will not work.
Track By does not work. Use at your own peril.
</td></tr>
</table>

Please contact contact@scalyr.com for any questions or problems.

== Contributing ==

```
npm install -g karma karma-cli karma-jasmine karma-chrome-launcher
```

Then from root directory :
```
./scripts/buildScalyr.js
./scripts/startJsTester
```
