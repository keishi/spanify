# Build Failure Analysis: 41

## First error

../../media/audio/audio_device_description.cc:50:40: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   50 |     name = kAirpodsNameSubstring.data().subspan(profile).data();
      |            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The code attempts to call `.subspan()` on the result of `.data()`. However, `.data()` returns a `const char*`, which is a primitive pointer type, and therefore doesn't have the `.subspan()` method, leading to the compiler error. The rewriter should consider the type of the expression before calling subspan on it.

## Solution
The rewriter needs to avoid inserting `.subspan()` after `.data()` when the base type is a primitive pointer. Instead, it should insert only `.data()` to get the raw pointer to pass to name.assign.

## Note
The rewriter has already converted `kAirpodsNameSubstring` to `std::array`, but didn't handle the chained calls correctly.