# Build Failure Analysis: 2025_03_19_patch_317

## First error

../../gpu/command_buffer/client/cmd_buffer_helper_test.cc:95:15: error: no matching constructor for initialization of 'AsyncAPIMock::IsArgs'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function AddCommandWithExpect was spanified, but the mock code expects a raw pointer. The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter should be able to correctly spanify the call site.

## Note
Here are some of the follow up errors:
```
../../gpu/command_buffer/client/cmd_buffer_helper_test.cc:115:54: error: no viable conversion from 'pointer' (aka 'gpu::CommandBufferEntry *') to 'base::span<CommandBufferEntry>' (aka 'span<gpu::CommandBufferEntry>')
  115 |         _return, test_command_next_id_++, arg_count, args_ptr.get());
      |                                                      ^~~~~~~~~~~~~~
../../base/containers/span.h:1032:13: note: candidate constructor not viable: no known conversion from 'pointer' (aka 'gpu::CommandBufferEntry *') to 'const span<CommandBufferEntry> &' for 1st argument