# Build Failure Analysis: 2025_03_19_patch_231

## First error

../../ui/accessibility/platform/inspect/ax_inspect_utils.cc:24:38: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter is attempting to call `.subspan()` on the result of `.data()` which is a raw C pointer. This is not valid. The generated code `kSetKeyPrefixDictAttr.data().subspan(key_name)` is incorrect. The intention might have been to create a span from an array like object but the `data()` call messed this up.

## Solution
The rewriter logic should be fixed to avoid calling `subspan` on a raw pointer obtained from `.data()`. The replacements for ".data()" and ".subspan()" are conflicting and placed in the wrong place.

## Note
The code in question is:

```c++
std::string AXMakeSetKey(const std::string& key_name) {
  return kSetKeyPrefixDictAttr.data().subspan(key_name);
}
```

where `kSetKeyPrefixDictAttr` is:

```c++
constexpr std::array<char, 9> kSetKeyPrefixDictAttr{"_setkey_"};
```

The goal is likely to construct a substring but doing so by using the data pointer directly with a subspan. This could have worked if the `data()` call didn't happen.
```c++
  return kSetKeyPrefixDictAttr.subspan(key_name);