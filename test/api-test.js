var schemas = require("./helpers/schemas"),
expect      = require("expect.js"),
outcome = require("outcome"),
async = require("async");


describe("linen", function() {
  
  var items = {};


  it("can create the route mappings", function() {
    items.craig         = schemas.model("person", "craig");
    items.people        = schemas.model("all").get("people");
    items.craigsFriends = items.craig.get("friends");
  });

  it("can fetch all the people", function(next) {
    items.people.fetch(function(err) {
      expect(items.people.at(1).get("first_name")).to.be("Sam");
      next();
    })
  });

  it("can fetch craig", function(next) {
    items.craig.fetch(function(err) {
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
      expect(craigsFirstFriendsFriend.get("first_name")).to.be("Sam");
      expect(craigsFirstFriendsFriend.get("last_name")).to.be("C");
      next();
    });
  });


  /*it("can find craig's frist friend's friend's friends", function(next) {

    //bind should ONLY be called once 

    var i = 0;
    var binding = items.craigsFriends.last().get("friends").first().bind();

    binding.to(function(command, item) {
      expect(item.get("first_name")).not.to.be(undefined);
      if(i++ > 1) {
        next();
      }
    });
  });*/

  it("cannot fetch friend without an _id", function(next) {
    var err;
    var jake = items.craigsFriends.model({name:"jake"});
    jake.fetch(function(err) {
      expect(err).not.to.be(undefined);
      next()
    });

  });

  it("cannot save an invalid user", function(next) {
    items.people.model({first_name:"craig"}).save(function(err) {
      expect(err).not.to.be(undefined);
      expect(err.message).to.contain("is invalid");
      next();
    });
  });


  //test to make sure an error can be handled
  it("cannot save user that already exists", function(next) {
    items.peopleCount = items.people.length();
    items.people.model({first_name:"craig", last_name: "condon"}).save(function(err) {
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
    items.kramer = items.people.model({first_name: "Kramer", last_name: "Weydt" });

    items.kramer.save(function(err) {
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


  it("can fetch a person's friends before the person is loaded", function(next) {
    var people = items.people.model("mitch").get("friends").fetch(function() {
      expect(people.length()).not.to.be(0);
      next();
    });
  });


  it("can successfuly move one friend to another friend", function(next) {
    var samFriends = items.people.model("sam").get("friends"),
    mitchFriends = items.people.model("mitch").get("friends"),
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

  it("can add a hobby", function(next) {
    items.craig.get("hobbies").model({ name: "cooking" }).save(function() {
      next();
    })
  });

  var peopleCount = 0;

  it("can remove a person from the model", function(next) {
    peopleCount = items.people.length()
    items.kramer.remove(next);
  });


  it("kramer doesn't exist in the people's collection", function() {
    expect(items.people.indexOf(items.kramer)).to.be(-1);
    expect(items.people.length()).to.be(peopleCount - 1)
  });


});