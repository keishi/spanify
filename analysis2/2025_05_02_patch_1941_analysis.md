# Build Failure Analysis: 2025_05_02_patch_1941

## First error

../../chrome/browser/devtools/devtools_file_system_indexer.cc:110:19: error: no viable overloaded '='
  110 |     trigram_chars = new TrigramChar[256];
      |     ~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The code attempts to assign the result of `new TrigramChar[256]` to a `base::span<TrigramChar> trigram_chars`. Spans do not own the underlying memory; they are simply views into existing memory.  The rewriter should not have converted `trigram_chars` to a span since it's being assigned memory allocated with `new`. The `trigram_chars` variable should own the memory.

## Solution
The rewriter should not rewrite local variables that are assigned the result of `new`. Instead, recommend using `std::unique_ptr<TrigramChar[]> trigram_chars(new TrigramChar[256]);` or `std::vector<TrigramChar> trigram_chars(256);`

## Note
There is a check `if (trigram_chars.empty())` to check for initialization. If a `std::vector<TrigramChar> trigram_chars(256);` declaration is used this check needs to be changed to `if(trigram_chars.size() == 0)`