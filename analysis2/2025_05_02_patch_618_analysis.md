```
# Build Failure Analysis: 2025_05_02_patch_618

## First error

```
../../services/device/usb/webusb_descriptors_unittest.cc:216:36: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 46UL>' (aka 'const array<unsigned char, 46UL>') and 'unsigned long')
  216 |           kExampleUrlDescriptor255 +
      |           ~~~~~~~~~~~~~~~~~~~~~~~~ ^
  217 |               (kExampleUrlDescriptor255.size() *
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  218 |                sizeof(decltype(kExampleUrlDescriptor255)::value_type))),
      |                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The original code uses `kExampleUrlDescriptor255 + sizeof(kExampleUrlDescriptor255)` to calculate the end of the buffer.
After applying the spanify tool, `kExampleUrlDescriptor255` is converted to a `std::array`. The tool is failing to recognize the need to use `.data()` to calculate the end of the span.

## Solution
The rewriter should use `kExampleUrlDescriptor255.data()` to calculate the end of the buffer.
```
          kExampleUrlDescriptor255.data(),
          kExampleUrlDescriptor255.data() +
              (kExampleUrlDescriptor255.size() *
               sizeof(decltype(kExampleUrlDescriptor255)::value_type))),
```

## Note
N/A