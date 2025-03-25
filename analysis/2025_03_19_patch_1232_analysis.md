# Build Failure Analysis: 2025_03_19_patch_1232

## First error

../../components/user_education/common/tutorial/tutorial_description.h:67:56: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter converted `kTutorialHistogramPrefix` from `char[]` to `std::array<char, 10>`. However, it failed to recognize that `kTutorialHistogramPrefix.data()` returns a `base::span<char>`. As a result, the compiler doesn't recognize `.subspan` as a member of a `char*` or `const char*`. This indicates that the rewriter needs to add `.data()` to the result of calling `.data()` in order for `.subspan()` to be a valid operation.

## Solution
The rewriter should check if the return value of `kTutorialHistogramPrefix.data()` is spanified and then apply `.data()` to it before applying `.subspan()`. The rewriter should insert `.data()` to the line:

```c++
kTutorialHistogramPrefix.data().data().subspan(...)
```

## Note
The error occurs multiple times in the file.