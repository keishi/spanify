# Build Failure Analysis: 2025_03_19_patch_1366

## First error

../../media/mojo/services/media_metrics_provider.cc:117:51: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code is calling `.subspan()` on the return value of `.data()`, but the rewriter is not correctly handling this case. The rewriter converted `kPipelineUmaPrefix` to `std::array` and is calling `.data()` on it. The rewriter should have realized that `kPipelineUmaPrefix.data()` is now a span and needs to have the subspan rewrite applied to the spanified return value.

## Solution
The rewriter needs to apply the subspan rewrite on the return value of `.data()`. The rewriter needs to be able to handle nested member calls and correctly insert the `.data()` and `.subspan()` calls.
In this particular case, the correct fix should be:

```c++
  std::string uma_name = base::span(kPipelineUmaPrefix.data()).subspan(
      GetCodecNameForUMA(player_info.video_codec) + ".");
```

## Note
There are no other errors in the provided log snippet.