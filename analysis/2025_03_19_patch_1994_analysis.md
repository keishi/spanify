# Build Failure Analysis: 2025_03_19_patch_1994

## First error

../../media/cdm/cdm_adapter.h:154:54: error: non-virtual member function marked 'override' hides virtual member functions
  154 |                            uint32_t keys_info_count) override;
      |                                                      ^
../../media/cdm/api/content_decryption_module.h:1390:16: note: hidden overloaded virtual function 'cdm::Host_10::OnSessionKeysChange' declared here: type mismatch at 4th parameter ('const KeyInformation *' vs 'base::span<const cdm::KeyInformation>')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter has spanified a function, but failed to spanify a call site.
The rewriter converted the `OnSessionKeysChange` method in the `CdmAdapter` class to take a `base::span<const cdm::KeyInformation>` as an argument. However, it did not update the corresponding virtual function declaration in the base class `cdm::Host_10`, `cdm::Host_11` and `cdm::Host_12` (defined in `content_decryption_module.h`). This resulted in a mismatch between the function signatures, causing the `override` specifier to produce an error. The signature of `OnSessionKeysChange` in `CdmAdapter` does not match the function it is overriding. The old and new signatures are as follows:

Old signature:
`virtual void OnSessionKeysChange(const char* session_id, uint32_t session_id_size, bool has_additional_usable_key, const cdm::KeyInformation* keys_info, uint32_t keys_info_count) = 0;`

New signature:
`virtual void OnSessionKeysChange(const char* session_id, uint32_t session_id_size, bool has_additional_usable_key, base::span<const cdm::KeyInformation> keys_info, uint32_t keys_info_count) override;`

## Solution
The rewriter should update the virtual function declaration in `cdm::Host_10`, `cdm::Host_11` and `cdm::Host_12` to match the new signature in `CdmAdapter`. Specifically, the `const cdm::KeyInformation* keys_info` parameter should be converted to `base::span<const cdm::KeyInformation> keys_info`.

## Note
The build log also indicates an issue with the `CdmAdapter` class being abstract. This is a consequence of the signature mismatch, as the `CdmAdapter` class no longer provides a concrete implementation for all the pure virtual functions declared in its base classes. This issue will be resolved once the signatures are made to match.