# Build Failure Analysis: 2025_03_19_patch_248

## First error

../../third_party/blink/renderer/core/page/scrolling/scrolling_test.cc:124:55: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  124 |                                   kHttpsBaseUrl.data().subspan(url_fragment));

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter arrayified `kHttpsBaseUrl` and added `.data()` to it. However, it failed to rewrite `.data()` to `.data().subspan()` for the method call `subspan(url_fragment)`.

## Solution
The rewriter needs to recognize the `.subspan()` calls on variables that have `.data()` added and rewrite the generated code correctly.

```c++
-  kHttpsBaseUrl.data().subspan(url_fragment)
+  kHttpsBaseUrl.data().subspan(0, (url_fragment).length())
```

## Note
The second error:
```
../../third_party/blink/renderer/core/page/scrolling/scrolling_test.cc:149:29: error: no viable conversion from 'const std::array<char, 22>' to 'std::string_view' (aka 'basic_string_view<char>')
  149 |         WebString::FromUTF8(kHttpsBaseUrl), test::CoreTestDataPath(),
      |                             ^~~~~~~~~~~~~
```

Rewriter needs to add .data() to arrayified `char[]` variable used with `std::string_view`. Original code was concatenating a char array with a std::string or something, but converting the char array to std::array broke it. The rewriter should recognize this pattern and add .data().
```c++
-        WebString::FromUTF8(kHttpsBaseUrl), test::CoreTestDataPath(),
+        WebString::FromUTF8(kHttpsBaseUrl.data()), test::CoreTestDataPath(),