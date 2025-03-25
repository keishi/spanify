# Build Failure Analysis: 2025_03_19_patch_832

## First error

../../components/trusted_vault/test/fake_security_domains_server.cc:74:45: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   74 |       kSecurityDomainMemberNamePrefix.data().subspan(encoded_public_key)) {
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
`kSecurityDomainMemberNamePrefix` was converted to `std::array` and `.data()` was added, but the rewriter failed to apply `.subspan()` rewrite to a spanified return value. Thus the generated code was `kSecurityDomainMemberNamePrefix.data().subspan(encoded_public_key)` instead of `kSecurityDomainMemberNamePrefix.data().subspan(encoded_public_key.size())`.

## Solution
The rewriter needs to add .size() when using subspan on an arrayified return value.

## Note
There are additional errors like this one:
../../components/trusted_vault/test/fake_security_domains_server.cc:442:45: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  442 |       kSecurityDomainMemberNamePrefix.data().subspan(encoded_public_key));
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~