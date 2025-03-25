# Build Failure Analysis: 2025_03_19_patch_768

## First error

../../third_party/blink/renderer/platform/fonts/simple_font_data.cc:473:39: error: no viable overloaded '='

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter changed a mutable C-style array to a `std::array`. However, the rewriter dropped the `mutable` qualifier, resulting in an assignment to a const value. The rewriter should have preserved the `mutable` qualifier when it was present in the original code.

```c++
-  mutable uint64_t filename_offsets[kMaxFilenames];
+  std::array<uint64_t, kMaxFilenames> filename_offsets;
```

```
../../base/debug/dwarf_line_no.cc:237:45: error: cannot assign to return value because function 'operator[]' returns a const value
237 |           program_info->filename_offsets[0] = program_info->filename_offsets[1];
    |           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^
```

## Solution
The rewriter needs to preserve the `mutable` qualifier during the conversion of C-style arrays to `std::array`. The fix is to add the `mutable` keyword when generating the `std::array` type.

## Note
The second error is a consequence of the first error. Once the first error is resolved, the second error will also be resolved.