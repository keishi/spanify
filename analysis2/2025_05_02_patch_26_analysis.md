# Build Failure Analysis: 2025_05_02_patch_26

## First error

testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc:121:18: error: no matching function for call to 'I420Scale_16'
   121 |     I420Scale_16(p_src_y_16.data(), src_stride_y, p_src_u_16, src_stride_uv,
       |     ~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~
testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc:129:18: error: no matching function for call to 'I444Scale_16'
   129 |     I444Scale_16(p_src_y_16.data(), src_stride_y, p_src_u_16, src_stride_uv,
       |     ~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `p_src_y_16` but did not spanify the call sites. As a result, the call sites are now passing `p_src_y_16.data()` which is a `uint16_t*` but the function `I420Scale_16` and `I444Scale_16` are expecting a `base::span<uint16_t>`.

## Solution
The rewriter needs to spanify the call sites or not spanify the variable. Because this variable is freed at the end of the function, it makes sense to just spanify it inside the scope and pass the raw pointer to the function.

## Note
The free needs to be updated to `free(p_src_y_16.data());`