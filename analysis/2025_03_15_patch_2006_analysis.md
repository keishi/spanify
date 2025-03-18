# Build Failure Analysis: 2025_03_15_patch_2006

## First error

../../media/parsers/vp9_parser.cc:843:11: error: use of undeclared identifier 'ref_slots_'
  843 |          (ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)));
      |           ^

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
After converting `ref_slots_` to `std::array`, the code attempts to use `ref_slots_` unqualified, which is only valid in member functions of the Context class, and the memset operation occurs outside of the Context class. The code should have accessed the member variable `ref_slots_` through the `tmp_context` variable.

## Solution
Update code to call memset on the `tmp_context.ref_slots_`

## Note
```
../../media/parsers/vp9_parser.cc:843:47: error: use of undeclared identifier 'ref_slots_'; did you mean 'Context::ref_slots_'?
  843 |          (ref_slots_.size() * sizeof(decltype(ref_slots_)::value_type)));
      |                                               ^~~~~~~~~~
      |                                               Context::ref_slots_
../../media/parsers/vp9_parser.h:330:49: note: 'Context::ref_slots_' declared here
  330 |     std::array<ReferenceSlot, kVp9NumRefFrames> ref_slots_;
      |                                                 ^