# Build Failure Analysis: 2025_05_02_patch_625

## First error

../../media/formats/mp4/box_reader_unittest.cc:280:32: error: member reference base type 'const uint8_t[9]' (aka 'const unsigned char[9]') is not a structure or union
  280 |   TestTopLevelBox(kData, (kData.size() * sizeof(decltype(kData)::value_type)),

## Category
Rewriter needs to avoid using .size() on raw C arrays.

## Reason
The code attempts to use `.size()` on a raw C-style array `kData`. Raw C-style arrays do not have member functions like `.size()`. The rewriter incorrectly introduced this code when modifying the call to `TestTopLevelBox`. The rewriter tried to pass the size of the kData, which has type `const uint8_t[]` as a parameter to `TestTopLevelBox`, but the logic is incorrect. The original type of `TestTopLevelBox` expected a `size_t` which is the size of the buffer, but with the spanified parameter type, the size was passed in using two parameters.

## Solution
The rewriter should not attempt to use `.size()` on raw C-style arrays. The size should be calculated using `sizeof(kData)` directly or by using a `constexpr` variable to hold the size. The call site should calculate the size of the raw array using `sizeof(kData)` before passing it to the spanified function. The rewriter should avoid introducing `.size()` calls on non-class types.

## Note
The errors indicate a misunderstanding of how to obtain the size of a C-style array. The other errors in the log are similar, occurring in subsequent calls to `TestTopLevelBox`.