# Build Failure Analysis: 2025_05_02_patch_1370

## First error

../../chrome/browser/ui/webui/settings/site_settings_handler.cc:598:7: error: no matching function for call to 'StartsWith'
  598 |   if (base::StartsWith(serialized, kGroupingKeyEtldPrefix)) {
      |       ^~~~~~~~~~~~~~~~
../../base/strings/string_util.h:399:18: note: candidate function not viable: no known conversion from 'const std::array<char, 6>' to 'std::string_view' (aka 'basic_string_view<char>') for 2nd argument
  399 | BASE_EXPORT bool StartsWith(
      |                  ^
  400 |     std::string_view str,
  401 |     std::string_view search_for,
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code uses `base::StartsWith` which expects a `std::string_view` as the second argument, but the rewriter converted `kGroupingKeyEtldPrefix` from `char[]` to `std::array<char, 6>`. This caused the `base::StartsWith` function to no longer be callable. The `std::array` needs to be converted to a `char*` by calling the `.data()` method.

## Solution
The rewriter should add `.data()` to `kGroupingKeyEtldPrefix` to convert the `std::array` to a `char*` that can be implicitly converted to a `std::string_view`.

```c++
// Old code:
if (base::StartsWith(serialized, kGroupingKeyEtldPrefix)) {

// New code:
if (base::StartsWith(serialized, kGroupingKeyEtldPrefix.data())) {