# Build Failure Analysis: 2025_05_02_patch_299

## First error

```
../../mojo/public/cpp/bindings/lib/array_internal.h:525:55: error: no viable conversion from 'const StorageType *' (aka 'const blink::mojom::internal::PolicyValue_Data *') to 'base::span<const ElementType>' (aka 'span<const blink::mojom::internal::PolicyValue_Data>')
  525 |     return Helper::ValidateElements(&object->header_, object->storage(),
      |                                                       ^~~~~~~~~~~~~~~~~
```

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `ArraySerializationHelper::ValidateElements` was spanified. The `elements` argument is now `base::span<const ElementType>`. However, the code is passing `object->storage()`, which returns a raw pointer (`const ElementType*`). The rewriter failed to recognize that `object->storage()` provides a raw pointer without size information that is being passed into a spanified function.

## Solution
The rewriter needs to be able to recognize a raw pointer being passed to a spanified function, where the size is not available, and insert the necessary code to create a span from the raw pointer. In this case, the size of the array is available in `header->num_elements`. The rewriter should generate code like:
```c++
base::span<const ElementType>(object->storage(), header->num_elements)
```
## Note
The generated code would look like this:

```diff
--- a/mojo/public/cpp/bindings/lib/array_internal.h
+++ b/mojo/public/cpp/bindings/lib/array_internal.h
@@ -444,7 +446,7 @@ struct ArraySerializationHelper<U, true, false> {
   using ElementType = typename ArrayDataTraits<U>::StorageType;
 
   static bool ValidateElements(const ArrayHeader* header,
-                               const ElementType* elements,
+                               base::span<const ElementType> elements,
                                ValidationContext* validation_context,
                                const ContainerValidateParams* validate_params) {
     for (uint32_t i = 0; i < header->num_elements; ++i) {
@@ -522,7 +524,7 @@ struct ArraySerializationHelper<U, false, false> {
 
   static bool ValidateElements(const ArrayHeader* header,
                                const ElementType* elements,
-                               ValidationContext* validation_context,
+                               base::span<const ElementType> elements,
                                const ContainerValidateParams* validate_params) {
     for (uint32_t i = 0; i < header->num_elements; ++i) {
       if (!ArrayDataTraits<U>::Validate(
```
The corrected code would look like this:

```diff
--- a/mojo/public/cpp/bindings/lib/array_internal.h
+++ b/mojo/public/cpp/bindings/lib/array_internal.h
@@ -444,7 +446,7 @@ struct ArraySerializationHelper<U, true, false> {
   using ElementType = typename ArrayDataTraits<U>::StorageType;
 
   static bool ValidateElements(const ArrayHeader* header,
-                               const ElementType* elements,
+                               base::span<const ElementType> elements,
                                ValidationContext* validation_context,
                                const ContainerValidateParams* validate_params) {
     for (uint32_t i = 0; i < header->num_elements; ++i) {
@@ -522,7 +524,7 @@ struct ArraySerializationHelper<U, false, false> {
 
   static bool ValidateElements(const ArrayHeader* header,
                                const ElementType* elements,
-                               ValidationContext* validation_context,
+                               base::span<const ElementType> elements,
                                const ContainerValidateParams* validate_params) {
     for (uint32_t i = 0; i < header->num_elements; ++i) {
       if (!ArrayDataTraits<U>::Validate(