```
# Build Failure Analysis: 2025_03_19_patch_708

## First error
```
../../third_party/blink/renderer/platform/fonts/script_run_iterator_test.cc:52:5: error: call to implicitly-deleted default constructor of 'WTF::StaticSingleton<const MockScriptData>::WrapperType' (aka 'const blink::MockScriptData')
   52 |     DEFINE_THREAD_SAFE_STATIC_LOCAL(const MockScriptData, mock_script_data, ());
      |     ^
../../third_party/blink/renderer/platform/wtf/std_lib_extras.h:67:3: note: expanded from macro 'DEFINE_THREAD_SAFE_STATIC_LOCAL'
   67 |   DEFINE_STATIC_LOCAL_IMPL(Type, Name, Arguments, true)
      |   ^
../../third_party/blink/renderer/platform/wtf/std_lib_extras.h:45:26: note: expanded from macro 'DEFINE_STATIC_LOCAL_IMPL'
   45 |       [&]() { return new WTF::StaticSingleton<Type>::WrapperType Arguments; }, \
      |                          ^
../../third_party/blink/renderer/platform/fonts/script_run_iterator_test.cc:273:29: note: default constructor of 'MockScriptData' is implicitly deleted because field 'kTable' of const-qualified type 'const std::array<int, 16>' would not be initialized
  273 |   const std::array<int, 16> kTable;
      |                             ^
```

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter changed `static const int kTable[16];` to `const std::array<int, 16> kTable;`. Because `kTable` is a member, it must be initialized in the constructor. However the rewriter did not generate a constructor, so the default constructor is implicitly defined and deleted, which doesn't initialize the member.

## Solution
The rewriter should add a constructor with a member initialization list that initializes `kTable`. Because it is a `const` field, it must be initialized this way, or default initialized.

```diff
--- a/third_party/blink/renderer/platform/fonts/script_run_iterator_test.cc
+++ b/third_party/blink/renderer/platform/fonts/script_run_iterator_test.cc
@@ -268,7 +270,10 @@ class MockScriptData : public ScriptData {
   static const int kListShift = 2;
   static const int kListMask = 0x3;
   static const int kBracketDelta = kCodeBracketCloseBit;
-  static const int kTable[16];
+  MockScriptData() : kTable{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0} {}
+
+ private:
+  const std::array<int, 16> kTable;
 

```

## Note
There are many extra errors.

-   The out of line definition is no longer valid. The rewriter should have removed this definition.
-   The identifiers `kLatin` etc are not valid. The rewriter should have included these constants.