```javascript

var linein = require("linein")({
  host: "http://api.site.com/v1/",
  mapResponse: function(response, callback) {
    if(response.result) {
      callback(null, response.result);
    } else {
      callback(response.error);
    }
  }
});


linen.register({
  students: {
    schema: {
      name: "string",
      email: "string"
    }
  },
  classes: {
    schema: {
      students: [{ $ref: "students" }] //classes/:class/students
    }
  },
  teacher: {
    schema: {
      classes: [{ $ref: "classes" }]
    }
  }
});

var teacher = linen.map("teacher").item();


teacher.classes.at(0).students.at(1).name;

```


## API


### linein linein(options)

- `host` - the API host
- `map`  - 

### collection linein.collection(name, schema)

- `name` - the name of the endpoint
- `schema` - the object schema for each item

### model linein.item(name, schema)

creates a connection to a particular item served by the given endpoint.

- `name` - the name of the endpoint
- `schema` - the object schema

### collection.fetch(callback)

Fetches the contents of the current collection

### collection.save(callback)

Saves any unsaved items in the collection

### item collection.at(index)

returns an item in the collection

### item.save(callback)

saves the item. If it's new, it'll send a `POST` request to the server. If it's *not* new, it'll send a `PUT` request.

### item.remove(callback)

removes the item

### item.validate(callback)

validates the object to make sure any unsaved data is correct

