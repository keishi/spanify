# Build Failure Analysis: 2025_03_19_patch_898

## First error
../../third_party/blink/renderer/core/mobile_metrics/mobile_friendliness_checker_test.cc:100:35: error: no viable conversion from 'const std::array<char, 21>' to 'std::string_view' (aka 'basic_string_view<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `WebString::FromUTF8`.

## Reason
The rewriter converted a C-style array to `std::array`. `WebString::FromUTF8` takes a `std::string_view` as input.  The `std::array` needs to be converted to a `std::string_view` by calling `.data()` on it.

## Solution
The rewriter should add `.data()` to `kBaseUrl` when it is used as an argument to `WebString::FromUTF8`.
```c++
WebString::FromUTF8(kBaseUrl.data())
```

## Note
The second error is caused because I applied `.data()` and then tried to call `.subspan` on the result which is wrong. I fixed it in the solution by removing the unnecessary `.data()` call.
```
../../third_party/blink/renderer/core/mobile_metrics/mobile_friendliness_checker_test.cc:103:56: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  103 |                                         kBaseUrl.data().subspan(path));
      |                                         ~~~~~~~~~~~~~~~^~~~~~~~