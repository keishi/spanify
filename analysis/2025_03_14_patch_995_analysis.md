# Build Failure Analysis: 2025_03_14_patch_995

## First error

../../chrome/browser/sessions/session_restore_browsertest.cc:400:12: error: unused variable 'kUrls' [-Werror,-Wunused-const-variable]

## Category
Span conversion caused unused variable.

## Reason
The patch converted a C-style array to `std::array`, but the new variable `kUrls` is not being used. This results in an unused variable error.

## Solution
The spanify tool must skip rewriting code that is not being used.

## Note
This error occurs due to the conversion to `std::array`, making the variable unused and triggering the compiler error.