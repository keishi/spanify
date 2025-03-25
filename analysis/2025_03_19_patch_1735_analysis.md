# Build Failure Analysis: 2025_03_19_patch_1735

## First error

../../media/audio/audio_device_description.cc:50:40: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter spanified `kAirpodsNameSubstring` but failed to apply `.subspan()` to its return value of `data()`, leading to the error. The replacements for `.data()` and `.subspan()` are not correctly chained.

## Solution
The rewriter needs to chain `subspan()` correctly after `data()`. Need to ensure that when spanifying, we also update other locations that uses it so they work with the new type and methods.

## Note
No other errors.