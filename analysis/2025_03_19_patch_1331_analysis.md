# Build Failure Analysis: 1426_03_19_patch_1331

## First error

../../media/renderers/paint_canvas_video_renderer.cc:1189:50: error: expected expression
 1189 |         flip_y ? out.subspan(output_row_bytes * () height - i - 1)

## Category
Rewriter needs to add parenthesis around arithmetic expression used in subspan.

## Reason
The rewriter spanified `out`, but failed to preserve correct parenthesis for subspan's offset calculation. The expression `output_row_bytes * () height - i - 1` is invalid, because of the extra parenthesis.

## Solution
The rewriter needs to change:

```c++
        flip_y ? out.subspan(output_row_bytes * () height - i - 1)
               : out.subspan(output_row_bytes * i);
```

to:

```c++
        flip_y ? out.subspan(output_row_bytes * (height - i - 1))
               : out.subspan(output_row_bytes * i);
```

## Note
Additional errors include failure to remove `reinterpret_cast`, failed to handle span increment, and a conversion issue at function call.

The rewriter needs to avoid using reinterpret_cast on spanified variable.

The rewriter failed to add conversion for single variable span, but not its increment. Rewriter failed to handle cast of single variable span.

The function that this argument is being passed to was spanified, but this call site is not adjusted yet.