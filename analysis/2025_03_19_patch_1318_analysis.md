# Build Failure Analysis: 2025_03_19_patch_1318

## First error

../../components/feed/core/v2/feed_store.cc:87:35: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   87 |   return kLocalActionPrefix.data().subspan(base::NumberToString(id));
      |          ~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `kLocalActionPrefix` before calling `.subspan()`. However, `kLocalActionPrefix` is already an `std::array` and does not need `.data()` to access the underlying pointer for `.subspan()`.

## Solution
The rewriter should not add `.data()` to `std::array` variables.

## Note
The second error is

```
../../components/feed/core/v2/feed_store.cc:162:10: error: no matching function for call to 'StartsWith'
 162 |   return base::StartsWith(key, kLocalActionPrefix);
      |          ^~~~~~~~~~~~~~~~
../../base/strings/string_util.h:398:18: note: candidate function not viable: no known conversion from 'const std::array<char, 3>' to 'std::string_view' (aka 'basic_string_view<char>') for 2nd argument
  398 | BASE_EXPORT bool StartsWith(
      |                  ^
  399 |     std::string_view str,
  400 |     std::string_view search_for,
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/strings/string_util.h:402:18: note: candidate function not viable: no known conversion from 'const std::string' (aka 'const basic_string<char>') to 'std::u16string_view' (aka 'basic_string_view<char16_t>') for 1st argument
  402 | BASE_EXPORT bool StartsWith(
      |                  ^
  403 |     std::u16string_view str,
      |     ~~~~~~~~~~~~~~~~~~~~~~~
```

Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.
Because `kLocalActionPrefix` is used in `base::StartsWith`, the rewriter should add `.data()` to `kLocalActionPrefix` at the call site since the function takes a `std::string_view`.

```
diff --git a/components/feed/core/v2/feed_store.cc b/components/feed/core/v2/feed_store.cc
index 3d5e564345734..42c0f0cb1c2e9 100644
--- a/components/feed/core/v2/feed_store.cc
+++ b/components/feed/core/v2/feed_store.cc
@@ -4,6 +4,7 @@
 
 #include "components/feed/core/v2/feed_store.h"
 
+#include <array>
 #include <string_view>
 #include <utility>
 
@@ -39,7 +40,7 @@ namespace {
 // R/<web_feed_id>                  -> recommended_web_feed
 // W/<operation-id>                 -> pending_web_feed_operation
 // v/<docid>/<timestamp>            -> docview
-constexpr char kLocalActionPrefix[] = "a/";
+constexpr std::array<char, 3> kLocalActionPrefix{"a/"};
 constexpr char kMetadataKey[] = "m";
 constexpr char kSubscribedFeedsKey[] = "subs";
 constexpr char kRecommendedIndexKey[] = "recommendedIndex";
@@ -83,7 +84,7 @@ std::string SharedStateKey(const StreamType& stream_type,
   return SharedStateKey(feedstore::StreamKey(stream_type), content_id);
 }
 std::string LocalActionKey(int64_t id) {
-  return kLocalActionPrefix + base::NumberToString(id);
+  return kLocalActionPrefix.data() + base::NumberToString(id);
 }
 std::string LocalActionKey(const LocalActionId& id) {
   return LocalActionKey(id.GetUnsafeValue());
@@ -160,7 +161,7 @@ bool IsLocalActionKey(const std::string& key) {
   // TODO(crbug.com/1397328): Use StartsWith(key, std::string_view) once we
   // migrate base::StartsWith to use std::string_view.
   // TODO(crbug.com/1397328): Make kLocalActionPrefix be a std::string_view.
-  return base::StartsWith(key, kLocalActionPrefix);
+  return base::StartsWith(key, kLocalActionPrefix.data());
 }
 
 }  // namespace feedstore