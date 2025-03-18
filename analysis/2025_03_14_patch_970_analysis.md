```
# Build Failure Analysis: 2025_03_14_patch_970

## First error

../../chrome/browser/ui/views/permissions/permission_prompt_bubble_one_origin_view_unittest.cc:311:49: error: no matching constructor for initialization of 'const media::AudioDeviceDescription &'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kMicName` from `char[]` to `std::array<char, 9>`, but failed to add `.data()` when the array is used in a constructor that expects a `std::string`. The constructor `media::AudioDeviceDescription` expects a `std::string` as its first argument.

## Solution
The rewriter should recognize the pattern where a `char[]` is converted to `std::array` and then used to initialize a `std::string`. It should then add `.data()` when the array is passed to the `std::string` constructor, or when the rewritten variable (now a `std::array`) is used as an argument to a function/constructor expecting a `std::string`.

## Note
The build log has these two errors.
```
../../chrome/browser/ui/views/permissions/permission_prompt_bubble_one_origin_view_unittest.cc:311:49: error: no matching constructor for initialization of 'const media::AudioDeviceDescription &'
../../chrome/browser/ui/views/permissions/permission_prompt_bubble_one_origin_view_unittest.cc:427:49: error: no matching constructor for initialization of 'const media::AudioDeviceDescription &'
```
These errors are the same root cause so they will likely be fixed with the same change.