# Build Failure Analysis: 106

## First error
../../media/parsers/vp9_uncompressed_header_parser.cc:599:7: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
  599 |     {{64, 96, 64}, {64, 96, 64}},
      |       ^~~~~~~~~~
      |       {         }

## Category
Rewriter needs to properly initialize `std::array` from nested braced initializer lists.

## Reason
The code initializes a `std::array` member with a nested braced initializer list, but the rewriter transformation results in the .cc file failing to compile.

The rewriter changes `Vp9Prob mv_fr_probs[2][3];` to `std::array<std::array<Vp9Prob, 3>, 2> mv_fr_probs;`. The original code used a nested braced initializer list to initialize this array. The rewritten code requires an additional set of braces in the initialization.

## Solution
The rewriter needs to add an extra set of braces to initialize the nested `std::array` correctly.

For example, the rewriter sees this:

```c++
    {{64, 96, 64}, {64, 96, 64}},
```

And needs to output this:

```c++
    {{{64, 96, 64}, {64, 96, 64}}},
```

## Note
There are other errors in the build log related to initialization of a subobject and excess elements in a struct initializer. These are secondary to the first error which is the missing braces for the array initialization.