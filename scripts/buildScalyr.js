#!/bin/bash
#
# Usage:  buildScalyr.js
#
# Concatenates the necessary javascript files to produce scalyr.js.

function die() {
  echo "$1";
  exit 1;
}

if [ ! -f "src/js/core.js" ]; then
  die "Could not locate core.js.  Are you sure you running from the toplevel directory?";
fi


sources=(
    "scripts/includeFiles/header.js"
    "src/js/core.js"
    "src/js/directives/slyEvaluate.js" 
    "src/js/directives/slyRepeat.js" 
    "src/js/lib/gatedScope.js"
  )

if [ -f "scalyr.js" ]; then
  rm scalyr.js || die "Could not remove scalyr.js file";
fi

for x in ${sources[@]}; do
  cat "$x" >> scalyr.js || die "Failed to build scalyr.js file";
done

exit 0;




