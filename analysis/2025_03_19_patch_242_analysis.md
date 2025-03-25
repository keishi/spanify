# Build Failure Analysis: 2025_03_19_patch_242

## First error

../../media/parsers/vp9_compressed_header_parser.cc:227:7: error: no matching member function for call to 'UpdateMvProbArray'

## Category
Rewriter needs to properly handle spanified arrays when passing them to functions.

## Reason
The rewriter converted `mv_class0_fr_probs` to `std::array`, but the `UpdateMvProbArray` function signature was not updated correctly.  The function was likely taking a C-style array as an argument. Now that the rewriter arrayified this variable, it should also adjust any functions that take it as arguments to base::span.

## Solution
The rewriter must update the function signature of `UpdateMvProbArray` to accept `base::span` or `std::array` with size information to match the arrayified argument. This might involve rewriting the function declaration and definition to use `base::span`.

## Note
The relevant code snippet is:

```c++
struct MEDIA_EXPORT Vp9FrameContext {
  std::array<std::array<std::array<Vp9Prob, 3>, 2>, 2> mv_class0_fr_probs;
}

void f() {
  UpdateMvProbArray(mv_class0_fr_probs);
}
```

The fix involves changing `UpdateMvProbArray`'s signature to accept `base::span` or `std::array`.
```c++
 void UpdateMvProbArray(base::span<Vp9Prob[2][3]> prob_array) { }