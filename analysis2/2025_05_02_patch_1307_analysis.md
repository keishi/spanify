# Build Failure Analysis: 2025_05_02_patch_1307

## First error
../../net/dns/address_sorter_posix_unittest.cc:300:10: error: cannot increment value of type 'base::span<const char *const>'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The `Verify` function was spanified. The loop increments `addr`, which is now a `base::span`. Incrementing a span itself is not a valid operation. The original code assumed `addr` was a pointer. The rewriter incorrectly assumed it could spanify the variable. The type of the variable in the for loop is `base::span<const char* const>`. The intent of the original code was to iterate through the elements of the array. The iterator variable should not be a span type.

## Solution
The rewriter should not rewrite this kind of code. It should create a temporary variable to pass to the function, and then use the temporary variable to create a new span. Ideally the rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.
Or the rewriter can spanify the loop variable.

## Note
None