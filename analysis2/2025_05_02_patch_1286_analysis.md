# Build Failure Analysis: 2025_05_02_patch_1286

## First error

../../remoting/test/frame_generator_util.cc:68:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified a variable `data` but left a reinterpret_cast that is applied to it. `reinterpret_cast` to a span is not allowed.

## Solution
The rewriter needs to be able to remove the reinterpret_cast if it has rewritten the variable that is being casted.

## Note