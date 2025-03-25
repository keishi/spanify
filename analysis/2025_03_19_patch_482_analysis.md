# Build Failure Analysis: 2025_03_19_patch_482

## First error

../../media/parsers/vp8_parser.cc:366:18: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
  366 |                 {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255},
      |                  ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      |                  {                                                    }

## Category
Rewriter needs to add inner braces to multi-dimensional array initialization.

## Reason
The rewriter converted a C-style array to `std::array`. However, the initialization of the array requires inner braces for each subobject (inner array). The rewriter did not add these inner braces.

## Solution
The rewriter needs to add inner braces to multi-dimensional array initialization.

For example, the rewriter should change

```c++
   {
      {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255},
      {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255},
      {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255},
    },
```

to

```c++
   {
      {{255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255}},
      {{255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255}},
      {{255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255}},
    },
```

## Note
There are multiple similar errors.