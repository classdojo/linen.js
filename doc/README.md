Think of schemas as encapsulated applications with commands such as persistence, mapping, and validation, which is attached to a model locator, which is the model. the schema itself is the application initializer.

## Parts:

- `definition` - maps a property to a part of the model - it also contains the decorators that
handle the field given the field options. For example, a field might have validation, persistence, or it might be virtual.
   - `decor` - created out of the options specified in the definition

- `Model` - this is is where all data is stored - which is controlled by the commands registered within each definition
