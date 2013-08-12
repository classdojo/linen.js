Linen attempts to abstract complex service interactions from client, and server applications. The idea behind linen is to treat `schemas` like miniature applications, where a `model` that's based off a schema closely resembles a `model locator` - a common singleton pattern in MVC. Fields can be thought of like `commands` - where requesting a particular field executes code which receives data from a remote transport, or any other method, and sets the field property on the `model`. There are a few parts to consider when writing code in `linen`.


## Nuts & Bolts

### Schemas

Schemas make up fields, and field controllers - this is the glue that brings everything together.

### Fields

Fields contain information about how to handle a `model property`. 

### Field Controllers

Field Controllers interpret the options provided in each field, and attach decorators to each field to handle the given options. Field controllers include `validators`, `data mappers`, and `transporters`. You can also create your own field controller to create custom behaviors. 

### Models

Contains the data mapped by each field controller - it might also contain methods mixed in by each field controller, such as `validate`, `save`, and `load`.

## Use Cases

## Transport Ideas

- REST + pubnub / firebase
- Mongodb

## Edges

- saving collections / arrays to the database
- loading referenced collections