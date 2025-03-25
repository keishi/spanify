# Build Failure Analysis: 2025_03_19_patch_378

## First error

../../ui/accessibility/platform/inspect/ax_event_recorder_auralinux.cc:87:17: error: no matching function for call to 'atk_add_global_event_listener'
   87 |   unsigned id = atk_add_global_event_listener(OnATKEventReceived, event_name);
      |                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/atk-1.0/atk/atkutil.h:202:7: note: candidate function not viable: no known conversion from 'gboolean (GSignalInvocationHint *, unsigned int, base::span<const GValue>, gpointer)' (aka 'int (_GSignalInvocationHint *, unsigned int, span<const _GValue>, void *)') to 'GSignalEmissionHook' (aka 'int (*)(_GSignalInvocationHint *, unsigned int, const _GValue *, void *)') for 1st argument
  202 | guint   atk_add_global_event_listener (GSignalEmissionHook listener,
      |         ^                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site.
The `AXEventRecorderAuraLinux::OnATKEventReceived` was spanified, but the call to `atk_add_global_event_listener` isn't spanified.

## Solution
The rewriter should spanify the call site so the `const GValue*` parameter becomes `base::span<const GValue>`.

## Note
None