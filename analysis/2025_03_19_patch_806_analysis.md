# Build Failure Analysis: 2025_03_19_patch_806

## First error

../../components/services/font/fontconfig_matching.cc:88:39: error: no matching function for call to 'to_array'

## Category
Rewriter needs to ensure that the element type of `std::to_array` matches the input type.

## Reason
The code attempts to use `std::to_array` to convert an initializer list of C-style strings (`const char[5]`) into a `std::array` of `std::array<const char, 5>`. However, the compiler cannot implicitly convert `const char[5]` to `std::array<const char, 5>`. This results in a "no matching function for call to 'to_array'" error.

## Solution

Since the desired outcome is a `std::array<std::array<const char, 5>, N>`, rewrite the code to explicitly construct the inner `std::array` objects within the initializer list.

```c++
  // Before
  static const auto kSFNTExtensions = std::to_array<std::array<const char, 5>>({
      ".ttf",
      ".otc",
      ".TTF",
      ".ttc",
      ".otf",
      ".OTF",
      "",
  });

  // After
  static const auto kSFNTExtensions = std::array{
      std::array<const char, 5>{".ttf"},
      std::array<const char, 5>{".otc"},
      std::array<const char, 5>{".TTF"},
      std::array<const char, 5>{".ttc"},
      std::array<const char, 5>{".otf"},
      std::array<const char, 5>{".OTF"},
      std::array<const char, 5>{""},
  };
```

## Note
Alternatively we could use a `const char*` but prefer to use `std::array` if possible.

```c++
  // After
  static const auto kSFNTExtensions = std::to_array<const char*>({
      ".ttf",
      ".otc",
      ".TTF",
      ".ttc",
      ".otf",
      ".OTF",
      "",
  });