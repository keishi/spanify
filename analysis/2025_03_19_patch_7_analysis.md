# Build Failure Analysis: 2025_03_19_patch_7

## First error

../../third_party/blink/renderer/platform/bindings/runtime_call_stats.cc:60:19: error: call to implicitly-deleted default constructor of 'std::array<RuntimeCallCounter, static_cast<int>(CounterId::kNumberOfCounters)>'

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter converted `RuntimeCallCounter counters_[static_cast<int>(CounterId::kNumberOfCounters)];` to `std::array<RuntimeCallCounter, static_cast<int>(CounterId::kNumberOfCounters)> counters_;`. But the class `RuntimeCallCounter` does not have a default constructor. Therefore the `std::array` also does not have a default constructor.

The rewriter logic rewrites raw pointers to `nullptr`, but not `std::array` to be default initialized using `{}`.

## Solution
Rewriter should rewrite default initialization of spanified member fields to use `{}`.

```c++
// Old code:
RuntimeCallStats::RuntimeCallStats(const base::TickClock* clock)
    : current_timer_(nullptr),
      in_use_(false),
      clock_(clock) {}

// New code:
RuntimeCallStats::RuntimeCallStats(const base::TickClock* clock)
    : current_timer_(nullptr),
      in_use_(false),
      counters_({}),
      clock_(clock) {}

```

## Note
The rewriter dropped mutable qualifier.