# Build Failure Analysis: 2025_03_19_patch_367

## First error

../../third_party/blink/renderer/core/css/parser/css_property_parser.cc:345:15: error: no viable conversion from 'std::array<char, kMaxCSSPropertyNameLength>' to 'const char *'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `buffer` from `char[]` to `std::array<char, kMaxCSSPropertyNameLength>`, but failed to update the code where the `buffer` is used as a `const char*`. Specifically, the line `const char* name = buffer;` is now invalid because `std::array` cannot be implicitly converted to `const char*`. The rewriter should add `.data()` to `buffer` to get a pointer to the underlying character array.

## Solution
The rewriter should add `.data()` to `buffer` in the line `const char* name = buffer;`

For example,
```diff
-  char buffer[kMaxCSSPropertyNameLength];
+  std::array<char, kMaxCSSPropertyNameLength> buffer;
   if (!QuasiLowercaseIntoBuffer(property_name, length, buffer)) {
     return CSSPropertyID::kInvalid;
   }
 
-  const char* name = buffer;
+  const char* name = buffer.data();
```

Also fix the other errors by adding `.data()` as well.

```diff
--- a/third_party/blink/renderer/core/css/parser/css_property_parser.cc
+++ b/third_party/blink/renderer/core/css/parser/css_property_parser.cc
@@ -338,7 +340,7 @@
     return CSSPropertyID::kInvalid;
   }
 
-  const char* name = buffer;
+  const char* name = buffer.data();
 
   // Check if the string is a valid Property ID.
   const Property* hash_table_entry = FindProperty(name, length);
@@ -346,7 +348,7 @@
   if (hash_table_entry)
     return hash_table_entry->id;
 
-  DCHECK_EQ(hash_table_entry, FindProperty(buffer, length));
+  DCHECK_EQ(hash_table_entry, FindProperty(buffer.data(), length));
 
   const CSSValueID& id = *unresolved_value;
   if (id != CSSValueInvalid) {
@@ -375,7 +377,7 @@
   if (chars.length() > kMaxCSSPropertyNameLength)
     return CSSPropertyID::kInvalid;
 
-  if (!QuasiLowercaseIntoBuffer(property_name, length, buffer)) {
+  if (!QuasiLowercaseIntoBuffer(property_name, length, buffer.data())) {
     return CSSPropertyID::kInvalid;
   }
 
```

## Note
There are other errors in this build log that also need to be fixed. The rewriter should be able to detect and fix these automatically.