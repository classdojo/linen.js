
var expect = require("expect.js"),
api = require("./helpers/api"),
async = require("async"),
outcome = require("outcome");

describe("linen", function() {

  var items = {};


  it("can create the route mappings", function() {

    items.craig = api.collection("people").item("craig");

    items.people = api.collection("people");
    items.craigsFriends = items.craig.get("friends");
    //items.tim = api.collection("people").findOne({ first_name: "tim" })
    //items.timsFriends = items.tim.friends;
  });


  it("can fetch all the people", function(next) {
    items.people.fetch(function() {
      expect(items.people.at(1).get("first_name")).to.be("Sam");
      next();
    })
  });

  it("can fetch craig", function(next) {
    items.craig.fetch(function() {
      expect(items.craig.get("first_name")).to.be("craig");
      expect(items.craig.get("last_name")).to.be("condon");
      next();
    });
  });

  //even when friends is present, linen collections should remove the references
  //until they're FULLY loaded.
  it("craig's friends collection is empty", function() {
    expect(items.craigsFriends.length()).to.be(0);
  });



  it("can fetch craig's friends", function(next) {
    items.craigsFriends.fetch(function() {
      items.craigsFriends.last().get("location").fetch(function() {
        expect(items.craigsFriends.last().get("location.name")).to.be("Palo Alto");
        next();
      });
    });
  });


  it("can fetch craig's first friend's friends", function(next) {
    items.craigsFriends.last().get("friends").fetch(function() {
      var craigsFirstFriendsFriend = items.craigsFriends.last().get("friends").first();
      expect(craigsFirstFriendsFriend.get("first_name")).to.be("Frank");
      expect(craigsFirstFriendsFriend.get("last_name")).to.be("C");
      next();
    });
  });


  it("can find craig's frist friend's friend's friends", function(next) {

    //bind should ONLY be called once 

    var i = 0;
    var binding = items.craigsFriends.last().get("friends").first().get("friends").bind();
    binding.to(function(command, item) {
      expect(item.get("first_name")).not.to.be(undefined);
      if(i++ > 1) {
        next();
      }
    });
  });


  it("cannot fetch friend without an idea", function(next) {
    var err;
    var jake = items.craigsFriends.item({name:"jake"});
    jake.fetch(function(err) {
      expect(err).not.to.be(undefined);
      next()
    });

  });

  it("cannot save an invalid user", function(next) {
    items.people.item({first_name:"craig"}).save(function(err) {
      expect(err).not.to.be(undefined);
      expect(err.message).to.contain("must be present");
      next();
    });
  })

  //test to make sure an error can be handled
  it("cannot save user that already exists", function(next) {
    items.peopleCount = items.people.length();
    items.people.item({first_name:"craig", last_name: "condon"}).save(function(err) {
      expect(err).not.to.be(undefined)
      expect(err.message).to.contain("user already exists");
      next();
    });
  });

  //sanity - make sure this number doesn't change
  it("people collection does NOT have a new item", function() {
    expect(items.people.length()).to.be(items.peopleCount);
  });

  it("can successfuly add a new person", function(next) {
    items.kramer = items.people.item({first_name: "Kramer", last_name: "Weydt" }).save(function(err) {
      expect(!!err).to.be(false);
      next();
    });
  });

  it("can find the new friend", function() {
    expect(items.people.indexOf(items.kramer)).not.to.be(-1);
  });

  it("can successfuly add a new friend", function(next) {
    items.craigsFriends.push(items.kramer);
    items.craigsFriends.fetch(function() {
      expect(items.craigsFriends.indexOf(items.kramer)).not.to.be(-1);
      next();
    });
  });



  it("can successfuly remove a friend", function(next) {
    var lastFriend = items.craigsFriends.last(),
    lastFriendFriends = lastFriend.get("friends");

    //need to re-fetch since craigsFriends was reset
    lastFriendFriends.fetch(function() {
      var count = lastFriendFriends.length();
      var removedFriend = lastFriendFriends.shift();
      lastFriendFriends.fetch(function() {
        expect(lastFriendFriends.length()).to.be(count - 1);
        expect(lastFriendFriends.indexOf(removedFriend)).to.be(-1);
        next();
      });
    })
  });

  it("can update a user, but throws an error", function(next) {
    var lastPerson = items.people.last();
    lastPerson.set("last_name", undefined);
    lastPerson.validate(function(error) {
      expect(error).not.to.be(undefined);
      expect(error.message).to.contain("present");
      next();
    });

  });


  it("can successfuly update a user", function(next) {
    
    var lastPerson = items.people.last();
    lastPerson.set("last_name", "blarg");
    lastPerson.save(function() {
      items.people.fetch(function() {
        expect(items.people.at(items.people.indexOf(lastPerson)).get("last_name")).to.be("blarg");
        next();
      })
    });
  });

  it("can successfuly set a new location", function(next) {
    items.craig.set("location", "pa");
    expect(items.craig.get("location._id")).to.be("pa");
    items.craig.save(function() {
      items.people.fetch(function() {
        var craig = items.people.at(items.people.indexOf(items.craig));
        craig.get("location").fetch(function() {
          expect(craig.get("location.name")).to.be("Palo Alto");
          next();
        })
      })
    });
  });


  it("can fetch a person's friends before the person is loaded", function(next) {
    var people = items.people.item("mitch").get("friends").fetch(function() {
      expect(people.length()).not.to.be(0);
      next();
    });
  });


  it("can successfuly move one friend to another friend", function(next) {
    var samFriends = items.people.item("sam").get("friends"),
    mitchFriends = items.people.item("mitch").get("friends"),
    o = outcome.e(next),
    removedFriend;

    function reloadFriends(next) {
      async.forEach([samFriends, mitchFriends], function(friends, next) {
        friends.fetch(next);
      }, next);
    }

    reloadFriends(o.s(function() {
      mitchFriends.push(removedFriend = samFriends.shift());
      reloadFriends(o.s(function() {
        expect(mitchFriends.indexOf(removedFriend)).not.to.be(-1);
        expect(samFriends.indexOf(removedFriend)).to.be(-1);
        next();
      }));
    }));
  });


  it("can create a person from the collection model class", function(next) {
    var Person = items.people.getModelClass();
    var person = new Person({ first_name: "Monica", last_name: "Harvancik" });
    person.save(function() {
      items.people.fetch(function() {
        expect(items.people.indexOf(person)).not.to.be(-1);
        next();
      })
    })
  })


  it("can add a hobby", function(next) {
    items.craig.get("hobbies").item({ name: "cooking"}).save(function() {
      next();
    })
  });

  it("can remove a person from the model", function(next) {
    items.kramer.remove(next);
  });

  it("kramer doesn't exist in the people's collection", function() {
    expect(items.people.indexOf(items.kramer)).to.be(-1);
  });

  return;

  it("has hobbies", function() {

  });

  it("can update a hobby", function() {

  });

  it("can delete a hobby", function() {
    
  })



});