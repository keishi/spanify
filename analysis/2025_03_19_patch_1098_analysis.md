# Build Failure Analysis: 2025_03_19_patch_1098

## First error

../../media/audio/alsa/alsa_output.h:61:3: error: non-static data member cannot be constexpr; did you intend to make it static?

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter removed the `static` keyword from the `kPlugPrefix` member and added `constexpr` instead. However, `constexpr` on a non-static member requires the member to be `const`, so Chromium issues a clang error.

## Solution
The rewriter should keep the `static` keyword while adding `constexpr`.
The rewriter should change

```c++
-  static constexpr char kPlugPrefix[] = "plug:";
+  constexpr std::array<char, 6> kPlugPrefix{"plug:"};
```

to

```c++
+  static constexpr std::array<char, 6> kPlugPrefix{"plug:"};