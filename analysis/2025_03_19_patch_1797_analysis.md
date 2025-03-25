# Build Failure Analysis: 2025_03_19_patch_1797

## First error

../../components/affiliations/core/browser/hash_affiliation_fetcher.cc:62:3: error: no matching function for call to 'SHA256HashString'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The function `crypto::SHA256HashString` expects a `void*` as the second argument. The spanified variable `hash` (which is now a `std::array`) cannot be directly passed because `std::array` does not implicitly decay to a pointer.  Taking the address of `hash` solves this specific error, but creates code that may be problematic in the future if/when `SHA256HashString` is spanified.

## Solution
The rewriter needs to recognize this pattern and insert `.data()` to access the underlying raw pointer of the `std::array`. In this case, it should generate `crypto::SHA256HashString(uri.canonical_spec(), hash.data(), bytes_count);`

## Note
There are two candidate functions the compiler found, which is not typical:
```
../../crypto/sha2.h:39:20: note: candidate function not viable: no known conversion from 'std::array<uint8_t, bytes_count>' (aka 'array<unsigned char, bytes_count>') to 'void *' for 2nd argument; take the address of the argument with &
   39 | CRYPTO_EXPORT void SHA256HashString(std::string_view str,
      |                    ^
   40 |                                     void* output,
      |                                     ~~~~~~~~~~~~
../../crypto/sha2.h:34:27: note: candidate function not viable: requires single argument 'str', but 3 arguments were provided
   34 | CRYPTO_EXPORT std::string SHA256HashString(std::string_view str);
      |                           ^                ~~~~~~~~~~~~~~~~~~~~
```
The first candidate is the expected function, but the rewriter needs to add `.data()` to `hash` to pass a `uint8_t*`. The second candidate is another function (a 1-argument overload), which should not be called in this context.