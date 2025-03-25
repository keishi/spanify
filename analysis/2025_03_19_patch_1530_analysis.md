# Build Failure Analysis: 2025_03_19_patch_1530

## First error

Overlapping replacements: ./base/strings/safe_sprintf_unittest.cc at offset 14726, length 33: ").subspan( sizeof(addr) - strlen(addr) - 1)" and offset 14728, length 12: "(addr.size() * sizeof(decltype(addr)::value_type))"

## Category
Overlapping replacements due to multiple variable declaration.

## Reason
The error "Overlapping replacements" indicates that the rewriter is attempting to modify the same region of code in conflicting ways. In this specific case, the tool is likely trying to insert or replace code related to the `subspan` and `addr.size()` calls at nearly the same location, resulting in overlapping replacement ranges. The overlapping happens in this part:

```c++
         (char*)memmove(base::span<char>(addr + (addr.size() * sizeof(decltype(addr)::value_type)) - strlen(addr.data()) - 1.data(), addr.data(),
                        strlen(addr.data()) + 1) -
              addr);
```

## Solution
The rewriter needs to be adjusted to avoid generating overlapping replacements. This often involves ensuring that replacements are generated in a consistent order and that the ranges do not conflict. The strategy should probably be to do the shortest edit first. A more robust solution might require a more sophisticated diffing algorithm. It is possible that using traverse mode `TK_IgnoreUnlessSpelledInSource` can help solve this problem because macro expansions can lead to the same code being visited multiple times.

## Note
The error message "Conflicting replacement text" suggests that the rewriter is attempting to apply two different replacements to the exact same range of text. This happens when there are two matchers and they both find the same text range.