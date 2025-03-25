# Build Failure Analysis: 2025_03_19_patch_1263

## First error

../../components/url_formatter/spoof_checks/idn_spoof_checker.cc:610:27: error: no matching constructor for initialization of 'TopDomainPreloadDecoder'

## Category
Rewriter needs to convert C-style pointer to span in inherited constructor.

## Reason
The base class constructor `PreloadDecoder` was updated to accept a `base::span` argument, but the derived class `TopDomainPreloadDecoder`'s constructor call was not updated to construct a span from the raw pointer. The compiler is unable to find a matching constructor to initialize the `TopDomainPreloadDecoder` object.

## Solution
The rewriter should update the derived class constructor to explicitly construct a `base::span` when calling the base class constructor.

Example:
```c++
TopDomainPreloadDecoder(const uint8_t* tree,
                                               size_t tree_bytes)
    : PreloadDecoder(base::span<const uint8_t>(tree, tree_bytes),
```

## Note
The error happens in inherited constructor.