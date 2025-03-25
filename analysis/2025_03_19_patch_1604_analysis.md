# Build Failure Analysis: 2025_03_19_patch_1604

## First error

../../media/cdm/library_cdm/clear_key_cdm/clear_key_cdm.h:96:68: error: non-virtual member function marked 'override' hides virtual member functions
   96 |                             uint32_t server_certificate_data_size) override;
      |                                                                    ^
../../media/cdm/api/content_decryption_module.h:708:16: note: hidden overloaded virtual function 'cdm::ContentDecryptionModule_10::SetServerCertificate' declared here: type mismatch at 2nd parameter ('const uint8_t *' (aka 'const unsigned char *') vs 'base::span<const uint8_t>' (aka 'span<const unsigned char>'))
  708 |   virtual void SetServerCertificate(uint32_t promise_id,
      |                ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter changed the signature of `ClearKeyCdm::SetServerCertificate` to use `base::span`, but this function is overriding a function declared in `cdm::ContentDecryptionModule_10` which is third party code. The rewriter should not be modifying third party code. This causes a type mismatch in the function signatures.

## Solution
The rewriter should avoid spanifying functions when they override functions in third party code.

## Note
There are additional errors in the build log due to the pure virtual function `SetServerCertificate` not being implemented because the rewriter changed the function signature. This secondary error is caused by the initial error.