# Build Failure Analysis: 2025_03_19_patch_1229

## First error

../../third_party/blink/renderer/core/xml/xslt_unicode_sort.cc:147:11: error: no viable overloaded '='
  147 |   results = results_tab[0];
      |   ~~~~~~~ ^ ~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from std::begin/end.

## Reason
The rewriter spanified a variable, but does not handle assignment of spanified variable from array element.

## Solution
The rewriter should be able to handle assignment of spanified variables in more scenarios.

## Note
No other errors.