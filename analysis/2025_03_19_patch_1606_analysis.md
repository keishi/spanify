# Build Failure Analysis: 2025_03_19_patch_1606

## First error

../../base/substring_set_matcher/substring_set_matcher.cc:466:33: error: no viable conversion from 'AhoCorasickEdge *' to 'base::span<AhoCorasickEdge>'

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The code allocates memory using `new AhoCorasickEdge[new_capacity]` and attempts to assign the raw pointer to a `base::span<AhoCorasickEdge>`. This is not a valid conversion. The `base::span` does not take ownership of the memory. The correct usage of span is to pass in the allocated memory and the size of the allocation. `new AhoCorasickEdge[new_capacity]` returns a raw pointer, not a span, hence the error.

## Solution
The rewriter should not convert `AhoCorasickEdge* new_edges` to `base::span<AhoCorasickEdge> new_edges`. Instead the code should use a container such as `std::unique_ptr<AhoCorasickEdge[]> new_edges` to take ownership of the allocation. After ownership has been transferred to a managed container, the container can then be converted into a span when necessary. Or convert the code to use std::vector.

## Note
Also, in line 475, the code tries to assign the `new_edges`, which is now a span, to `edges_.edges`, which is still a raw pointer. This code needs to be changed.