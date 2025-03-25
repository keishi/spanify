# Build Failure Analysis: 2025_03_19_patch_665

## First error

../../ui/base/l10n/formatter.h:28:1: error: [chromium-style] Complex class/struct needs an explicit out-of-line destructor.
   28 | class Formatter {
      | ^

## Category
Rewriter dropped mutable qualifier.

## Reason
The error message indicates that the class `Formatter` needs an explicit out-of-line destructor. This typically arises when a class manages resources or has complex destruction logic. However, this isn't directly related to the span conversion. The more specific issue seems to be that the mutable qualifier was dropped from `simple_format_`.

Original code:

```c++
std::unique_ptr<icu::MessageFormat> simple_format_[UNIT_COUNT];
```

Rewritten code:

```c++
std::array<std::unique_ptr<icu::MessageFormat>, UNIT_COUNT> simple_format_;
```

The original code declared `simple_format_` as an array of `std::unique_ptr<icu::MessageFormat>`. Because the `std::unique_ptr` can hold a pointer to `icu::MessageFormat` objects, the original declaration worked. Converting the `std::unique_ptr` array to `std::array` implicitly drops the mutable qualifier.

## Solution
The rewriter needs to preserve the mutable qualifier when rewriting arrays of unique_ptr.

For example, if original code was:

```cpp
mutable std::unique_ptr<icu::MessageFormat> simple_format_[UNIT_COUNT];
```

then the code after spanifying should be:

```cpp
mutable std::array<std::unique_ptr<icu::MessageFormat>, UNIT_COUNT> simple_format_;
```

## Note
None