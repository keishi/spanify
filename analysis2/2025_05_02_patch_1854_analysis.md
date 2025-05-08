# Build Failure Analysis: 2025_05_02_patch_1854

## First error

```
../../media/parsers/vp9_parser.cc:377:24: error: invalid argument type 'const std::array<std::array<unsigned char, 3>, 6>' to unary expression
  377 |           int max_l = (+ak == +aj[0]) ? 3 : 6;
      |                        ^~~
```

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The original code probably had a C array of `char` or `unsigned char` type and was relying on the unary `+` operator to perform implicit conversion to `int`. The rewriter converted the C array to `std::array`, but this implicit conversion is no longer possible as `std::array` does not provide the same conversion semantics with the unary `+` operator. The code is trying to apply the unary plus operator to an array.

## Solution
The rewriter should detect this pattern and remove the unary `+` operators on the condition expression.

```c++
           int max_l = (ak == aj[0]) ? 3 : 6;
```

## Note
The rewriter made the patch by blindly arrayifying `coef_probs`.