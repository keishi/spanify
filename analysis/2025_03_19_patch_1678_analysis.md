# Build Failure Analysis: 2025_03_19_patch_1678

## First error

../../net/cookies/cookie_monster.h:252:33: error: expected expression
  252 |   const std::array<const char*, > kDefaultCookieableSchemes;
      |                                 ^

## Category
Rewriter cannot get the size of forward declared array variable.

## Reason
The rewriter converted `const char* const kDefaultCookieableSchemes[]` to `const std::array<const char*, > kDefaultCookieableSchemes;`. But it failed to provide the size of the std::array. This is because the size of the array `kDefaultCookieableSchemes` is determined implicitly from its initializer, which appears in the .cc file, not the .h file. The rewriter cannot determine the size of the array from its declaration.

## Solution
The rewriter needs to be able to determine the size of the array from its initializer and propagate it to the declaration. A simpler solution is to not rewrite this particular case.

## Note
There is an additional error due to the failed rewrite:

```
../../net/cookies/cookie_monster.cc:489:7: error: no matching function for call to 'std::array<const char *, 0>::begin()'