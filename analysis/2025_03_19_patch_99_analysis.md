```
# Build Failure Analysis: 2025_03_19_patch_99

## First error

../../chrome/browser/history/history_utils.cc:24:20: error: no viable conversion from 'const std::array<char, 12>' to 'std::string_view' (aka 'basic_string_view<char>')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The code uses `content::kViewSourceScheme` which was arrayified. The `url.SchemeIs()` method requires a `std::string_view` argument. However the rewriter failed to add `.data()` to `content::kViewSourceScheme` when creating a `subspan`.

## Solution
The rewriter should add `.data()` to arrayified variables that are used with `subspan()` when calling functions expecting `std::string_view` parameters.

```diff
diff --git a/chrome/browser/chrome_navigation_browsertest.cc b/chrome/browser/chrome_navigation_browsertest.cc
index 5ef93e05ad410..d2cdfda97cfd6 100644
--- a/chrome/browser/chrome_navigation_browsertest.cc
+++ b/chrome/browser/chrome_navigation_browsertest.cc
@@ -168,8 +168,8 @@ IN_PROC_BROWSER_TEST_F(ChromeNavigationBrowserTest, TestViewFrameSource) {
   ASSERT_NE(new_web_contents, web_contents);
   EXPECT_TRUE(WaitForLoadStop(new_web_contents));
 
-  GURL view_frame_source_url(content::kViewSourceScheme + std::string(":") +
-                             iframe_target_url.spec());
+  GURL view_frame_source_url(content::kViewSourceScheme.data().subspan(
+      std::string(":") + iframe_target_url.spec()));
   EXPECT_EQ(url_formatter::FormatUrl(view_frame_source_url),
             new_web_contents->GetTitle());
 }
```

## Note
Rewriter failed to apply subspan rewrite to a spanified return value and Rewriter failed to add .data() to a spanified return value. are related, so the category needs to be updated.