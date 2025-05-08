# Build Failure Analysis: 2025_05_02_patch_1654

## First error

../../content/browser/background_fetch/storage/get_initialization_data_task.cc:457:7: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const std::string' (aka 'const basic_string<char>')
  457 |       kActiveRegistrationUniqueIdKeyPrefix,
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kActiveRegistrationUniqueIdKeyPrefix` from a `char[]` to a `std::string_view`. However, the `GetRegistrationUserKeysAndDataByKeyPrefix` function in `service_worker_context_wrapper.h` expects a `const std::string&` as argument. The rewriter added `.data()` in `ActiveRegistrationUniqueIdKey` in `database_helpers.cc` but did not apply this fix in `get_initialization_data_task.cc`, where it is also needed to match the function signature in `service_worker_context_wrapper.h`.

## Solution
The rewriter needs to automatically add `.data()` when a `std::string_view` needs to be implicitly converted into a `std::string` (or `const std::string&`). This fix needs to be applied everywhere where the implicit conversion happens.

## Note