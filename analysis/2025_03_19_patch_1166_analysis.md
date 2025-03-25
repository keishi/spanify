# Build Failure Analysis: 2025_03_19_patch_1166

## First error

../../chrome/browser/web_applications/preinstalled_web_apps_browsertest.cc:127:34: error: no matching function for call to 'to_array'
  127 |   auto kOnlineOnlyExpectations = std::to_array<OnlineOnlyExpectation>({

## Category
Rewriter cannot get the size of forward declared array variable.

## Reason
The rewriter is trying to use `std::to_array`, but the size of the array cannot be determined. The error message "couldn't infer template argument '_Size'" indicates that the compiler is unable to deduce the size of the array being passed to `std::to_array`. This often happens when the array's size isn't explicitly defined or is somehow dependent on template parameters.

## Solution
The rewriter shouldn't attempt to apply `std::to_array` when it can't reliably infer the size of the array. It should probably revert the original change in this case. The rewriter needs to be updated to handle this scenario by checking if the size of the array can be determined before attempting `std::to_array`.

## Note
The rewriter touched unrelated code here:
```
size_t kOnlineOnlyExpectedCount =
-      sizeof(kOnlineOnlyExpectations) / sizeof(kOnlineOnlyExpectations[0]);
+      (kOnlineOnlyExpectations.size() *
+       sizeof(decltype(kOnlineOnlyExpectations)::value_type)) /
+      sizeof(kOnlineOnlyExpectations[0]);
```

This can be safely removed.