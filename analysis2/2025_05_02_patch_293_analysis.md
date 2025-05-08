# Build Failure Analysis: 2025_05_02_patch_293

## First error

```
../../mojo/public/cpp/bindings/lib/array_internal.h:533:26: error: no viable conversion from 'StorageType *' (aka 'unsigned char *') to 'base::span<StorageType>' (aka 'span<unsigned char>')
  533 |     return Traits::ToRef(storage(), offset, header_.num_elements);
      |                          ^~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `ArrayDataTraits::ToRef` was modified to take a `base::span<StorageType>` as its first argument. However, the call site in `Array_Data::at` is passing a raw pointer `storage()` which is a `StorageType*`. There is no implicit conversion from a raw pointer to a `base::span`. The rewriter spanified the function, but failed to spanify the call site.

## Solution
The rewriter needs to find all call sites of the function `ArrayDataTraits::ToRef` and convert the raw pointer argument to a `base::span`. This can be done by constructing a `base::span` from the raw pointer and a size. In this case, the size of the array is known, so the rewriter can use that size to construct the `base::span`.

The call site `Traits::ToRef(storage(), offset, header_.num_elements);`
should be rewritten as `Traits::ToRef(base::span(storage(), header_.num_elements), offset, header_.num_elements);`.

## Note
The build log shows a lot of template instantiation errors that originate from this initial error.
```
../../mojo/public/cpp/bindings/lib/array_serialization.h:316:35: note: in instantiation of member function 'mojo::internal::Array_Data<bool>::at' requested here
  316 |       iterator.GetNext() = input->at(i);
      |                                   ^
../../mojo/public/cpp/bindings/lib/map_serialization.h:136:32: note: in instantiation of member function 'mojo::internal::ArraySerializer<mojo::ArrayDataView<bool>, std::vector<bool>, mojo::internal::MapValueReader<base::flat_map<ax::mojom::BoolAttribute, bool>>>::DeserializeElements' requested here
  136 |         !ValueArraySerializer::DeserializeElements(input->values.Get(), &values,
      |                                ^
../../mojo/public/cpp/bindings/lib/serialization_forward.h:71:50: note: in instantiation of member function 'mojo::internal::Serializer<mojo::MapDataView<ax::mojom::BoolAttribute, bool>, base::flat_map<ax::mojom::BoolAttribute, bool>>::Deserialize' requested here
   71 |     return Serializer<MojomType, InputUserType>::Deserialize(
      |                                                  ^
gen/ui/accessibility/mojom/ax_node_data.mojom-shared.h:126:28: note: in instantiation of function template specialization 'mojo::internal::Deserialize<mojo::MapDataView<ax::mojom::BoolAttribute, bool>, mojo::internal::Map_Data<int, bool> *&, base::flat_map<ax::mojom::BoolAttribute, bool>, mojo::Message *&>' requested here
  126 |     return mojo::internal::Deserialize<mojo::MapDataView<::ax::mojom::BoolAttribute, bool>>(
      |                            ^
gen/ui/accessibility/mojom/ax_node_data.mojom.cc:248:29: note: in instantiation of function template specialization 'ax::mojom::AXNodeDataDataView::ReadBoolAttributes<base::flat_map<ax::mojom::BoolAttribute, bool>>' requested here
  248 |       if (success && !input.ReadBoolAttributes(&result->bool_attributes))
      |                             ^