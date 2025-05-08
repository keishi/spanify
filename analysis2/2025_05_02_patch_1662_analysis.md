# Build Failure Analysis: 2025_05_02_patch_1662

## First error

```
../../media/cdm/library_cdm/clear_key_cdm/cdm_file_io_test.h:137:43: error: non-virtual member function marked 'override' hides virtual member function
  137 |                       uint32_t data_size) override;
      |                                           ^
../../media/cdm/api/content_decryption_module.h:653:16: note: hidden overloaded virtual function 'cdm::FileIOClient::OnReadComplete' declared here: type mismatch at 2nd parameter ('const uint8_t *' (aka 'const unsigned char *') vs 'base::span<const uint8_t>' (aka 'span<const unsigned char>'))
  653 |   virtual void OnReadComplete(Status status,
      |                ^
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `OnReadComplete` function in `CdmFileAdapter`, but failed to update the function signature in the base class `cdm::FileIOClient`. Therefore the override in `FileIOTest` now has the wrong signature.

## Solution
The rewriter needs to spanify the function signature in the base class `cdm::FileIOClient` as well. This may require rewriting code in third_party/ but is probably necessary.

## Note
The remaining errors are all caused by macro expansions that are attempting to pass void as a base::span. This is because the signature for FileIOTest::AddTestStep was also modified.
```
../../media/cdm/library_cdm/clear_key_cdm/cdm_file_io_test.cc:103:3: error: '(' and '{' tokens introducing statement expression appear in different macro expansion contexts [-Werror,-Wcompound-token-split-by-macro]
../../media/cdm/library_cdm/clear_key_cdm/cdm_file_io_test.cc:103:3: error: '}' and ')' tokens terminating statement expression appear in different macro expansion contexts [-Werror,-Wcompound-token-split-by-macro]
../../media/cdm/library_cdm/clear_key_cdm/cdm_file_io_test.cc:103:3: error: no viable conversion from 'void' to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')