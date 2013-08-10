# define the field
field = new Field {
  name: "string",
  address: {

  }
}


# add a validator that takes on a field
validator = new Validator field

# setup a model
m = new Model()

# validate the model 
validator.prepareModel(m).validate () ->


transporter = new Transporter field

m = new Model()

transporter.prepareModel(m).save () ->


