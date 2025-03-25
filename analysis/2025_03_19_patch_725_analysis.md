# Build Failure Analysis: 2025_03_19_patch_725

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 5868, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5874, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to make two conflicting replacements within the same line of code. The first replacement, triggered by `RewriteArraySizeof`, aims to transform `sizeof(buffer)` into `(buffer.size() * sizeof(decltype(buffer)::value_type))`. The second replacement, triggered by `AppendDataCall`, attempts to add `.data()` to the `buffer` variable. Because these replacements overlap, the rewriter fails. The overlapping replacements occur because `buffer` was converted to a `std::array`.

## Solution
The rewriter should be modified to avoid generating overlapping replacements in such scenarios. Specifically, the `RewriteArraySizeof` transformation should be made aware of the `std::array` conversion performed by `AppendDataCall` and avoid attempting to rewrite the `sizeof` expression in that case, or generate a single compound replacement.

## Note
The diff shows this line: `data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));` This is obviously broken code, and a consequence of the overlapping replacements issue. The rewriter logic needs to be fixed to avoid creating such broken code.