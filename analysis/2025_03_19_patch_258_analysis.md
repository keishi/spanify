# Build Failure Analysis: 2025_03_19_patch_258

## First error

../../services/screen_ai/proto/main_content_extractor_proto_convertor_unittest.cc:343:18: error: member reference base type 'NodeTemplate[10]' is not a structure or union
  343 |       (input_tree.size() * sizeof(decltype(input_tree)::value_type)) /
      |        ~~~~~~~~~~^~~~~

## Category
Rewriter cannot get the size of forward declared array variable.

## Reason
The rewriter converted `sizeof(input_tree) / sizeof(NodeTemplate)` to `(input_tree.size() * sizeof(decltype(input_tree)::value_type)) / sizeof(NodeTemplate)`. However, `input_tree` is a C-style array, not a class or struct, so it does not have a `.size()` method.

## Solution
The rewriter should avoid converting `sizeof(input_tree) / sizeof(NodeTemplate)` to use `.size()` for C-style arrays.

## Note
The secondary error also indicates a problem related to the same root cause:
```
../../services/screen_ai/proto/main_content_extractor_proto_convertor_unittest.cc:343:35: error: 'decltype(input_tree)' (aka '(anonymous namespace)::NodeTemplate[10]') is not a class, namespace, or enumeration
  343 |       (input_tree.size() * sizeof(decltype(input_tree)::value_type)) /
      |                                   ^