# Build Failure Analysis: 2025_05_02_patch_1747

## First error

../../chrome/updater/certificate_tag.cc:690:47: error: invalid operands to binary expression ('std::array<char, 64>' and 'uint16_t' (aka 'unsigned short'))
  690 |             UNSAFE_BUFFERS(sig_dir_entry.name + sig_dir_entry.num_name_bytes),
      |                            ~~~~~~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/compiler_specific.h:1042:3: note: expanded from macro 'UNSAFE_BUFFERS'
 1042 |   __VA_ARGS__                                \
      |   ^~~~~~~~~~~

## Category
Rewriter needs to add `.data()` to arrayified `char[]` variable used with `UNSAFE_BUFFERS`.

## Reason
The code uses `UNSAFE_BUFFERS` macro, which expects a pointer to a character array. The rewriter converted `sig_dir_entry.name` from `char[64]` to `std::array<char, 64>`. The expression `sig_dir_entry.name + sig_dir_entry.num_name_bytes` attempts to perform pointer arithmetic on the `std::array`, which is not directly supported. The `std::array` needs to be converted to a pointer first using `.data()`.

## Solution
The rewriter should add `.data()` to `sig_dir_entry.name` before performing the addition. The corrected code would be:
```c++
UNSAFE_BUFFERS(sig_dir_entry.name.data() + sig_dir_entry.num_name_bytes)
```
The rewriter should recognize the `UNSAFE_BUFFERS` macro usage with a `std::array` that was converted from a `char[]`, and automatically insert the `.data()` call.

## Note
The same issue exists in `chrome/updater/certificate_tag_unittest.cc`.
```