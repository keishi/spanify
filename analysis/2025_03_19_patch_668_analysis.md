# Build Failure Analysis: 2025_03_19_patch_668

## First error

../../extensions/common/user_script.h:58:3: error: non-static data member cannot be constexpr; did you intend to make it static?
   58 |   constexpr std::string_view kManifestContentScriptPrefix = "_mc_";
      |   ^
      |   static 

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter introduced `constexpr std::string_view kManifestContentScriptPrefix = "_mc_";` but member variables with constexpr must be static. However, this variable is likely intended to be non-static.

## Solution
The rewriter should not add constexpr in this case.

## Note
Secondary Errors:

1. `../../extensions/common/user_script.cc:46:5: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char *const'`

This likely resulted from spanifying `kManifestContentScriptPrefix` and then trying to use it as a constant char array.

2. `../../extensions/common/user_script.cc:79:45: error: member reference base type 'const_pointer' (aka 'const char *') is not a structure or union`

This happened because `kManifestContentScriptPrefix` was spanified, but span does not have `subspan` method.