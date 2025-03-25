# Build Failure Analysis: 2025_03_19_patch_1603

## First error
../../media/cdm/library_cdm/clear_key_cdm/clear_key_cdm.h:78:65: error: non-virtual member function marked 'override' hides virtual member functions

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site of that function. `ClearKeyCdm::CreateSessionAndGenerateRequest` is an override of `ContentDecryptionModule::CreateSessionAndGenerateRequest`. The rewriter correctly changed the signature of `ClearKeyCdm::CreateSessionAndGenerateRequest`, but didn't change the signature of the base class. Thus `ClearKeyCdm::CreateSessionAndGenerateRequest` no longer overrides the base class function.

## Solution
The rewriter must be able to update the signatures of virtual functions in base classes.

## Note
The build log contains other errors as well because after the virtual function signature doesn't match, the class is now abstract.

```
../../media/cdm/library_cdm/clear_key_cdm/clear_key_cdm.cc:196:13: error: allocating an object of abstract class type 'media::ClearKeyCdm'