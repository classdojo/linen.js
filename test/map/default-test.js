var linen = require("../../lib"),
expect    = require("expect.js"),
type      = require("type-component");

/*

field: {
  $default: 0
}

*/

describe("map/default#", function() {

  /**
   */

  it("can map many different types of values", function() {

    var m = linen.schema({
      zeroValue: {
        $type: "string",
        $default: 0
      },
      dateValue: {
        $type: "date",
        $default: Date.now
      },
      trueValue: {
        $type: "boolean",
        $default: true
      },
      falseValue: {
        $type: "boolean",
        $default: false
      },
      strValue: {
        type: "string",
        $default: "abba"
      }
    }).model();

    expect(m.get("zeroValue")).to.be(0);
    expect(type(m.get("dateValue"))).to.be("number");
    expect(m.get("trueValue")).to.be(true);
    expect(m.get("falseValue")).to.be(false);
    expect(m.get("strValue")).to.be("abba");
  });

  /**
   */

  it("can map sub default values propertly", function() {
    var m = linen.schema({
      a: {
        b: {
          c: {
            $type: "string",
            $default: "d"
          }
        }
      },
      aa: {
        bb: {}
      }
    }).model();

    expect(m.get("a.b.c")).to.be("d");
    expect(type(m.get("aa"))).to.be("undefined");
    expect(m.get("aa.bb")).to.be(undefined);
  });

  /**
   */

  it("doesn't override a value", function() {
    var m = linen.schema({
      aa: "string",
      a: {
        b: {
          c: {
            $type: "string",
            $default: "d"
          }
        }
      },
      name: {
        $type: "string",
        $default: "abba"
      }
    }).model({ aa: "bb", name: "baab", a:{b:{c:"ccc"}}});

    expect(m.get("aa")).to.be("bb");
    expect(m.get("a.b.c")).to.be("ccc");
    expect(m.get("name")).to.be("baab");
  })
});