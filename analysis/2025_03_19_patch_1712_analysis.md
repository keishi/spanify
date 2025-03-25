# Build Failure Analysis: 2025_03_19_patch_1712

## First error

../../base/containers/span.h:299:49: error: 'InternalPtrType' declared as a pointer to a reference of type 'CSSSelector &'

## Category
Rewriter needs to avoid using span with reference types.

## Reason
The rewriter attempted to use `base::span<CSSSelector&, 1>` which resulted in error: ''InternalPtrType' declared as a pointer to a reference of type 'CSSSelector &'`. Span does not support reference types.

## Solution
The rewriter should check if the variable is a reference type. If it is then the variable should not be wrapped with `base::span`.

## Note
Many additional errors were caused because the code was wrapped with `base::span` incorrectly.
```
../../third_party/blink/renderer/core/css/rule_set.cc:423:20: error: cannot increment value of type 'base::span<CSSSelector>'
  423 |        UNSAFE_TODO(++s)) {  // Termination condition within loop.
      |                    ^ ~
../../third_party/blink/renderer/core/css/rule_set.cc:425:8: error: member reference type 'base::span<CSSSelector>' is not a pointer; did you mean to use '.'?
  425 |       s->SetCoveredByBucketing(true);
      |       ~^~
      |        .
../../third_party/blink/renderer/core/css/rule_set.cc:425:10: error: no member named 'SetCoveredByBucketing' in 'base::span<blink::CSSSelector>'
  425 |       s->SetCoveredByBucketing(true);
      |       ~  ^
../../third_party/blink/renderer/core/css/rule_set.cc:438:10: error: member reference type 'base::span<CSSSelector>' is not a pointer; did you mean to use '.'?
  438 |     if (s->IsLastInComplexSelector() ||
      |         ~^~
      |          .
../../third_party/blink/renderer/core/css/rule_set.cc:438:12: error: no member named 'IsLastInComplexSelector' in 'base::span<blink::CSSSelector>'
  438 |     if (s->IsLastInComplexSelector() ||
      |         ~  ^
../../third_party/blink/renderer/core/css/rule_set.cc:439:10: error: member reference type 'base::span<CSSSelector>' is not a pointer; did you mean to use '.'?
  439 |         s->Relation() != CSSSelector::kSubSelector) {
      |         ~^~
      |          .
../../third_party/blink/renderer/core/css/rule_set.cc:439:12: error: no member named 'Relation' in 'base::span<blink::CSSSelector>'
  439 |         s->Relation() != CSSSelector::kSubSelector) {
      |         ~  ^