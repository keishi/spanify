```
# Build Failure Analysis: 2025_05_02_patch_1423

## First error

```
no viable conversion from 'AttribInfo[]' (aka 'gpu::gles2::TestHelper::AttribInfo[]') to 'base::span<AttribInfo>' (aka 'span<gpu::gles2::TestHelper::AttribInfo>')
  291 |     SetupShaderExpectations(kAttribs, kNumAttribs, kUniforms, kNumUniforms,
      |                             ^~~~~~~~
```

## Category
Rewriter needs to properly convert C-style array to std::array.

## Reason
The rewriter changed the `SetupShaderExpectations` function to take a `base::span<AttribInfo>` as an argument. The original code was passing a C-style array `kAttribs` to this function. The rewriter failed to properly convert the `kAttribs` to a `std::array` in a way that is compatible with the new `base::span<AttribInfo>` parameter.

The later errors reveal that the conversion to `std::to_array` also made the `kAttribs` variable a local variable, thus losing access to class members.

## Solution
The correct solution is to replace

```c++
-ProgramManagerWithShaderTest::AttribInfo
-    ProgramManagerWithShaderTest::kAttribs[] = {
-        {
-            kAttrib1Name, kAttrib1Size, kAttrib1Type, kAttrib1Location,
-        },
-        {
-            kAttrib2Name, kAttrib2Size, kAttrib2Type, kAttrib2Location,
-        },
-        {
-            kAttrib3Name, kAttrib3Size, kAttrib3Type, kAttrib3Location,
-        },
-        {
-            kAttrib4Name, kAttrib4Size, kAttrib4Type, kAttrib4Location,
-        },
-};
+auto kAttribs = std::to_array<ProgramManagerWithShaderTest::AttribInfo>({
+    {
+        kAttrib1Name,
+        kAttrib1Size,
+        kAttrib1Type,
+        kAttrib1Location,
+    },
+    {
+        kAttrib2Name,
+        kAttrib2Size,
+        kAttrib2Type,
+        kAttrib2Location,
+    },
+    {
+        kAttrib3Name,
+        kAttrib3Size,
+        kAttrib3Type,
+        kAttrib3Location,
+    },
+    {
+        kAttrib4Name,
+        kAttrib4Size,
+        kAttrib4Type,
+        kAttrib4Location,
+    },
+});
```

with

```c++
 std::array<ProgramManagerWithShaderTest::AttribInfo, 4>
    kAttribs = {
        {
            kAttrib1Name, kAttrib1Size, kAttrib1Type, kAttrib1Location,
        },
        {
            kAttrib2Name, kAttrib2Size, kAttrib2Type, kAttrib2Location,
        },
        {
            kAttrib3Name, kAttrib3Size, kAttrib3Type, kAttrib3Location,
        },
        {
            kAttrib4Name, kAttrib4Size, kAttrib4Type, kAttrib4Location,
        },
};
```

## Note
The rewriter should have also updated all call sites of `SetupShaderExpectations` to pass a `base::span` constructed from the `std::array`. However, that was not done.