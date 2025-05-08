# Build Failure Analysis: 2025_05_02_patch_85

## First error

../../net/websockets/websocket_basic_stream_test.cc:885:7: error: no matching constructor for initialization of 'MockRead' (aka 'MockReadWrite<MOCK_READ>')

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted the C-style array `kMultiplePongFrames` to `std::array`. The `MockRead` constructor takes a `const char* data` and `int data_len` as arguments. The first `MockRead` call passes `kMultiplePongFrames` directly, which now is an `std::array`. There is no implicit conversion from `std::array` to `const char*`, hence the error.

## Solution
The rewriter needs to add `.data()` when that variable is passed to a third_party function call. The first `MockRead` should be `MockRead(ASYNC, kMultiplePongFrames.data(), kMultiplePongFramesSize)`

## Note
The second `MockRead` passes `base::span<const char>(kMultiplePongFrames).subspan(kMultiplePongFramesSize - 2)` which causes another error. The `MockRead` constructor also does not accept a `base::span` as the `data` argument. The rewriter should also add `.data()` to the spanified variable like this: `base::span<const char>(kMultiplePongFrames).subspan(kMultiplePongFramesSize - 2).data()`