```
# Build Failure Analysis: 2025_03_15_patch_1940

## First error

../../gpu/command_buffer/service/context_state.cc:509:31: error: no matching member function for call to 'GetValues'
  509 |         attrib_values[attrib].GetValues(v);
      |         ~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~
../../gpu/command_buffer/service/context_state.h:164:8: note: candidate template ignored: could not match 'base::span<T>' against 'GLfloat *' (aka 'float *')
  164 |   void GetValues(base::span<T> values) const;
      |        ^

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter converted the `GetValues` function to take a `base::span` as an argument. However, the call sites within `context_state.cc` were not updated to pass a `base::span`. This resulted in a type mismatch between the expected `base::span` and the provided `GLfloat*`, `GLint*`, and `GLuint*` pointers. The error message "no matching member function for call to 'GetValues'" indicates that the compiler could not find a suitable overload of `GetValues` that accepts a raw pointer.

## Solution
The call sites of `Vec4::GetValues` in `context_state.cc` need to be updated to pass a `base::span` instead of raw pointers. This can be achieved by constructing a `base::span` from the existing pointer and size information. Since we know the size is always 4, we can use a stack array and create a span from that.

Here's the suggested change:

```diff
--- a/gpu/command_buffer/service/context_state.cc
+++ b/gpu/command_buffer/service/context_state.cc
@@ -133,7 +133,7 @@ bool Vec4::Equal(const Vec4& other) const {
 }
 
 template <>
-void Vec4::GetValues<GLfloat>(GLfloat* values) const {
+void Vec4::GetValues<GLfloat>(base::span<GLfloat> values) const {
   DCHECK(!values.empty());
   switch (type_) {
     case SHADER_VARIABLE_FLOAT:
@@ -154,7 +154,7 @@ void Vec4::GetValues<GLfloat>(GLfloat* values) const {
 }
 
 template <>
-void Vec4::GetValues<GLint>(GLint* values) const {
+void Vec4::GetValues<GLint>(base::span<GLint> values) const {
   DCHECK(!values.empty());
   switch (type_) {
     case SHADER_VARIABLE_FLOAT:
@@ -175,7 +175,7 @@ void Vec4::GetValues<GLint>(GLint* values) const {
 }
 
 template <>
-void Vec4::GetValues<GLuint>(GLuint* values) const {
+void Vec4::GetValues<GLuint>(base::span<GLuint> values) const {
   DCHECK(!values.empty());
   switch (type_) {

```

And:

```diff
--- a/gpu/command_buffer/service/context_state.cc
+++ b/gpu/command_buffer/service/context_state.cc
@@ -506,9 +506,9 @@ void ContextState::SetUniform(const Uniform& uniform) {
   if (uniform.size == 1) {
     switch (uniform.type) {
       case GL_FLOAT_VEC4: {
-        GLfloat v[4];
+        std::array<GLfloat, 4> v;
         uniform.value.GetValues(v);
-        program_->SetUniform4f(uniform.location, v[0], v[1], v[2], v[3]);
+        program_->SetUniform4f(uniform.location, v[0], v[1], v[2], v[3]);
         break;
       }
       case GL_INT_VEC4: {
```

## Note
The rewriter spanified the function definition in the header file, but failed to spanify the call sites in the cc file.