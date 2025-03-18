# Build Failure Analysis: 2025_03_14_patch_1687

## First error

../../media/audio/alsa/alsa_output.h:61:3: error: non-static data member cannot be constexpr; did you intend to make it static?
   61 |   constexpr std::array<char, 6> kPlugPrefix{"plug:"};
      |   ^
      |   static

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter changed `static constexpr char kPlugPrefix[] = "plug:";` to `constexpr std::array<char, 6> kPlugPrefix{"plug:"};` which made `kPlugPrefix` a non-static member field. But non-static member fields cannot be constexpr.

## Solution
The rewriter should rewrite variable declaration from nullptr to use `{}` instead of `nullptr`. Or the rewriter should make the array `static`.

## Note