# Build Failure Analysis: 2025_05_02_patch_1108

## First error

../../gpu/command_buffer/service/common_decoder.cc:42:56: error: 'CommandInfo' is a private member of 'gpu::CommonDecoder'
  42 | const auto command_info = std::to_array<CommonDecoder::CommandInfo>({
      |                                                        ^

## Category
Rewriter needs to make private members public before arrayifying them.

## Reason
The code attempts to use `std::to_array` to create a `std::array` from the `command_info` member. However, `CommandInfo` struct is a private member of the `CommonDecoder` class, preventing access from outside the class, including from `std::to_array`. Additionally, `HandleNoop`, `HandleSetToken` and other Handler functions are also private members and cannot be accessed outside the class.

## Solution
The `CommandInfo` struct and the Handler functions (`HandleNoop`, `HandleSetToken` etc.) must be made public within the `CommonDecoder` class before attempting to arrayify the `command_info` member. The rewriter should detect when it is about to create array from a private struct or class member and emit the necessary changes to make the member public before arrayifying.
```diff
diff --git a/gpu/command_buffer/service/common_decoder.h b/gpu/command_buffer/service/common_decoder.h
index 7849e9d4c8a..c077e612a31 100644
--- a/gpu/command_buffer/service/common_decoder.h
+++ b/gpu/command_buffer/service/common_decoder.h
@@ -228,7 +228,7 @@
   // information about the command.
   // TODO(https://crbug.com/1469272): See if we can use a template to avoid
   //   having a separate function for each command.
-  struct CommandInfo {
+ public:  struct CommandInfo {
     using HandlerType = void (CommonDecoder::*)(
         uint32_t command, uint32_t arg_count, const CommandBufferEntry* args);
     HandlerType handler;
@@ -239,6 +239,7 @@
   };
 
  private:
+ public:
   COMMON_COMMAND_BUFFER_CMDS(COMMON_COMMAND_BUFFER_CMD_DECLARE)
   ...

```

## Note
The error message `no matching function for call to 'size'` indicates that `std::size` is being used incorrectly with a C-style array, but this is a secondary error that appears because of the initial access control issue.