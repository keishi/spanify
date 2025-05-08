# Build Failure Analysis: 2025_05_02_patch_52

## First error

member reference base type 'uint8_t[36]' (aka 'unsigned char[36]') is not a structure or union

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter changed the function signature of `UnpackPixels` to take a `base::span<uint8_t> destination_data` instead of `uint8_t* destination_data`. However, in the unit test, `destination_data` is still declared as a fixed-size C-style array (`uint8_t destination_data[36]`). When the rewriter spanified the function parameter, it introduced calls to `.data()` and `.size()` on local variables of type `uint8_t[]` that it did not arrayify/spanify. This results in the error because C-style arrays do not have `.data()` or `.size()` members.

## Solution
The rewriter should only add `.data()` or `.size()` calls on variables that it has explicitly converted to `base::span` or `std::array`. It appears the rewriter is confused by the fact that the signature now accepts a span, and is incorrectly adding `.data()` to the original array in the test code. This could be solved by inspecting all variables and members for `.data()` additions and making sure they are of type base::span or std::array.

## Note
There is a secondary error, where the rewriter failed to spanify the call site. It is attempting to pass `uint8_t*` to a function expecting a span.