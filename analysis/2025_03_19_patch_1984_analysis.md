# Build Failure Analysis: 15254

## First error

../../base/unsafe_buffers_unittest.cc:20:51: error: member reference base type 'int[2]' is not a structure or union
   20 |   int x = UNSAFE_BUFFERS(uses_pointer_as_array(arr.data()));
      |                                                ~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter inappropriately added `.data()` to the `arr` variable in the test case, even though the `arr` variable is not subject to rewriting. When `uses_pointer_as_array` was spanified, the arguments to it should have also been spanified. In this case, the rewriter incorrectly added `.data()` and failed to account for turning `int* i` into `base::span<int> i`.

## Solution
The rewriter should not add `.data()` to variables that were not arrayified/spanified.

Specifically, the rewriter must recognize that `arr` is decaying to a pointer type, and then determine that the rewriter should insert an implicit conversion from array to span, rather than inserting `.data()`.

## Note
The build failure log shows four identical errors, all stemming from the incorrect addition of `.data()` in the same test file.