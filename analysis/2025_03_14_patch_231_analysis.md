# Build Failure Analysis: 231

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/base/strings/safe_sprintf_unittest.cc at offset 4805, length 12: "std::array<char, 20> ref" and offset 4805, length 21: "std::array<char, 20> buf"

## Category
Overlapping replacements due to multiple variable declaration.

## Reason
Multiple variables ref and buf are being declared on the same line. The rewriter tries to rewrite both and the offsets overlap.

## Solution
The rewriter should only try to rewrite one variable per line.

## Note
Second error is the same as the first.