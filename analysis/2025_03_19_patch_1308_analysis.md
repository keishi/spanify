# Build Failure Analysis: 2025_03_19_patch_1308

## First error

../../components/gwp_asan/crash_handler/crash_analyzer.cc:485:23: error: no viable conversion from 'pointer' (aka 'gwp_asan::internal::AllocatorState::SlotMetadata *') to 'base::span<const SlotMetadata>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified `AllocatorState::GetMetadataForAddress`, but failed to properly convert the call site in `CrashAnalyzer::AnalyzeCrash`. The `CrashAnalyzer::AnalyzeCrash` function is passing a raw pointer `metadata_arr.get()` into a spanified function. In this case the compiler error says that there is no implicit conversion from `SlotMetadata *` to `base::span<const SlotMetadata>`.

## Solution
The rewriter needs to be able to handle this case. The function signature should be fixed by also updating all call sites with the `base::span` type.

## Note
The header file also had to be updated with `#include "base/containers/span.h"`:

```
+++ b/components/gwp_asan/common/allocator_state.h
@@ -30,6 +30,7 @@
 #include <string>
 #include <type_traits>
 
+#include "base/containers/span.h"