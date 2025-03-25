# Build Failure Analysis: 2025_03_19_patch_1282

## First error

../../third_party/libc++/src/include/__memory/unique_ptr.h:754:30: error: no matching constructor for initialization of 'redaction::RedactionTool'

## Category
Rewriter needs to generate code to construct a span from a C-style array.

## Reason
The `RedactionTool` constructor was changed to take a `base::span<const char* const>` instead of a `const char* const*`. However, the rewriter doesn't properly convert `nullptr` to an empty span.

## Solution
The rewriter needs to be updated to generate the proper `base::span` construction when passing a null terminated array.  The fix would be to construct the span inline, similar to `RedactErrorMessage` function: `/*first_party_extension_ids=*/{}`.

## Note
The error message complains about a missing constructor. It says, `no known conversion from 'const char *const *' to 'base::span<const char *const>' for 1st argument`.