# Build Failure Analysis: 2025_03_19_patch_955

## First error

../../device/fido/cable/v2_handshake.cc:147:66: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
  147 |   static const std::array<std::array<const char, 5>, 4> kTLDs = {"com", "org",

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter changed `kTLDs`'s initialization from `static const char kTLDs[4][5] = {"com", "org", "net", "info"};` to `static const std::array<std::array<const char, 5>, 4> kTLDs = {"com", "org", "net", "info"};`.

However, the initialization requires nested braces because `std::array`'s constructor needs to be explicit.

## Solution
The rewriter should add nested braces in the initialization to prevent the error.
```diff
 static const std::array<std::array<const char, 5>, 4> kTLDs = {{"com", "org",
                                                                 "net", "info"}};
```

## Note
Also, the code failed to compile due to incompatible operator += after the rewriter changed the array to `std::array`.

```
../../device/fido/cable/v2_handshake.cc:149:7: error: no viable overloaded '+='
  149 |   ret += kTLDs[tld_value];
      |   ~~~ ^  ~~~~~~~~~~~~~~~~
```

The fix is to add `.data()` to `kTLDs[tld_value]`.

```diff
 ret += kTLDs[tld_value].data();