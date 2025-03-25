# Build Failure Analysis: 2025_03_19_patch_1372
## First error

../../media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc:48:11: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
   48 |          {VAConfigAttribRTFormat, VA_RT_FORMAT_YUV420},
      |           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      |           {                                          }

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter converted a C-style array to `std::array`, but it is a member field. The rewriter suggested braces around the initialization of the subobject.

## Solution
The rewriter should initialize the member field to `{}`. In this case:

```diff
--- a/media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc
+++ b/media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc
@@ -36,7 +38,7 @@ struct Capability {
   VAProfile profile;
   VAEntrypoint entry_point;
   int num_attribs;
-  VAConfigAttrib attrib_list[MAX_CAPABILITY_ATTRIBUTES];
+  std::array<VAConfigAttrib, MAX_CAPABILITY_ATTRIBUTES> attrib_list{};
 };
 const struct Capability kCapabilities[] = {
     {VAProfileH264ConstrainedBaseline,

```

## Note
The other errors are similar to this one.
Also, there is an error that says `excess elements in struct initializer`. This is because the struct initializer has excess elements, since the struct has fewer members than were initialized. The solution is to remove the last element. The specific instance of this error is:

```
../../media/gpu/vaapi/test/fake_libva_driver/fake_drv_video.cc:79:10: error: excess elements in struct initializer
   79 |          {VAConfigAttribRateControl, VA_RC_CQP | VA_RC_CBR},
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~