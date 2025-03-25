# Build Failure Analysis: 2025_03_19_patch_387

## First error

../../services/device/usb/webusb_descriptors_unittest.cc:216:36: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 46UL>' (aka 'const array<unsigned char, 46UL>') and 'unsigned long')

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
In the code:
```c++
std::vector<uint8_t>(
          kExampleUrlDescriptor255.data(),
          kExampleUrlDescriptor255 +
              (kExampleUrlDescriptor255.size() *
               sizeof(decltype(kExampleUrlDescriptor255)::value_type)))
```
`kExampleUrlDescriptor255` was arrayified, but the rewriter is trying to perform pointer arithmetic directly on the `std::array`. The `std::array` needs `.data()` appended to it in order for the pointer arithmetic to work, but the rewriter only added it in the first argument, and not the second.

## Solution
The rewriter should also add `.data()` to `kExampleUrlDescriptor255` in the second argument.

```c++
std::vector<uint8_t>(
          kExampleUrlDescriptor255.data(),
          kExampleUrlDescriptor255.data() +
              (kExampleUrlDescriptor255.size() *
               sizeof(decltype(kExampleUrlDescriptor255)::value_type)))
```

## Note
No other errors.