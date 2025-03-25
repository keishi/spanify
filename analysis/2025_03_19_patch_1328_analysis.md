# Build Failure Analysis: 2025_03_19_patch_1328

## First error

../../net/socket/sequenced_socket_data_unittest.cc:392:24: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char *'

## Category
Rewriter needs to add .data() to `char[]` converted to std::array passed to `base::StringPrintf`.

## Reason
The rewriter converted `const char kMsg1[]` to `const std::string_view kMsg1`, but the function `AssertSyncReadEquals` expects a `const char*`. The rewriter should recognize this pattern and add `.data()`.

## Solution
Add `.data()` to the arguments being passed to the `AssertSyncReadEquals` function.

## Note
Several similar errors exist in the build log. Also one error mentions `base::Bind`, which indicates that there may be a mismatch between what base::Bind and gtest expects.
Also there is `../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'` which indicates Rewriter needs to cast argument to base::span::subspan() to an unsigned value.