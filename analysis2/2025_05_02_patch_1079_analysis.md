# Build Failure Analysis: 2025_05_02_patch_1079

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The rewriter generated this code:
```c++
rv = ReadFromPipeNoBestEffort(file_out, buffer.subspan(offset).data(),
                                  size - offset);
```
`offset` is of type `int`, and `size - offset` is also an `int`. But subspan requires an unsigned value.

## Solution
The rewriter needs to cast `offset` to an unsigned value.

## Note
```