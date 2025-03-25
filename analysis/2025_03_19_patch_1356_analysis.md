```
# Build Failure Analysis: 2025_03_19_patch_1356

## First error

../../net/websockets/websocket_basic_stream_test.cc:885:7: error: no matching constructor for initialization of 'MockRead' (aka 'MockReadWrite<MOCK_READ>')
  885 |       MockRead(ASYNC, kMultiplePongFrames, kMultiplePongFramesSize)};

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. Specifically, the `MockRead` constructor expects a `const char*` for the data, but `kMultiplePongFrames` is now an `std::array<char, 14>`.

## Solution
The rewriter needs to recognize that the code is now passing an `std::array` to a function expecting `const char*` and add `.data()` to the argument.

## Note
The fix is to change line 885 from:
```c++
MockRead(ASYNC, kMultiplePongFrames, kMultiplePongFramesSize)};
```
to
```c++
MockRead(ASYNC, kMultiplePongFrames.data(), kMultiplePongFramesSize)};
```
And similarly on line 905.