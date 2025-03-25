# Build Failure Analysis: 2025_03_19_patch_1601

## First error

../../media/cdm/library_cdm/clear_key_cdm/cdm_file_adapter.h:60:43: error: non-virtual member function marked 'override' hides virtual member function

## Category
Pointer passed into spanified function parameter.

## Reason
The function `CdmFileAdapter::OnReadComplete` is overriding a virtual function in the base class `cdm::FileIOClient`. However, the signature of the function in the base class uses a raw pointer (`const uint8_t* data`), while the overriding function in `CdmFileAdapter` uses `base::span<const uint8_t>`.

The compiler treats this as hiding the virtual function rather than overriding it. Therefore, when an object of `CdmFileAdapter` is used polymorphically through a pointer or reference to `cdm::FileIOClient`, the `OnReadComplete` method in `CdmFileAdapter` is not called. Because `CdmFileAdapter` does not actually implement `cdm::FileIOClient::OnReadComplete` because of the signature difference it is considered an abstract class and cannot be instantiated.

## Solution
The rewriter needs to update the call sites of `OnReadComplete` to pass a span rather than a raw pointer.

```c++
diff --git a/media/cdm/library_cdm/clear_key_cdm/clear_key_cdm_bin.cc b/media/cdm/library_cdm/clear_key_cdm/clear_key_cdm_bin.cc
index old..new 100644
--- a/media/cdm/library_cdm/clear_key_cdm/clear_key_cdm_bin.cc
+++ b/media/cdm/library_cdm/clear_key_cdm/clear_key_cdm_bin.cc
@@ -123,7 +123,7 @@
     return;
 
   file_io_client_->OnReadComplete(
-      status, reinterpret_cast<const uint8_t*>(buffer_.get()), size);
+      status, base::span<const uint8_t>(reinterpret_cast<const uint8_t*>(buffer_.get()), size), size);
 }
 ```

## Note
There are other errors in the log related to allocating an object of an abstract class. These errors are a direct result of the first error, and will likely be fixed when that is fixed.