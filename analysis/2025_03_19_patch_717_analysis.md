# Build Failure Analysis: 2025_03_19_patch_717

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 2016, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2022, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to perform two conflicting replacements in the same area of the file. It's trying to rewrite the size calculation for the `buffer` array and also add `.data()` to it. This happens because both `RewriteArraySizeof` and `AppendDataCall` replacements are being triggered on the same expression and are overlapping.

## Solution
The rewriter needs to avoid generating overlapping replacements. One way to address this is to prioritize one replacement over the other or to adjust the ranges of the replacements so that they no longer overlap.

## Note
The error message indicates the overlapping replacements are occurring at offset 2016 with length 14 and offset 2022 with length 0. This suggests that the rewriter might be trying to insert ".data()" within the size calculation expression.