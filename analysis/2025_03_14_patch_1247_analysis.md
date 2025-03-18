# Build Failure Analysis: 2025_03_14_patch_1247

## First error

../../device/gamepad/gamepad_device_linux.cc:94:30: error: member reference base type 'unsigned long[1]' is not a structure or union
   94 |           EVIOCGBIT(0, (evbit.size() * sizeof(decltype(evbit)::value_type))),
      |                         ~~~~~^~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/linux/input.h:176:61: note: expanded from macro 'EVIOCGBIT'
  176 | #define EVIOCGBIT(ev,len)       _IOC(_IOC_READ, 'E', 0x20 + (ev), len)  /* get event bits */
      |                                                                   ^~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/asm-generic/ioctl.h:73:5: note: expanded from macro '_IOC'
   73 |          ((size) << _IOC_SIZESHIFT))
      |            ^~~~
../../base/posix/eintr_wrapper.h:42:14: note: expanded from macro 'HANDLE_EINTR'
   42 |     decltype(x) eintr_wrapper_result;                        \
      |              ^

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a system function call.

## Reason
The original code uses `sizeof(decltype(evbit)::value_type)` which accesses the `value_type` member via `.`. However, `evbit` is a C-style array (unsigned long evbit[BITS_TO_LONGS(EV_MAX)]) and not a class, struct or union. After the rewrite, the type is converted to `base::span<const unsigned long> data`, which does not have the `value_type` member accessible via `.`.

## Solution
Rewrite to use `sizeof(unsigned long)` instead of `sizeof(decltype(evbit)::value_type)`.
The correct code should be:
```c++
HANDLE_EINTR(ioctl(
          fd.get(),
          EVIOCGBIT(0, (data.size() * sizeof(unsigned long))),
          evbit))
```
This ensures the rewriter replaces `.value_type` with the appropriate type name.
The `.data()` call is not needed in this case because the C API expects a pointer not a span.

## Note
Many similar errors exist in the build log. They are all related to missing .data() calls and wrong syntax for accessing the array's value_type member.