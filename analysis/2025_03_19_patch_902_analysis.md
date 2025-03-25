# Build Failure Analysis: 2025_03_19_patch_902

## First error

../../base/debug/dwarf_line_no.cc:238:42: error: cannot assign to return value because function 'operator[]' returns a const value
238 |           program_info->filename_dirs[0] = program_info->filename_dirs[1];
    |           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^

## Category
Rewriter dropped mutable qualifier.

## Reason
The original code had `mutable uint8_t filename_dirs[kMaxFilenames];`, which allows modification.  The rewriter changed this to `std::array<uint8_t, kMaxFilenames> filename_dirs;`. The `std::array` does not have a mutable qualifier and its `operator[]` on a const object returns a const reference.

## Solution
The rewriter should preserve the `mutable` qualifier when rewriting the array.

```c++
-  mutable uint8_t filename_dirs[kMaxFilenames];
+  mutable std::array<uint8_t, kMaxFilenames> filename_dirs;