# Build Failure Analysis: 2025_03_19_patch_1426

## First error

../../components/media_router/common/providers/cast/certificate/net_trust_store.cc:86:42: error: reinterpret_cast from 'const std::string' (aka 'const basic_string<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified the variable `data_ptr`, but left a reinterpret_cast that is applied to it.

## Solution
Rewriter needs to be able to remove the reinterpret_cast if it's casting to a spanified variable.

## Note
The second error is a conflict between ".data()" and ".subspan()" replacements which is a common problem we have seen.