# Build Failure Analysis: 2025_03_14_patch_1042

## First error

../../services/screen_ai/proto/main_content_extractor_proto_convertor_unittest.cc:343:18: error: member reference base type 'NodeTemplate[10]' is not a structure or union
  343 |       (input_tree.size() * sizeof(decltype(input_tree)::value_type)) /
      |        ~~~~~~~~~~^~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the `CreateAXTreeUpdateFromTemplate` function, but the code to calculate the `nodes_count` parameter is now broken.

```c++
  const int nodes_count =
      (input_tree.size() * sizeof(decltype(input_tree)::value_type)) /
      sizeof(NodeTemplate);
```

`input_tree` is a C-style array: `NodeTemplate input_tree[kMaxNodeInTemplate];`. Therefore the expression `input_tree.size()` is invalid since C-style arrays do not have a `.size()` method.  The rewriter should not have spanified `CreateAXTreeUpdateFromTemplate` because the call site cannot be correctly rewritten.

## Solution
The rewriter should avoid rewriting `CreateAXTreeUpdateFromTemplate` function because the `nodes_template` argument is a C-style array, and rewriting the function requires rewriting the caller to pass a span. Since `main_content_extractor_proto_convertor_unittest.cc` is not part of the allowlist, the rewriter should not have spanified `CreateAXTreeUpdateFromTemplate`.

## Note
The second error is:

```
../../services/screen_ai/proto/main_content_extractor_proto_convertor_unittest.cc:343:35: error: 'decltype(input_tree)' (aka '(anonymous namespace)::NodeTemplate[10]') is not a class, namespace, or enumeration
  343 |       (input_tree.size() * sizeof(decltype(input_tree)::value_type)) /
      |                                   ^
```

This is just a follow-up error from the first error.