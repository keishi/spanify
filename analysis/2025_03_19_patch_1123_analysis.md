# Build Failure Analysis: 2025_03_19_patch_1123

## First error

../../dbus/message_unittest.cc:263:39: error: cannot initialize a parameter of type 'const int32_t **' (aka 'const int **') with an rvalue of type 'base::span<const int32_t> *' (aka 'span<const int> *')
  263 |   ASSERT_TRUE(reader.PopArrayOfInt32s(&output_int32s, &length));
      |                                       ^~~~~~~~~~~~~~
../../third_party/googletest/src/googletest/include/gtest/gtest.h:1831:50: note: expanded from macro 'ASSERT_TRUE'
 1831 | #define ASSERT_TRUE(condition) GTEST_ASSERT_TRUE(condition)
      |                                                  ^~~~~~~~~
../../third_party/googletest/src/googletest/include/gtest/internal/gtest-internal.h:1458:38: note: expanded from macro 'GTEST_TEST_BOOLEAN_'
 1458 |           ::testing::AssertionResult(expression))                     \
      |                                      ^~~~~~~~~~
../../dbus/message.h:446:41: note: passing argument to parameter 'signed_ints' here
  446 |   bool PopArrayOfInt32s(const int32_t** signed_ints, size_t* length);
      |                                         ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a local variable in `dbus/message_unittest.cc` from `const int32_t*` to `base::span<const int32_t>`. But the `PopArrayOfInt32s` function in `dbus/message.h` still expects a `const int32_t**`. This is a call site that the rewriter failed to update after spanifying a variable.

## Solution
The rewriter needs to also update the call site to the spanified variable. Change this:

```cpp
ASSERT_TRUE(reader.PopArrayOfInt32s(&output_int32s, &length));
```

to this:

```cpp
ASSERT_TRUE(reader.PopArrayOfInt32s(output_int32s.data(), &length));
```

Also the rewriter should not change the type of `output_int32s` to `base::span<const int32_t>` unless the `PopArrayOfInt32s` is spanified.

## Note
There are no secondary errors in the log.