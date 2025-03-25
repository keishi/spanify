# Build Failure Analysis: 2025_03_19_patch_505

## First error
../../ui/gfx/color_space_unittest.cc:49:12: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
   49 |           {0.3195f, 0.3518f, 0.9392f, 1.0000f},

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter replaced a C-style array with a `std::array`. However, the old array was initialized with a non-aggregate C-style syntax. The `std::array` requires that its initialization use aggregate syntax, which involves wrapping each element in braces. The compiler helpfully suggests this fix via the `-Wmissing-braces` diagnostic.

## Solution
The rewriter needs to generate proper brace syntax for multidimensional array when rewriting from a C-style array initialization. In the code snippet below, the rewriter needs to add surrounding curly braces.

```c++
   SkV4 expected_yuvs[kNumColorSpaces][kNumTestRGBs] = {
       // REC601
       {
+         {
            {0.3195f, 0.3518f, 0.9392f, 1.0000f},
            {0.5669f, 0.2090f, 0.1322f, 1.0000f},
...
+         }
       },
```

## Note
There are multiple errors of `excess elements in struct initializer`. This secondary error is caused by the `std::array` being initialized incorrectly due to the lack of braces.