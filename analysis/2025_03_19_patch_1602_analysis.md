# Build Failure Analysis: 2025_03_19_patch_1602

## First error

../../media/cdm/library_cdm/clear_key_cdm/clear_key_cdm.h:87:46: error: non-virtual member function marked 'override' hides virtual member functions
   87 |                      uint32_t response_size) override;
      |                                              ^
../../media/cdm/api/content_decryption_module.h:732:16: note: hidden overloaded virtual function 'cdm::ContentDecryptionModule_10::UpdateSession' declared here: type mismatch at 4th parameter ('const uint8_t *' (aka 'const unsigned char *') vs 'base::span<const uint8_t>' (aka 'span<const unsigned char>'))
  732 |   virtual void UpdateSession(uint32_t promise_id,

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `ClearKeyCdm::UpdateSession` but failed to spanify the base class `ContentDecryptionModule::UpdateSession`. This is a case where the derived class' override doesn't match the base class' declaration.

## Solution
The rewriter needs to spanify the base class declaration in addition to the derived class declaration.

## Note
There are more errors related to the `UpdateSession` function.