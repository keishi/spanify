# Build Failure Analysis: 2025_03_19_patch_978

## First error

../../chrome/browser/ui/exclusive_access/fullscreen_controller_state_test.cc:119:17: error: static assertion expression is not an integral constant expression

## Category
Rewriter needs to avoid using `this` inside a static_assert.

## Reason
The rewriter converted `transition_table_` to `std::array`, but failed to account for the restrictions around using `this` in `static_assert`.  `std::array::size()` is constexpr, but when the function itself is not constexpr, then it's not allowed to use `this` in a `static_assert`.

## Solution
The rewriter needs to access the size of the array without calling the member size() method. The type of the variable `transition_table_` can be determined from the declaration, from which the size can be obtained using `std::extent`.

```c++
  static_assert(sizeof(transition_table_data) ==
                    (std::extent<decltype(transition_table_)>::value *
                     sizeof(decltype(transition_table_)::value_type)),
                "transition_table has unexpected size");