# Build Failure Analysis: 2025_05_02_patch_174

## First error

```
Overlapping replacements: ./media/formats/mp4/avc_unittest.cc at offset 6576, length 14: "(kNALU2.size() * sizeof(decltype(kNALU2)::value_type))" and offset 6582, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements that overlap in the source code. The first replacement calculates the size of the `kNALU2` array using `(kNALU2.size() * sizeof(decltype(kNALU2)::value_type))`. The second replacement attempts to add `.data()` to `kNALU2`. These replacements overlap because the `.data()` call is intended to be appended *after* the array variable `kNALU2`, but *before* the size calculation, resulting in overlapping ranges.

## Solution
The rewriter needs to ensure that the `.data()` call is inserted *before* the `size()` method call is used to calculate the size of the `std::array`. Since the `AppendDataCall` pass is being called after `RewriteArraySizeof`, it is failing. The order of the passes should be swapped.
Additionally the span code has a lot of other errors, including extra `.data()` calls, extra `subspan` and missing parenthesis. The best solution is to revert this patch, and then fix the ordering of `AppendDataCall` and `RewriteArraySizeof`.

## Note
The build log contains two other overlapping replacement errors, suggesting that this issue occurs multiple times in the file.
```
Overlapping replacements: ./media/formats/mp4/avc_unittest.cc at offset 5774, length 14: "(kNALU2.size() * sizeof(decltype(kNALU2)::value_type))" and offset 5780, length 0: ".data()"
Overlapping replacements: ./media/formats/mp4/avc_unittest.cc at offset 4445, length 14: "(kNALU2.size() * sizeof(decltype(kNALU2)::value_type))" and offset 4451, length 0: ".data()"
```
The generated code is incorrect and won't compile. For example:

```c++
buf.insert(buf.end(), kNALU2.data(), base::span<const uint8_t>(kNALU2 ).subspan( sizeof).data()(kNALU2));