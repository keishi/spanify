# Build Failure Analysis: 2025_05_02_patch_1105

## First error

../../google_apis/gcm/engine/gcm_store_impl_unittest.cc:282:30: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const std::string' (aka 'const basic_string<char>')
  282 |   gcm_store->AddRegistration(kAppName, registration,
      |                              ^~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code defines `kAppName` as a `std::string_view`. The `AddRegistration` function in `gcm_store_impl.h` expects a `const std::string&` as its first argument. The compiler cannot implicitly convert a `std::string_view` to a `std::string&`, leading to a compilation error.

The rewriter should recognize that `kAppName` which used to be char[], was converted to `std::string_view` and add `.data()` when it is passed to a function expecting a char*.

## Solution
When the rewriter converts a `char[]` to `std::string_view`, it needs to add `.data()` to the variable when it is used as a function argument and the function expects a `const char*`.

## Note
The `base::Contains` function also has similar issues and requires additional changes.