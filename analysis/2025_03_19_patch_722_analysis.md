# Build Failure Analysis: 2025_03_19_patch_722

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 4891, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 4897, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements that overlap. The first replacement calculates the size of the buffer using `buffer.size() * sizeof(decltype(buffer)::value_type))`. The second replacement attempts to add `.data()` to the buffer. This overlap indicates that the rewriter is generating code that tries to calculate the size of the buffer in bytes but also needs to call .data() on the container.

## Solution
The rewriter logic needs to be updated to avoid generating overlapping replacements in this scenario. Likely the `.data()` call should be included when the size in bytes is computed to avoid the conflict.
```diff
-  data.assign(buffer, buffer + sizeof(buffer));
+  data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));
```
needs to be
```diff
-  data.assign(buffer, buffer + sizeof(buffer));
+  data.assign(buffer.data(), base::span<uint8_t>(buffer.data(), buffer.size()));
```

## Note
The rewriter generates overlapping replacements when handling std::to_array and `data.assign`.