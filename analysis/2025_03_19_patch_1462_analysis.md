# Build Failure Analysis: 2025_03_19_patch_1462

## First error

../../net/websockets/websocket_frame_test.cc:274:8: error: initializer-string for char array is too long, array size is 1 but initializer has size 97 (including the null terminating character)

## Category
Rewriter needs to get the size of forward declared array variable.

## Reason
The rewriter converted a C-style array to `std::array`. The code was:

```c++
  static constexpr char kTestInput[] = { ... };
```

But the rewriter didn't determine the size of the C-style array. The generated code was:

```c++
constexpr static auto kTestInput = std::to_array<char>( { ... });
```

`std::to_array<char>` deduces the size of the array from the initialization list, however `std::to_array<char>` creates an array of `char`s as opposed to an array of `char[N]`. The result is that `kTestInput` has a type of `std::array<char, 1>`.

## Solution
When converting a C-style array to `std::array` using `std::to_array`, the rewriter should preserve the original size if available. If size info isn't available, the rewriter should not attempt to convert it to `std::array`.

## Note
The code also generated this error:

```
../../net/websockets/websocket_frame_test.cc:302:44: error: no member named 'subspan' in 'std::array<char, 1>'
  302 |         memcpy(aligned_scratch, kTestInput.subspan(frame_offset).data(),
      |                                 ~~~~~~~~~~ ^
```

This is because after the rewrite, `kTestInput` becomes `std::array<char, 1>` instead of a `std::array<char, 97>`.