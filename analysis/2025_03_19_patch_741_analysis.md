# Build Failure Analysis: 2025_03_19_patch_741

## First error

Overlapping replacements: ./services/device/usb/usb_descriptors_unittest.cc at offset 9808, length 26: "(kConfig1Descriptor.size() * sizeof(decltype(kConfig1Descriptor)::value_type))" and offset 9814, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to add `.data()` to the `kConfig1Descriptor` variable when inserting it into the `buffer` vector, but there were also other replacements being performed on the same line. Specifically, the rewriter is trying to replace `sizeof(kConfig1Descriptor)` with `(kConfig1Descriptor.size() * sizeof(decltype(kConfig1Descriptor)::value_type))` at the same time. This results in overlapping replacements.

## Solution
The rewriter needs to avoid generating multiple replacements that overlap. The approach to fixing this is to make the replacement passes non-overlapping. This is commonly accomplished by generating a replacement for the entire statement, or alternatively excluding one rewrite pass from the other.

## Note
There is also another potential error in the code:

```c++
InvokeCallback(kConfig1Descriptor, (kConfig1Descriptor.size() * sizeof(decltype(kConfig1Descriptor)::value_type))))
```

This should probably also be kConfig1Descriptor.size() to match its behavior in main. Adding a overlapping check for `InvokeCallback` would also be useful.

```c++
   buffer.insert(buffer.end(), kConfig1Descriptor.data(),
-                base::span<const uint8_t>(kConfig1Descriptor ).subspan( sizeof).data()(kConfig1Descriptor));
+                base::span<const uint8_t>(kConfig1Descriptor ).subspan(kConfig1Descriptor.size()).data());