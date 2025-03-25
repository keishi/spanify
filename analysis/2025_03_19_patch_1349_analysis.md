# Build Failure Analysis: 2025_03_19_patch_1349

## First error

third_party/blink/renderer/core/xml/xpath_grammar_generated.h:1476:35: error: expected expression
 1476 |     const std::array<signed char, > yyr2_;
      |                                   ^

## Category
Rewriter cannot get the size of forward declared array variable.

## Reason
The rewriter is attempting to convert `yyr2_` to `std::array`, but it is declared as `static const signed char yyr2_[];` in the class declaration.  Since the size of the array is not specified in the declaration within the header, the rewriter cannot determine the size to use for `std::array`.

## Solution
The rewriter should avoid trying to convert arrays to `std::array` when the size of the array is not known at the point of declaration.

## Note
The rewriter successfully arrayified this forward declared variable.
```
-    static const signed char yyr2_[];
+    const std::array<signed char, > yyr2_;
```
The type needs to be complete.
```
    static const signed char yyr1_[];