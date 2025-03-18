# Build Failure Analysis: 2025_03_15_patch_1009

## First error

../../mojo/public/c/system/tests/core_api_unittest.cc:115:38: error: no viable conversion from 'MojoHandleSignals *' (aka 'unsigned int *') to 'base::span<const MojoHandleSignals>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The compiler fails to find a viable conversion from `MojoHandleSignals *` to `base::span<const MojoHandleSignals>`. This indicates that the rewriter changed the `WaitMany` function signature to accept a `base::span` for the `signals` parameter, but it failed to update all call sites to use `base::span` as well. Since the build log shows an error within `core_api_unittest.cc`, and the patch diff shows that `core_unittest.cc` was modified, the functions in those files should not have been spanified as they depend on each other, and spanifying one but not the other caused an error. This is a problem because the spanify tool shouldn't spanify code it cannot access to properly compile (like it shouldn't spanify across third party code).

## Solution
The rewriter should make sure that it doesn't spanify functions if it requires spanifying excluded code, but it didn't spanify it. Either spanify the functions in both files, or spanify the functions in neither file.

## Note
Multiple files are failing with the same error, confirming the diagnosis that spanifying WaitMany breaks the call sites.