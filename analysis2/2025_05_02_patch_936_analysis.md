# Build Failure Analysis: 2025_05_02_patch_936

## First error

../../media/parsers/vp9_parser.cc:832:11: error: use of undeclared identifier 'ref_slots_'
  832 |          (ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)));
      |           ^~~~~~~~~~

## Category
Rewriter introduced use of undeclared identifier.

## Reason
The rewriter incorrectly replaced `sizeof(context_.ref_slots_)` with `(ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)))`. Inside the `memcpy` call, `ref_slots_` refers to `context_.ref_slots_`, but the rewriter generated `ref_slots_.size()` which is an undeclared identifier in that scope.

## Solution
The rewriter should not introduce undeclared identifiers.  It should've used `context_.ref_slots_.size()` to be consistent.  This is a bug in the rewriter related to how it's handling member access inside `memcpy` when rewriting `sizeof`.

## Note
The second error is a follow-up to the first error.
```
../../media/parsers/vp9_parser.cc:832:47: error: use of undeclared identifier 'ref_slots_'; did you mean 'Context::ref_slots_'?