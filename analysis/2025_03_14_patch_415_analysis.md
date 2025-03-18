# Build Failure Analysis: 2025_03_14_patch_415

## First error

../../gpu/command_buffer/service/webgpu_decoder_impl.cc:993:64: error: 'CommandInfo' is a private member of 'gpu::webgpu::(anonymous namespace)::WebGPUDecoderImpl'
  993 | constexpr auto command_info = std::to_array<WebGPUDecoderImpl::CommandInfo>({
      |                                                                ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The code attempts to use `std::to_array` to initialize a constexpr variable named `command_info`. However, the type `WebGPUDecoderImpl::CommandInfo` is a private member of `WebGPUDecoderImpl`. The spanify tool rewrites the `WebGPUDecoderImpl::command_info` from a C-style array to `std::array`, but it's not allowed to modify private members. It is likely this file is auto-generated, so the rewriter cannot rewrite excluded code, and thus should avoid rewriting functions that require modifying excluded code.

## Solution
The rewriter should avoid spanifying `command_info` (or functions which reference it) since `WebGPUDecoderImpl::CommandInfo` is private. This can be accomplished by preventing rewriter from rewriting private types.

## Note
This patch converts a C-style array to `std::array`. This causes the type of command_info to change. Since `WebGPUDecoderImpl::CommandInfo` is a private member, the rewriter shouldn't rewrite any functions that reference that private type.