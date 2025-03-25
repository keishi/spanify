# Build Failure Analysis: 2025_03_19_patch_814

## First error
```
../../components/zucchini/disassembler_dex.cc:268:17: error: no matching function for call to 'begin'
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::fill.

## Reason
`instruction_table` was changed from a C-style array to `std::array`. In the original code, `instruction_table` decayed into a pointer which is why `std::fill(instruction_table ...)` compiled. With `std::array`, `instruction_table` no longer decays into a pointer. `std::fill` requires a pointer so we need to call `instruction_table.data()` to decay it into a pointer.

## Solution
The rewriter needs to be updated to decay the std::array variable into a pointer by calling `.data()` on it.

```
       std::fill(std::begin(instruction_table.data()),
                 std::end(instruction_table.data()), nullptr);
```
## Note
There is another error about `base::numerics::safe_conversions::strict_cast`. This is likely because `instr.opcode` and `instr.variant` are `int` while `subspan` requires `size_t`. Rewriter needs to cast argument to base::span::subspan() to an unsigned value.