# Build Failure Analysis: 2025_03_19_patch_827

## First error

../../gpu/command_buffer/service/raster_decoder_autogen.h:219:42: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified `ServicePaintCache::Purge` in paint_cache.cc, but the related function `RasterDecoderImpl::DeletePaintCachePathsINTERNALHelper` in raster_decoder.cc, which calls that function, was not spanified. raster_decoder_autogen.h is generated code, so it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.

## Solution
The rewriter should avoid spanifying functions that have declarations in generated files.

## Note
There are multiple other errors due to the same reason.