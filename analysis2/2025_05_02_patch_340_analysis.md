# Build Failure Analysis: 2025_05_02_patch_340

## First error

```
../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:2804:34: error: redeclaration of 'command_info' with a different type: 'const GLES2DecoderPassthroughImpl::CommandInfo[]' vs 'const std::array<CommandInfo, kNumCommands - kFirstGLES2Command>'
 2804 |     GLES2DecoderPassthroughImpl::command_info[] = {
      |                                  ^
```

## Category
Rewriter failed to arrayify a statically declared member.

## Reason
The rewriter changed the declaration of `command_info` in the header file from a C-style array to `std::array`. However, it failed to update the definition of `command_info` in the corresponding `.cc` file. As a result, the `.cc` file still uses the C-style array syntax for definition, causing a redeclaration error with a different type.

## Solution
The rewriter needs to update the definition of `command_info` in the `.cc` file to match the `std::array` declaration in the header file. The correct definition in `gles2_cmd_decoder_passthrough.cc` should look like this:

```c++
const std::array<GLES2DecoderPassthroughImpl::CommandInfo,
                   kNumCommands - kFirstGLES2Command>
    GLES2DecoderPassthroughImpl::command_info = {
    // ... array initialization ...
};
```

## Note
The rewriter only modified the declaration in the header but didn't update the definition in the cc file.