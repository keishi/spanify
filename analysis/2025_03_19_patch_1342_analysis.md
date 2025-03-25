# Build Failure Analysis: 2025_03_19_patch_1342

## First error

third_party/blink/renderer/core/xml/xpath_grammar_generated.h:1470:35: error: expected expression
 1470 |     const std::array<signed char, > yystos_;
      |                                   ^

## Category
Rewriter cannot get the size of forward declared array variable.

## Reason
Rewriter arrayified a variable, but couldn't determine the size because it is a forward declaration.

```
third_party/blink/renderer/core/xml/xpath_grammar_generated.h:1470:35: error: expected expression
 1470 |     const std::array<signed char, > yystos_;
      |                                   ^
```

## Solution
Rewriter needs to be able to determine size.

## Note
Several other errors are present as a result of this first error:

```
third_party/blink/renderer/core/xml/xpath_grammar_generated.cc:440:41: error: use of non-static data member 'yystos_' of 'YyParser' from nested type 'by_state'
  440 |       return YY_CAST (symbol_kind_type, yystos_[+state]);
      |                                         ^~~~~~~
third_party/blink/renderer/core/xml/xpath_grammar_generated.h:164:50: note: expanded from macro 'YY_CAST'
  164 | #   define YY_CAST(Type, Val) static_cast<Type> (Val)
      |                                                  ^~~
third_party/blink/renderer/core/xml/xpath_grammar_generated.cc:1878:13: error: non-static data member defined out-of-line
 1878 |   YyParser::yystos_[] =
      |   ~~~~~~~~~~^
In file included from third_party/blink/renderer/core/xml/xpath_grammar_generated.cc:59:
third_party/blink/renderer/core/xml/xpath_grammar_generated.h:1470:37: error: private field 'yystos_' is not used [-Werror,-Wunused-private-field]
 1470 |     const std::array<signed char, > yystos_;