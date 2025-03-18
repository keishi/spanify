# Build Failure Analysis: 16584

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/device/bluetooth/floss/floss_adapter_client_unittest.cc at offset 43259, length 18: "(kFakeBytes.size() * sizeof(decltype(kFakeBytes)::value_type))" and offset 43265, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first rewrites `sizeof(kFakeBytes)` to `(kFakeBytes.size() * sizeof(decltype(kFakeBytes)::value_type))` via `RewriteArraySizeof`. It then attempts to append `.data()` to `kFakeBytes` via `AppendDataCall`, but this results in overlapping replacements because the end of the first replacement is very close to the intended insertion point of the second replacement.

## Solution
The rewriter should avoid overlapping replacements in cases such as this. More specifically, avoid rewriting `sizeof` calls on variables that will later have `.data()` appended.

## Note
This is the second instance of this bug category being reported.