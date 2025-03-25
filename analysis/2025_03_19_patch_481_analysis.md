# Build Failure Analysis: 2025_03_19_patch_481

## First error

../../media/parsers/vp8_parser.cc:748:8: error: use of undeclared identifier 'uv_mode_probs'

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is attempting to call .size() on a variable named `uv_mode_probs`. However, there is no such variable in the current scope. The intended variable seems to be `curr_entropy_hdr_.uv_mode_probs`, a member of `Vp8EntropyHeader`. The rewriter incorrectly assumed this variable was in scope and tried to call `.data()` and `.size()` on it.

## Solution
The rewriter should not be adding `.size()` to unrelated variables. The logic for inserting `.size()` and `.data()` needs to be constrained to the code it spanifies or arrayifies.

## Note
There are additional errors in the log related to the same root cause.
```
../../media/parsers/vp8_parser.cc:748:47: error: use of undeclared identifier 'uv_mode_probs'; did you mean 'Vp8EntropyHeader::uv_mode_probs'?
../../media/parsers/vp8_parser.h:87:40: note: 'Vp8EntropyHeader::uv_mode_probs' declared here
../../media/parsers/vp8_parser.cc:752:11: error: use of undeclared identifier 'uv_mode_probs'
../../media/parsers/vp8_parser.cc:752:50: error: use of undeclared identifier 'uv_mode_probs'; did you mean 'Vp8EntropyHeader::uv_mode_probs'?
../../media/parsers/vp8_parser.h:87:40: note: 'Vp8EntropyHeader::uv_mode_probs' declared here
../../media/parsers/vp8_parser.cc:790:10: error: use of undeclared identifier 'uv_mode_probs'
../../media/parsers/vp8_parser.cc:790:49: error: use of undeclared identifier 'uv_mode_probs'; did you mean 'Vp8EntropyHeader::uv_mode_probs'?
../../media/parsers/vp8_parser.h:87:40: note: 'Vp8EntropyHeader::uv_mode_probs' declared here
../../media/parsers/vp8_parser.cc:795:10: error: use of undeclared identifier 'uv_mode_probs'
../../media/parsers/vp8_parser.cc:795:49: error: use of undeclared identifier 'uv_mode_probs'; did you mean 'Vp8EntropyHeader::uv_mode_probs'?
../../media/parsers/vp8_parser.h:87:40: note: 'Vp8EntropyHeader::uv_mode_probs' declared here
../../media/parsers/vp8_parser.cc:818:17: error: use of undeclared identifier 'uv_mode_probs'
../../media/parsers/vp8_parser.cc:819:33: error: use of undeclared identifier 'uv_mode_probs'; did you mean 'Vp8EntropyHeader::uv_mode_probs'?
../../media/parsers/vp8_parser.h:87:40: note: 'Vp8EntropyHeader::uv_mode_probs' declared here