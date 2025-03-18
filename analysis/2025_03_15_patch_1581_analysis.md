# Build Failure Analysis: 2025_03_15_patch_1581

## First error

../../remoting/host/linux/remoting_user_session.cc:259:23: error: no viable conversion from 'char **' to 'base::span<char *>'

## Category
Rewriter needs to avoid spanifying functions that return `char**`.

## Reason
The function `pam_getenvlist` returns a `char**` which is not implicitly convertible to `base::span<char*>`. The rewriter incorrectly assumed that the returned `char**` could be converted to `base::span<char*>`. The correct way to handle this is to iterate through the `char**` like a C-style array, checking for a null terminator to know the size.

## Solution
The rewriter should be updated to not rewrite `pam_getenvlist` to return `base::span<char*>`.

## Note
The build also failed due to the line `++variable`, where variable is now of type `base::span<char*>`. This is because `base::span` does not have an increment operator like a raw pointer. But this is a secondary issue; the primary issue is the incompatible return type of `pam_getenvlist`.