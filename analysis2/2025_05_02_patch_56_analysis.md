# Build Failure: 2025_05_02_patch_56

## First error

```
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:2289:32: error: member reference base type 'uint8_t[45]' (aka 'unsigned char[45]') is not a structure or union
 2289 |       GetExpectedMemory((pixels.size() * sizeof(decltype(pixels)::value_type)));
      |                          ~~~~~~^~~~~
```

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code attempts to use `pixels.size()` and `decltype(pixels)::value_type`, but `pixels` is a C-style array, not a class, struct, or union, so it doesn't have member `size` nor does it have a `value_type`.

## Solution
The rewriter should have converted the C-style array `pixels` to `std::array`. When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a third_party function call. But a bug in the rewriter prevented this from happening.

## Note
The rewriter also failed to convert `pixels` to a `base::span` in the call to `CheckRect`.