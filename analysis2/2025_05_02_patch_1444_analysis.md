# Build Failure Analysis: 2025_05_02_patch_1444

## First error

```
Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 7308, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 7314, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to replace `sizeof(buffer)` with `(buffer.size() * sizeof(decltype(buffer)::value_type))` and simultaneously add `.data()` to the same `buffer` variable when it is being used in a function call. This leads to overlapping replacements and a build failure. The rewriter first tries to replace `sizeof(buffer)` with the size calculation, and then tries to add `.data()` right after `buffer`. Because the size replacement is longer, it overwrites part of the `.data()` replacement.

## Solution
The rewriter should avoid generating overlapping replacements. A possible solution is to apply the `.data()` replacement first before calculating the size of the buffer, or avoid calling RewriteArraySizeof if AppendDataCall already happened.

## Note
None