# Build Failure Analysis: 1609

## First error

../../chrome/browser/policy/messaging_layer/public/report_client_unittest.cc:134:31: error: expected expression
  134 |                .subspan(sizeof)
      |                               ^

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter incorrectly generated both `.data()` and `.subspan()` replacements, resulting in invalid syntax ` .subspan(sizeof).data()`. The compiler expected an expression after `sizeof`.

## Solution
The rewriter should avoid generating overlapping/conflicting replacements. The logic for handling `.data()` and `.subspan()` replacements needs to be reviewed and corrected.

## Note
The conflict occurs in the following line:
```c++
memcpy(base::span<uint8_t>(value_to_sign)
               .subspan(sizeof)
               .data()(Encryptor::PublicKeyId),
           public_value, kKeySize);
```
There is a secondary error:
```
../../chrome/browser/policy/messaging_layer/public/report_client_unittest.cc:135:46: error: expected '(' for function-style cast or type construction
  135 |                .data()(Encryptor::PublicKeyId),
      |                        ~~~~~~~~~~~~~~~~~~~~~~^