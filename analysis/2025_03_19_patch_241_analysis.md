# Build Failure Analysis: 2025_03_19_patch_241

## First error

../../media/parsers/vp9_compressed_header_parser.cc:222:5: error: no matching member function for call to 'UpdateMvProbArray'
  222 |     UpdateMvProbArray(frame_context->mv_bits_prob[i]);
      |     ^~~~~~~~~~~~~~~~~
../../media/parsers/vp9_compressed_header_parser.h:53:8: note: candidate template ignored: could not match 'Vp9Prob[N]' (aka 'unsigned char[N]') against 'value_type' (aka 'std::array<unsigned char, 10>')
   53 |   void UpdateMvProbArray(Vp9Prob (&prob_array)[N]);

## Category
Pointer passed into spanified function parameter.

## Reason
The code was converted to use `std::array` instead of `Vp9Prob mv_bits_prob[2][10];` but the function signature of  `UpdateMvProbArray(Vp9Prob (&prob_array)[N]);` takes in a reference to a C-style array. The rewriter spanified the data structure but did not update the function signature, nor did it update the call sites to pass in a span. The function signature needs to be updated to take a span.

## Solution
The function signature of `UpdateMvProbArray` in `Vp9FrameContext` needs to be changed to use a span and pass in the appropriate parameters.

```c++
 void UpdateMvProbArray(base::span<Vp9Prob, 10> prob_array);
```

In `vp9_compressed_header_parser.cc`, the code should be modified to use span as follows:

```c++
void Vp9CompressedHeaderParser::ParseIntraFrameHeader(
    Vp9FrameContext* frame_context) {
  for (int i = 0; i < 2; ++i) {
    UpdateMvProbArray(base::span<Vp9Prob, 10>(frame_context->mv_bits_prob[i]));
  }
}
```

Alternatively, since the `std::array` is fixed size, we can take the signature as `base::span<Vp9Prob> prob_array`.

## Note
It seems that the file `media/parsers/vp9_compressed_header_parser.cc` was not rewritten at all, as the usage of  `memchr` was not updated in the error case. This is likely another bug.

The relevant code:
```c++
  if (memchr(mv_class0_bit_prob, 0, sizeof(mv_class0_bit_prob))) {
    return false;
  }
-  if (memchr(mv_bits_prob, 0, sizeof(mv_bits_prob))) {
+  if (memchr(
+          mv_bits_prob.data(), 0,
+          (mv_bits_prob.size() * sizeof(decltype(mv_bits_prob)::value_type)))) {
    return false;
  }
```
The rewriter replaced the code to use `.data()` and `.size()` on std::array, but in this case it didn't fix the rest of the code.

A fix would have been:
```c++
  if (memchr(mv_class0_bit_prob, 0, sizeof(mv_class0_bit_prob))) {
    return false;
  }
+  static_assert(
+      sizeof(mv_bits_prob[0]) ==
+      (mv_bits_prob[0].size() * sizeof(decltype(mv_bits_prob[0])::value_type)),
+      "Size must match");
+  if (memchr(mv_bits_prob.data(), 0, sizeof(mv_bits_prob[0]))) {
+    return false;
+  }