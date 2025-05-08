# Build Failure Analysis: 2025_05_02_patch_1051

## First error

../../base/command_line.cc:45:74: error: extraneous ')' before ';'
   45 | constexpr std::array<CommandLine::CharType, 2> kSwitchValueSeparator{"="});
      |                                                                          ^

## Category
Rewriter dropped mutable qualifier.

## Reason
The `kSwitchValueSeparator` is defined as a `constexpr` array.

```c++
constexpr std::array<CommandLine::CharType, 2> kSwitchValueSeparator{"="});
```

The diff changed this from

```c++
constexpr CommandLine::CharType kSwitchValueSeparator[] =
    FILE_PATH_LITERAL("=");
```

to

```c++
constexpr std::array<CommandLine::CharType, 2> kSwitchValueSeparator{"="});
```

The original code used `FILE_PATH_LITERAL` which is defined as `L"..."`. But the `CharType` is defined as `char`. Therefore this created an implicit conversion from `wchar_t` to `char`. The rewriter then likely incorrectly added `)` because it thought the initializer list ended at `"`.

## Solution
The rewriter should avoid rewriting the array in the first place. `FILE_PATH_LITERAL` should always be avoided.

## Note
The rewriter should not have touched this code in the first place.