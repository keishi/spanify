# Build Failure Analysis: 2025_03_19_patch_276

## First error

../../media/base/cdm_key_information.cc:32:25: error: reinterpret_cast from 'const std::string' (aka 'const basic_string<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the third-party function `CdmKeyInformation` but did not update the call site using `reinterpret_cast`. The rewriter needs to be able to remove the `reinterpret_cast`.

## Solution
The rewriter should remove the `reinterpret_cast` and directly pass the `key_id` variable. Use `.data()` to get a pointer to the underlying data of the string, but the `span` constructor expects a span so a `.subspan(key_id.size())` is needed.

```c++
//Old Code:
CdmKeyInformation::CdmKeyInformation(reinterpret_cast<const uint8_t*>(key_id),
                        key_id.size(),
                        status,
                        system_code) {}

//New Code:
CdmKeyInformation::CdmKeyInformation(base::span<const uint8_t> key_id)
    : CdmKeyInformation(reinterpret_cast<const uint8_t*>(key_id.data()),
                         key_id.size(),
                         status,
                         system_code) {}

```

Here's the fix to remove reinterpret cast and still pass the span parameter

```c++
//Old Code:
CdmKeyInformation::CdmKeyInformation(const std::string& key_id,
                                     KeyStatus status,
                                     uint32_t system_code)
    : CdmKeyInformation(reinterpret_cast<const uint8_t*>(key_id),
                        key_id.size(),
                        status,
                        system_code) {}

//New Code:
CdmKeyInformation::CdmKeyInformation(const std::string& key_id,
                                     KeyStatus status,
                                     uint32_t system_code)
    : CdmKeyInformation(base::span(reinterpret_cast<const uint8_t*>(key_id.data()), key_id.size()),
                        status,
                        system_code) {}
```

## Note
The fix is to pass a correctly constructed span to the spanified function.