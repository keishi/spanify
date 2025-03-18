# Build Failure Analysis: 2025_03_16_patch_1665

## First error

../../gpu/command_buffer/service/raster_decoder_autogen.h:66:31: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
   66 |       !GenQueriesEXTHelper(n, queries_safe)) {
      |                               ^~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempts to spanify the function `GLES2DecoderImpl::GenQueriesEXTHelper()`, however, `GLES2DecoderImpl::GenQueriesEXTHelper` is called by `HandleGenQueriesEXT` in `raster_decoder_autogen.h`, which is generated code and should be excluded from spanification. The rewriter is attempting to rewrite generated code, which is disallowed.

## Solution
The rewriter should avoid spanifying a function if it depends on spanifying code that is excluded by a filter. In this specific case, the rewriter should ignore the `GLES2DecoderImpl::GenQueriesEXTHelper` and `QueryManager::GenQueries` functions entirely.

## Note
The same error also appears in `gles2_cmd_decoder.cc`.