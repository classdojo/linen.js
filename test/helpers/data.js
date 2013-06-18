module.exports = {
  "people": [
    {
      _id: "craig",
      first_name: "craig",
      last_name: "condon",
      location: "sf",
      friends: ["sam", "tim", "liam", "frank", "mitch"]
    },
    {
      _id: "sam", 
      first_name: "Sam",
      last_name: "C",
      location: "pa",
      friends: ["craig", "liam", "frank"]
    },
    {
      _id: "tim", 
      first_name: "Sam",
      last_name: "C",
      location: "stpl",
      friends: ["mitch", "craig"]
    },
    {
      _id: "mitch",
      first_name: "Mitch",
      last_name: "C",
      location: "stpl",
      friends: ["tim", "craig"]
    },
    {
      _id: "liam", 
      first_name: "Sam",
      last_name: "C",
      location: "sf",
      friends: ["craig", "sam", "frank"]
    },
    {
      _id: "frank", 
      first_name: "Frank",
      last_name: "C",
      location: "sf",
      friends: ["craig", "liam", "sam"]
    }
  ],
  "locations": [
    {
      "_id": "sf",
      "name": "San Francisco",
      "state": "CA",
      "zip": 94102
    },
    {
      "_id": "stpl",
      "name": "Minneapolis",
      "state": "MN",
      "zip": 55124
    },
    {
      "_id": "pa",
      "name": "Palo Alto",
      "state": "CA",
      "zip": 99999
    }
  ]
}