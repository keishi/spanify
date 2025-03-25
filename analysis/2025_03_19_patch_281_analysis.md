# Build Failure Analysis: 2025_03_19_patch_281

## First error

../../gpu/command_buffer/service/webgpu_decoder_impl.cc:993:64: error: 'CommandInfo' is a private member of 'gpu::webgpu::(anonymous namespace)::WebGPUDecoderImpl'
  993 | constexpr auto command_info = std::to_array<WebGPUDecoderImpl::CommandInfo>({
      |                                                                ^
../../gpu/command_buffer/service/webgpu_decoder_impl.cc:307:10: note: declared private here
  307 |   struct CommandInfo {
      |          ^

## Category
Rewriter needs to make public members accessible when used with `std::to_array`.

## Reason
The rewriter transformed a C-style array initialization into a `std::to_array` initialization. However, `std::to_array` needs access to the type of the array. In this specific case, `WebGPUDecoderImpl::CommandInfo` is a private member. Hence, it is inaccessible in the scope that `std::to_array` is being called from.

## Solution
The rewriter should avoid using `std::to_array` when the type is not publicly accessible. Alternatively, make private members used with `std::to_array` publicly accessible.

## Note
The remaining errors are similar, indicating access issues with private members used within the `WEBGPU_COMMAND_LIST` macro. This macro likely relies on accessing members of `WebGPUDecoderImpl`, which are now inaccessible due to the use of `std::to_array` in a context where those members are private.