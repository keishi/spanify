# Build Failure Analysis: 15

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 6840, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 6846, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The error "Overlapping replacements" suggests that two different rewrite actions are trying to modify the same region of code, leading to a conflict. Specifically, the rewriter is attempting to add `.data()` to the `buffer` variable while also trying to calculate the size of the array. The size calculation replacement `(buffer.size() * sizeof(decltype(buffer)::value_type))` overlaps with the `.data()` insertion.

## Solution
The rewriter needs to avoid generating overlapping replacements. In this case, it should prioritize the `.data()` insertion for std::array when it detects that both RewriteArraySizeof and AppendDataCall are targeting the same variable. Or rewrite to base::span.

## Note
The overlapping replacements happened in this code.

```c++
data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));
```