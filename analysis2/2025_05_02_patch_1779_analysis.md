# Build Failure Analysis: 2025_05_02_patch_1779

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
  176 |   std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,

## Category
Rewriter needs to handle `.data()` when converting a C-style array to std::array in a third_party function call.

## Reason
The code was changed from using a C-style array `HarfBuzzRecordType chunk[kMaxHarfBuzzRecords];` to `std::array<HarfBuzzRecordType, kMaxHarfBuzzRecords> chunk;`. The `GetHarfBuzzMathRecord` function calls a `getter.Run` function, which expects a pointer as the last argument, but it is getting `std::array`. The fix is to call `.data()` on the `std::array` to pass in a pointer. Since `getter` seems to be a third party function, the rewriter should have added `.data()` to the argument.

## Solution
The rewriter should have added `.data()` when it changed the code to use `std::array`. The code should have looked like this:
```c++
std::array<HarfBuzzRecordType, kMaxHarfBuzzRecords> chunk;
unsigned int count = kMaxHarfBuzzRecords;
std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
                      0 /* start_offset */, &count, chunk.data());
```
The rewriter needs to recognize this pattern of passing a `std::array` to a third_party function expecting a pointer, and add `.data()`.

## Note
There are actually two errors in the log, both are the same issue.
```
../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'