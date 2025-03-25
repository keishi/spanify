# Build Failure Analysis: 2025_03_19_patch_763

## First error

../../gpu/command_buffer/client/raster_implementation_gles_unittest.cc:52:16: error: 'gpu::raster::RasterMockGLES2Interface::VerifySyncTokensCHROMIUM' hides overloaded virtual function [-Werror,-Woverloaded-virtual]

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. Specifically, the `VerifySyncTokensCHROMIUM` function was spanified, but the mock class `RasterMockGLES2Interface` was not updated to use the span type. This resulted in the mock method shadowing the virtual function it was supposed to override, leading to a type mismatch.

## Solution
The rewriter needs to update all implementations and mock implementations of functions that are spanified. So, in this case, it should rewrite the mock class to use `base::span<GLbyte*>`.

## Note
The same issue also exists for `TestGLES2Interface::VerifySyncTokensCHROMIUM`.
```
../../gpu/command_buffer/client/raster_implementation_gles_unittest.cc:52:16: error: 'gpu::raster::RasterMockGLES2Interface::VerifySyncTokensCHROMIUM' hides overloaded virtual function [-Werror,-Woverloaded-virtual]
   52 |   MOCK_METHOD2(VerifySyncTokensCHROMIUM,
      |                ^
../../gpu/command_buffer/client/gles2_interface_stub.h:23:8: note: hidden overloaded virtual function 'gpu::gles2::GLES2InterfaceStub::VerifySyncTokensCHROMIUM' declared here: type mismatch at 1st parameter ('base::span<GLbyte *>' (aka 'span<signed char *>') vs 'typename ::testing::internal::Function< ::testing::internal::identity_t<void (GLbyte **, GLsizei)>>::template template Arg<0>::type' (aka 'signed char **'))
   23 |   void VerifySyncTokensCHROMIUM(base::span<GLbyte*> sync_tokens,
      |        ^