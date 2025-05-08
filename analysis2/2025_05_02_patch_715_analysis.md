# Build Failure Analysis: 2025_05_02_patch_715

## First error

../../components/zucchini/disassembler_dex.cc:270:17: error: no matching function for call to 'begin'
  270 |       std::fill(std::begin(instruction_table.data()),
      |                 ^~~~~~~~~~
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::fill.

## Reason
`std::fill` takes in two iterators as argument. The rewriter converted a C style array to a `std::array`. `std::begin` and `std::end` cannot be used on a `std::array::data()` which returns a raw pointer. `std::begin` and `std::end` are ADL-discovered names, therefore they need to work with `std::array`.

## Solution
The rewriter needs to recognize this pattern, and just pass in the `instruction_table.data()` as is since `std::array::data()` is a raw pointer.
```
-      std::fill(std::begin(instruction_table.data()),
-                std::end(instruction_table.data()), nullptr);
+      std::fill(instruction_table.data(),
+                instruction_table.data() + instruction_table.size(), nullptr);
```

## Note
The code also has a second error:
`../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'`

This is related to the rewriter not casting argument to base::span::subspan() to an unsigned value.
```
base::span<const dex::Instruction*>(instruction_table)
                      .subspan(instr.opcode)
```
The rewriter needs to cast `instr.opcode` to `size_t`.
```
base::span<const dex::Instruction*>(instruction_table)
                      .subspan(static_cast<size_t>(instr.opcode))