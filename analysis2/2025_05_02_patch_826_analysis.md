# Build Failure Analysis: 2025_05_02_patch_826

## First error

../../third_party/libc++/src/include/array:553:17: error: static assertion failed due to requirement 'is_move_constructible_v<crashpad::StringAnnotation<64>>': [array.creation]/4: to_array requires move constructible elements.

## Category
Rewriter needs to avoid using std::to_array on types that are not move constructible.

## Reason
The error message indicates that `std::to_array` requires its template argument to be move constructible. The `crashpad::StringAnnotation<64>` class does not have a move constructor (it has a deleted copy constructor, which implies no implicit move constructor).

The rewriter converted a C-style array of `PrinterInfoKey` (which is a `crash_reporter::CrashKeyString<64>`) to `std::array` using `std::to_array`. Because `crash_reporter::CrashKeyString<64>` is not move constructible, the `std::to_array` call fails to compile.

## Solution
The rewriter should not use `std::to_array` on types that are not move constructible. It should either avoid rewriting in this case or use `std::array` directly with an initializer list. Using `std::array` directly initializes the array elements in place, avoiding the need for move construction.

Instead of
```c++
static auto printer_info_keys = std::to_array<PrinterInfoKey>({
    {"prn-info-1", PrinterInfoKey::Tag::kArray},
    {"prn-info-2", PrinterInfoKey::Tag::kArray},
    {"prn-info-3", PrinterInfoKey::Tag::kArray},
    {"prn-info-4", PrinterInfoKey::Tag::kArray},
});
```

use
```c++
static std::array<PrinterInfoKey, 4> printer_info_keys = {
    {"prn-info-1", PrinterInfoKey::Tag::kArray},
    {"prn-info-2", PrinterInfoKey::Tag::kArray},
    {"prn-info-3", PrinterInfoKey::Tag::kArray},
    {"prn-info-4", PrinterInfoKey::Tag::kArray},
};
```

## Note
`crashpad::StringAnnotation<64>` has a deleted copy constructor, which also prevents it from being move constructed.
```c++
StringAnnotation(const StringAnnotation&) = delete;