# Build Failure Analysis: 1090

## First error

../../media/cdm/cdm_adapter.h:138:54: error: non-virtual member function marked 'override' hides virtual member functions
  138 |                            uint32_t keys_info_count) override;
      |                                                      ^
../../media/cdm/api/content_decryption_module.h:1418:16: note: hidden overloaded virtual function 'cdm::Host_10::OnSessionKeysChange' declared here: type mismatch at 4th parameter ('const KeyInformation *' vs 'base::span<const cdm::KeyInformation_2>')
 1418 |   virtual void OnSessionKeysChange(const char* session_id,
      |                ^
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter changed the `OnSessionKeysChange` function to take a `base::span<const cdm::KeyInformation_2>`, but the base class `cdm::Host_12` still takes `const cdm::KeyInformation_2*`. The rewriter changed the declaration in `CdmAdapter`, but failed to update the declaration in the base class, resulting in a type mismatch and "hiding" the base class's virtual function. This means the rewriter spanified a function declaration, but failed to spanify the corresponding function definition in the base class.

## Solution
The rewriter should also update all declarations in the base classes `cdm::Host_10`, `cdm::Host_11` and `cdm::Host_12`.

## Note
The error message "abstract class is marked 'final'" is a consequence of failing to properly override the base class method.  The `override` keyword caused the compiler to flag the mismatch.