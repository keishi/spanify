# Build Failure Analysis: 2025_03_19_patch_214

## First error

../../components/feedback/redaction_tool/ip_address.h:66:29: error: no viable conversion from returned value of type 'base::span<uint8_t>' (aka 'span<unsigned char>') to function return type 'uint8_t *' (aka 'unsigned char *')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified the `data()` member function, but it is used as a return value of `begin()`. The rewriter failed to add `.data()` to a spanified return value, resulting in a type mismatch.

## Solution
When a function's return value was rewritten into a span, and another function returns the value of that function, `.data()` should be added at the return site of the `data()` function.

## Note
The other two errors are follow-on errors, but will likely disappear once we fix this `.data()` issue.