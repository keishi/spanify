```
# Build Failure Analysis: 2025_03_19_patch_990

## First error

../../third_party/blink/renderer/core/xml/parser/xml_document_parser.cc:167:63: error: invalid operands to binary expression ('xmlChar *const' (aka 'unsigned char *const') and 'const base::span<xmlChar>' (aka 'const span<unsigned char>'))
  167 |   size_t ValueLength() const { return static_cast<size_t>(end - value); }

## Category
Rewriter needs to handle pointer arithmetic on spanified member in third_party code.

## Reason
The rewriter converted `xmlSAX2Attributes::value` from `xmlChar*` to `base::span<xmlChar>`. The expression `end - value` is pointer arithmetic, but after the conversion, `value` is a span, and the `-` operator is not defined between a `xmlChar*` and a `base::span<xmlChar>`. This code is inside `third_party/`, and thus not supposed to be spanified.

## Solution
The rewriter needs to avoid converting member variables when the parent struct has been declared in third_party. Specifically, there should be logic to detect that struct xmlSAX2Attributes is third party code and should not be rewritten.

## Note
Multiple other errors are caused by the same root cause. xmlFree is also being called on the `to_attr.value` which has now become a `base::span<xmlChar>`, which is also invalid.

The static asserts related to xmlSAX2Attributes are also failing. This suggests that simply excluding the `ValueLength()` function from spanification is not sufficient. Rather, the struct itself should be excluded to avoid these errors.