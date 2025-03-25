# Build Failure Analysis: 2025_03_19_patch_608

## First error

Overlapping replacements: ./media/formats/mp4/es_descriptor_unittest.cc at offset 2862, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2868, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to calculate the size of the `buffer` using `buffer.size() * sizeof(decltype(buffer)::value_type)` but also attempts to add `.data()` to the same `buffer` variable. Since the `.data()` replacement is located within the bounds of the size calculation, it leads to overlapping replacements.

## Solution
The rewriter should avoid adding `.data()` inside the `sizeof` calculation. In this case, data.assign takes two iterators. The rewriter should have used `buffer.begin()` and `buffer.end()` instead of trying to calculate a size and calling .data().

The original code was:

```c++
data.assign(buffer, buffer + sizeof(buffer));
```

The rewritten code is:

```c++
data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));
```

The correct rewritten code is:

```c++
data.assign(buffer.begin(), buffer.end());
```

## Note
This also triggers `Conflicting replacement text` clang error due to the rewriter bug.
```
Conflicting replacement text: ./media/formats/mp4/es_descriptor_unittest.cc at offset 2862, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" != "(buffer.size() * sizeof(decltype(buffer)::value_type))"