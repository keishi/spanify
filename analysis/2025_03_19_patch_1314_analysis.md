# Build Failure Analysis: 2025_03_19_patch_1314

## First error

../../crypto/hmac_unittest.cc:162:22: error: no matching member function for call to 'Init'
  162 |     ASSERT_TRUE(hmac.Init(reinterpret_cast<const unsigned char*>(cases[i].key),

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `HMAC::Init` function, but failed to spanify a call site. In `HMAC::Init` function, the first argument, `key`, now expects a `base::span<const unsigned char>`, but this call site is passing a raw pointer `reinterpret_cast<const unsigned char*>(cases[i].key)`.

## Solution
The rewriter needs to rewrite the call site `hmac.Init(reinterpret_cast<const unsigned char*>(cases[i].key), sizeof(cases[i].key))` to `hmac.Init(base::span(cases[i].key, sizeof(cases[i].key)))`.

## Note
Other errors in the log indicate that similar changes need to be applied to other call sites of the `Init` function. Also note that when a C-style array like `unsigned char key[131]` is converted to `std::array<unsigned char, 131> key` the size calculation changes from `sizeof(key)` to `(key.size() * sizeof(decltype(key)::value_type))`.