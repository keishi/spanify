```
# Build Failure Analysis: 10431

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:635:30: error: constructor for 'gpu::gles2::GLES2DecoderPassthroughImpl' must explicitly initialize the const member 'command_info'

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The rewriter changed the member variable `command_info` from a C-style array to a `std::array`. Since the member is `const`, it must be initialized in the constructor's member initializer list. The original code used an in-place initializer for the array outside the class definition, which is not allowed for `const` members when using `std::array`.

## Solution
The rewriter needs to initialize the `command_info` member in the constructor's initializer list. The rewriter can move the data outside of the class to a `constexpr` variable and copy-construct in the constructor.

For example:

```c++
namespace {
constexpr std::array<CommandInfo, kNumCommands - kFirstGLES2Command>
    kDefaultCommandInfo = {{ /* ... */ }};
}  // namespace

GLES2DecoderPassthroughImpl::GLES2DecoderPassthroughImpl()
    : command_info(kDefaultCommandInfo) {}
```

## Note
The second error stems from a similar issue:
```
../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:2804:34: error: non-static data member defined out-of-line
 2804 |     GLES2DecoderPassthroughImpl::command_info[] = {
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^
```
This is also due to the invalid initialization style of a `const` `std::array`. This will be resolved with the above fix.