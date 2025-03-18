# Build Failure Analysis: 2025_03_14_patch_899

## First error

../../components/safe_browsing/core/browser/url_realtime_mechanism.cc:41:3: error: no matching function for call to 'UmaHistogramEnumeration'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `base::UmaHistogramEnumeration`.

## Reason
The rewriter converted a `char[]` to `std::array`, but it is being passed to `base::UmaHistogramEnumeration`. The rewriter should recognize this pattern and add `.data()`.

## Solution
The rewriter should add `.data()` when a `std::array` is passed to `base::UmaHistogramEnumeration`.
```c++
// Old code
base::UmaHistogramEnumeration(kMatchResultHistogramName, match_result);

// New code
base::UmaHistogramEnumeration(kMatchResultHistogramName.data(), match_result);
```

## Note
The second error was caused by subspan being called on a character array:

```
../../components/safe_browsing/core/browser/url_realtime_mechanism.cc:43:67: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   43 |     base::UmaHistogramEnumeration(kMatchResultHistogramName.data().subspan(
      |                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~