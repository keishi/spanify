# Build Failure Analysis: 2025_05_02_patch_931

## First error

../../media/parsers/vp9_compressed_header_parser.cc:222:5: error: no matching member function for call to 'UpdateMvProbArray'
  222 |     UpdateMvProbArray(frame_context->mv_bits_prob[i]);
      |     ^~~~~~~~~~~~~~~~~
../../media/parsers/vp9_compressed_header_parser.h:53:8: note: candidate template ignored: could not match 'Vp9Prob[N]' (aka 'unsigned char[N]') against 'value_type' (aka 'std::array<unsigned char, 10>')
   53 |   void UpdateMvProbArray(Vp9Prob (&prob_array)[N]);

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `mv_bits_prob` member, which changed its type from `Vp9Prob[2][10]` to `std::array<std::array<Vp9Prob, 10>, 2>`. The function `UpdateMvProbArray` expects a `Vp9Prob (&prob_array)[N]`.  The rewriter correctly modified the definition of `Vp9FrameContext::mv_bits_prob`, but failed to update the call site of `UpdateMvProbArray` in `Vp9CompressedHeaderParser::ParseIntraFrameHeader`.

## Solution
The rewriter needs to spanify the call site as well. Update the code to pass `frame_context->mv_bits_prob[i]` to `UpdateMvProbArray` as a `base::span` or `std::array`. The easiest fix is to update `UpdateMvProbArray` to accept a `std::array`.

## Note
The original code used `memchr` with `sizeof(mv_bits_prob)`, which was also updated by the rewriter to use `.size() * sizeof(decltype(mv_bits_prob)::value_type))`.