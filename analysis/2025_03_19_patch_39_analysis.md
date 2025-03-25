# Build Failure Analysis: 2025_03_19_patch_39

## First error

../../chrome/browser/extensions/api/declarative_content/declarative_content_apitest.cc:179:63: error: expected '}'
  179 |   ExtensionTestMessageListener ready_incognito("ready (split)");
      |                                                               ^
../../chrome/browser/extensions/api/declarative_content/declarative_content_apitest.cc:87:53: note: to match this '{'
   87 | constexpr std::array<char, 1765> kBackgroundHelpers {R"(var PageStateMatcher = chrome.declarativeContent.PageStateMatcher;
      |                                                     ^

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter generated overlapping replacements due to the array being rewritten to std::array and the closing brace also being rewritten.

The change converts:
```
constexpr char kBackgroundHelpers[] = R"(var PageStateMatcher = chrome.declarativeContent.PageStateMatcher;
        var ShowAction = chrome.declarativeContent.ShowAction;
```
to
```
constexpr std::array<char, 1765> kBackgroundHelpers {R"(var PageStateMatcher = chrome.declarativeContent.PageStateMatcher;
        var ShowAction = chrome.declarativeContent.ShowAction;
```

and the error message indicates that the rewriter is attempting to rewrite the closing } of the array.

## Solution
The rewriter needs to avoid generating overlapping replacements when arrayifying variables.  Specifically, it should not attempt to rewrite anything outside the bounds of the original array declaration, particularly the initializer list's closing brace.

## Note
Many other errors are present due to the first error.