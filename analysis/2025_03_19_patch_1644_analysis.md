# Build Failure Analysis: 2025_03_19_patch_1644

## First error

../../media/filters/memory_data_source.h:52:61: error: no viable conversion from 'std::nullptr_t' to 'base::raw_span<const uint8_t, AllowPtrArithmetic>' (aka 'span<const unsigned char, dynamic_extent, raw_ptr<const unsigned char, (RawPtrTraits)8U | AllowPtrArithmetic>>')

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter changed the type of `data_` from `raw_ptr<const uint8_t, AllowPtrArithmetic>` to `base::raw_span<const uint8_t, AllowPtrArithmetic>`.  The original code initialized this pointer member to `nullptr`.  However, `base::raw_span` does not have a constructor that accepts `nullptr`.  Instead, it should be initialized with `{}`.

## Solution
The rewriter needs to replace `nullptr` initialization of `raw_span` member fields with `{}`.

## Note
The second error is: `../../media/filters/memory_data_source.cc:23:13: error: reinterpret_cast from 'const std::string' (aka 'const basic_string<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed`.

This is happening because the rewriter changed from `const uint8_t*` to `raw_span`, but did not modify the construction of the `raw_span` from a `std::string`.