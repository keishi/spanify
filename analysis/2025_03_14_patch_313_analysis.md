# Build Failure Analysis: 2025_03_14_patch_313

## First error

../../chrome/browser/web_applications/preinstalled_web_apps_browsertest.cc:122:34: error: no matching function for call to 'to_array'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The code attempts to use `std::to_array` with an explicitly specified template type, but the compiler cannot infer the size of the array. The sizes of the arrays are used as arguments to subspan. The problem is that after spanifying the array the rewriter is now passing the result to sizeof. Since the type is span at this point it must pass the span.size(). Since span.size() returns a size_t (an unsigned type) and the division is happening after a multiplication of a size with a signed value the compiler is complaining about the signed to unsigned conversion.

## Solution
The rewriter needs to cast the argument to span.size() to a signed value. But the division is already taking place in the size calculation for the original array.

```c++
(kOnlineOnlyExpectations.size() *
       sizeof(decltype(kOnlineOnlyExpectations)::value_type)) /
      sizeof(kOnlineOnlyExpectations[0]);
```

The size function needs to be called only after the whole expression has been evaluated to avoid the error.

I would suggest instead, the size calculation could be extracted to a `constexpr`.

## Note
```