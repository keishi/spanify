```
# Build Failure Analysis: 2025_05_02_patch_61

## First error

```
../../components/url_formatter/spoof_checks/idn_spoof_checker.cc:594:27: error: no matching constructor for initialization of 'TopDomainPreloadDecoder'
  594 |   TopDomainPreloadDecoder preload_decoder(
      |                           ^
  595 |       g_trie_params.huffman_tree, g_trie_params.huffman_tree_size,
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  596 |       g_trie_params.trie, g_trie_params.trie_bits,
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  597 |       g_trie_params.trie_root_position);
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The constructor for `TopDomainPreloadDecoder` inherits the constructors of `PreloadDecoder`. `PreloadDecoder`'s constructor was changed to take `base::span<const uint8_t>` for `huffman_tree`. However, `idn_spoof_checker.cc` is passing raw pointers (`g_trie_params.huffman_tree`) and sizes (`g_trie_params.huffman_tree_size`) directly. The compiler cannot find a matching constructor because there is no implicit conversion from raw `uint8_t*` to `base::span<const uint8_t>`.

## Solution
The rewriter spanified a function but didn't spanify all call sites. The rewriter needs to be updated to rewrite the call site to construct a `base::span` from the raw pointer and size.

The code should be changed to:

```c++
  TopDomainPreloadDecoder preload_decoder(
      base::span<const uint8_t>(g_trie_params.huffman_tree, g_trie_params.huffman_tree_size),
      g_trie_params.trie, g_trie_params.trie_bits,
      g_trie_params.trie_root_position);
```
The rewriter needs to do this automatically.