# Build Failure Analysis: 2025_05_02_patch_1839

## First error
../../content/browser/fenced_frame/fenced_frame_config.cc:22:24: error: redefinition of 'kUrnUuidPrefix' with a different type: 'const std::string_view' (aka 'const basic_string_view<char>') vs 'const char[]'

## Category
Rewriter caused conflict with existing forward declaration.

## Reason
The rewriter replaced `const char kUrnUuidPrefix[] = "urn:uuid:";` with `const std::string_view kUrnUuidPrefix = "urn:uuid:";`. However, `content/browser/fenced_frame/fenced_frame_config.h` contains `extern const char kUrnUuidPrefix[];`. This forward declaration is incompatible with the rewriter's change.

## Solution
The rewriter should not change the type of global variables that are forward declared in a header file. The rewriter should only change the definition if it also updates the forward declaration. Alternatively the rewriter should check for the existence of a forward declaration, and skip rewriting that variable.

## Note
The second error is a direct consequence of the first, because it is trying to use `.data()` on a `const char[]`, rather than `std::string_view`.