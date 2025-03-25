# Build Failure Analysis: 2025_03_19_patch_607

## First error

Overlapping replacements: ./media/formats/mp4/es_descriptor_unittest.cc at offset 2165, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2171, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to add both the size calculation `(buffer.size() * sizeof(decltype(buffer)::value_type))` and the `.data()` call on the same variable. The size calculation was inserted at offset 2165, while the `.data()` call was added at offset 2171. The overlapping replacements caused the build failure.

## Solution
The rewriter should avoid generating overlapping replacements. Need to revisit the logic in RewriteArraySizeof and AppendDataCall to prevent this.

## Note
This is a case of overlapping replacements.