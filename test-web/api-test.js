(function() {
    var modules = {}, definitions = {};
    var _require = function(path) {
        if (modules[path]) return modules[path];
        var module = {
            exports: {}
        }, definition = definitions[path];
        if (!definition) {
            try {
                return require(path);
            } catch (e) {}
            throw new Error("unable to load " + path);
        }
        return modules[path] = module.exports = definition(_require, module, module.exports, path);
    };
    var define = function(path, definition) {
        definitions[path] = definition;
    };
    if (typeof global == "undefined") {
        global = window;
    }
    if (typeof window == "undefined") {
        global.window = global;
    }
    if (typeof window.process == "undefined") {
        window.process = {};
    }
    define("linen/test-web/api-test.js", function(require, module, exports, __dirname, __filename) {
        var expect = require("expect.js/expect.js"), api = require("linen/test-web/helpers/api.js"), async = require("async/lib/async.js"), outcome = require("outcome/lib/index.js");
        describe("linen", function() {
            var items = {};
            it("can create the route mappings", function() {
                items.craig = api.collection("people").item("craig");
                items.people = api.collection("people");
                items.craigsFriends = items.craig.get("friends");
            });
            it("can fetch all the people", function(next) {
                items.people.fetch(function() {
                    expect(items.people.at(1).get("first_name")).to.be("Sam");
                    next();
                });
            });
            it("can fetch craig", function(next) {
                items.craig.fetch(function() {
                    expect(items.craig.get("first_name")).to.be("craig");
                    expect(items.craig.get("last_name")).to.be("condon");
                    next();
                });
            });
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
                var i = 0;
                var binding = items.craigsFriends.last().get("friends").first().get("friends").bind();
                binding.to(function(command, item) {
                    expect(item.get("first_name")).not.to.be(undefined);
                    if (i++ > 1) {
                        next();
                    }
                });
            });
            it("cannot fetch friend without an idea", function(next) {
                var err;
                var jake = items.craigsFriends.item({
                    name: "jake"
                });
                jake.fetch(function(err) {
                    expect(err).not.to.be(undefined);
                    next();
                });
            });
            it("cannot save an invalid user", function(next) {
                items.people.item({
                    first_name: "craig"
                }).save(function(err) {
                    expect(err).not.to.be(undefined);
                    expect(err.message).to.contain("must be present");
                    next();
                });
            });
            it("cannot save user that already exists", function(next) {
                items.peopleCount = items.people.length();
                items.people.item({
                    first_name: "craig",
                    last_name: "condon"
                }).save(function(err) {
                    expect(err).not.to.be(undefined);
                    expect(err.message).to.contain("user already exists");
                    next();
                });
            });
            it("people collection does NOT have a new item", function() {
                expect(items.people.length()).to.be(items.peopleCount);
            });
            it("can successfuly add a new person", function(next) {
                items.kramer = items.people.item({
                    first_name: "Kramer",
                    last_name: "Weydt"
                }).save(function(err) {
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
                var lastFriend = items.craigsFriends.last(), lastFriendFriends = lastFriend.get("friends");
                lastFriendFriends.fetch(function() {
                    var count = lastFriendFriends.length();
                    var removedFriend = lastFriendFriends.shift();
                    lastFriendFriends.fetch(function() {
                        expect(lastFriendFriends.length()).to.be(count - 1);
                        expect(lastFriendFriends.indexOf(removedFriend)).to.be(-1);
                        next();
                    });
                });
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
                    });
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
                        });
                    });
                });
            });
            it("can fetch a person's friends before the person is loaded", function(next) {
                var people = items.people.item("mitch").get("friends").fetch(function() {
                    expect(people.length()).not.to.be(0);
                    next();
                });
            });
            it("can successfuly move one friend to another friend", function(next) {
                var samFriends = items.people.item("sam").get("friends"), mitchFriends = items.people.item("mitch").get("friends"), o = outcome.e(next), removedFriend;
                function reloadFriends(next) {
                    async.forEach([ samFriends, mitchFriends ], function(friends, next) {
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
                var person = new Person({
                    first_name: "Monica",
                    last_name: "Harvancik"
                });
                person.save(function() {
                    items.people.fetch(function() {
                        expect(items.people.indexOf(person)).not.to.be(-1);
                        next();
                    });
                });
            });
            it("can add a hobby", function(next) {
                items.craig.get("hobbies").item({
                    name: "cooking"
                }).save(function() {
                    next();
                });
            });
            var peopleCount = 0;
            it("can remove a person from the model", function(next) {
                peopleCount = items.people.length();
                items.kramer.remove(next);
            });
            it("kramer doesn't exist in the people's collection", function() {
                expect(items.people.indexOf(items.kramer)).to.be(-1);
                expect(items.people.length()).to.be(peopleCount - 1);
            });
            return;
            it("has hobbies", function() {});
            it("can update a hobby", function() {});
            it("can delete a hobby", function() {});
        });
        return module.exports;
    });
    define("expect.js/expect.js", function(require, module, exports, __dirname, __filename) {
        (function(global, module) {
            if ("undefined" == typeof module) {
                var module = {
                    exports: {}
                }, exports = module.exports;
            }
            module.exports = expect;
            expect.Assertion = Assertion;
            expect.version = "0.1.2";
            var flags = {
                not: [ "to", "be", "have", "include", "only" ],
                to: [ "be", "have", "include", "only", "not" ],
                only: [ "have" ],
                have: [ "own" ],
                be: [ "an" ]
            };
            function expect(obj) {
                return new Assertion(obj);
            }
            function Assertion(obj, flag, parent) {
                this.obj = obj;
                this.flags = {};
                if (undefined != parent) {
                    this.flags[flag] = true;
                    for (var i in parent.flags) {
                        if (parent.flags.hasOwnProperty(i)) {
                            this.flags[i] = true;
                        }
                    }
                }
                var $flags = flag ? flags[flag] : keys(flags), self = this;
                if ($flags) {
                    for (var i = 0, l = $flags.length; i < l; i++) {
                        if (this.flags[$flags[i]]) continue;
                        var name = $flags[i], assertion = new Assertion(this.obj, name, this);
                        if ("function" == typeof Assertion.prototype[name]) {
                            var old = this[name];
                            this[name] = function() {
                                return old.apply(self, arguments);
                            };
                            for (var fn in Assertion.prototype) {
                                if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
                                    this[name][fn] = bind(assertion[fn], assertion);
                                }
                            }
                        } else {
                            this[name] = assertion;
                        }
                    }
                }
            }
            Assertion.prototype.assert = function(truth, msg, error) {
                var msg = this.flags.not ? error : msg, ok = this.flags.not ? !truth : truth;
                if (!ok) {
                    throw new Error(msg.call(this));
                }
                this.and = new Assertion(this.obj);
            };
            Assertion.prototype.ok = function() {
                this.assert(!!this.obj, function() {
                    return "expected " + i(this.obj) + " to be truthy";
                }, function() {
                    return "expected " + i(this.obj) + " to be falsy";
                });
            };
            Assertion.prototype.throwError = Assertion.prototype.throwException = function(fn) {
                expect(this.obj).to.be.a("function");
                var thrown = false, not = this.flags.not;
                try {
                    this.obj();
                } catch (e) {
                    if ("function" == typeof fn) {
                        fn(e);
                    } else if ("object" == typeof fn) {
                        var subject = "string" == typeof e ? e : e.message;
                        if (not) {
                            expect(subject).to.not.match(fn);
                        } else {
                            expect(subject).to.match(fn);
                        }
                    }
                    thrown = true;
                }
                if ("object" == typeof fn && not) {
                    this.flags.not = false;
                }
                var name = this.obj.name || "fn";
                this.assert(thrown, function() {
                    return "expected " + name + " to throw an exception";
                }, function() {
                    return "expected " + name + " not to throw an exception";
                });
            };
            Assertion.prototype.empty = function() {
                var expectation;
                if ("object" == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
                    if ("number" == typeof this.obj.length) {
                        expectation = !this.obj.length;
                    } else {
                        expectation = !keys(this.obj).length;
                    }
                } else {
                    if ("string" != typeof this.obj) {
                        expect(this.obj).to.be.an("object");
                    }
                    expect(this.obj).to.have.property("length");
                    expectation = !this.obj.length;
                }
                this.assert(expectation, function() {
                    return "expected " + i(this.obj) + " to be empty";
                }, function() {
                    return "expected " + i(this.obj) + " to not be empty";
                });
                return this;
            };
            Assertion.prototype.be = Assertion.prototype.equal = function(obj) {
                this.assert(obj === this.obj, function() {
                    return "expected " + i(this.obj) + " to equal " + i(obj);
                }, function() {
                    return "expected " + i(this.obj) + " to not equal " + i(obj);
                });
                return this;
            };
            Assertion.prototype.eql = function(obj) {
                this.assert(expect.eql(obj, this.obj), function() {
                    return "expected " + i(this.obj) + " to sort of equal " + i(obj);
                }, function() {
                    return "expected " + i(this.obj) + " to sort of not equal " + i(obj);
                });
                return this;
            };
            Assertion.prototype.within = function(start, finish) {
                var range = start + ".." + finish;
                this.assert(this.obj >= start && this.obj <= finish, function() {
                    return "expected " + i(this.obj) + " to be within " + range;
                }, function() {
                    return "expected " + i(this.obj) + " to not be within " + range;
                });
                return this;
            };
            Assertion.prototype.a = Assertion.prototype.an = function(type) {
                if ("string" == typeof type) {
                    var n = /^[aeiou]/.test(type) ? "n" : "";
                    this.assert("array" == type ? isArray(this.obj) : "object" == type ? "object" == typeof this.obj && null !== this.obj : type == typeof this.obj, function() {
                        return "expected " + i(this.obj) + " to be a" + n + " " + type;
                    }, function() {
                        return "expected " + i(this.obj) + " not to be a" + n + " " + type;
                    });
                } else {
                    var name = type.name || "supplied constructor";
                    this.assert(this.obj instanceof type, function() {
                        return "expected " + i(this.obj) + " to be an instance of " + name;
                    }, function() {
                        return "expected " + i(this.obj) + " not to be an instance of " + name;
                    });
                }
                return this;
            };
            Assertion.prototype.greaterThan = Assertion.prototype.above = function(n) {
                this.assert(this.obj > n, function() {
                    return "expected " + i(this.obj) + " to be above " + n;
                }, function() {
                    return "expected " + i(this.obj) + " to be below " + n;
                });
                return this;
            };
            Assertion.prototype.lessThan = Assertion.prototype.below = function(n) {
                this.assert(this.obj < n, function() {
                    return "expected " + i(this.obj) + " to be below " + n;
                }, function() {
                    return "expected " + i(this.obj) + " to be above " + n;
                });
                return this;
            };
            Assertion.prototype.match = function(regexp) {
                this.assert(regexp.exec(this.obj), function() {
                    return "expected " + i(this.obj) + " to match " + regexp;
                }, function() {
                    return "expected " + i(this.obj) + " not to match " + regexp;
                });
                return this;
            };
            Assertion.prototype.length = function(n) {
                expect(this.obj).to.have.property("length");
                var len = this.obj.length;
                this.assert(n == len, function() {
                    return "expected " + i(this.obj) + " to have a length of " + n + " but got " + len;
                }, function() {
                    return "expected " + i(this.obj) + " to not have a length of " + len;
                });
                return this;
            };
            Assertion.prototype.property = function(name, val) {
                if (this.flags.own) {
                    this.assert(Object.prototype.hasOwnProperty.call(this.obj, name), function() {
                        return "expected " + i(this.obj) + " to have own property " + i(name);
                    }, function() {
                        return "expected " + i(this.obj) + " to not have own property " + i(name);
                    });
                    return this;
                }
                if (this.flags.not && undefined !== val) {
                    if (undefined === this.obj[name]) {
                        throw new Error(i(this.obj) + " has no property " + i(name));
                    }
                } else {
                    var hasProp;
                    try {
                        hasProp = name in this.obj;
                    } catch (e) {
                        hasProp = undefined !== this.obj[name];
                    }
                    this.assert(hasProp, function() {
                        return "expected " + i(this.obj) + " to have a property " + i(name);
                    }, function() {
                        return "expected " + i(this.obj) + " to not have a property " + i(name);
                    });
                }
                if (undefined !== val) {
                    this.assert(val === this.obj[name], function() {
                        return "expected " + i(this.obj) + " to have a property " + i(name) + " of " + i(val) + ", but got " + i(this.obj[name]);
                    }, function() {
                        return "expected " + i(this.obj) + " to not have a property " + i(name) + " of " + i(val);
                    });
                }
                this.obj = this.obj[name];
                return this;
            };
            Assertion.prototype.string = Assertion.prototype.contain = function(obj) {
                if ("string" == typeof this.obj) {
                    this.assert(~this.obj.indexOf(obj), function() {
                        return "expected " + i(this.obj) + " to contain " + i(obj);
                    }, function() {
                        return "expected " + i(this.obj) + " to not contain " + i(obj);
                    });
                } else {
                    this.assert(~indexOf(this.obj, obj), function() {
                        return "expected " + i(this.obj) + " to contain " + i(obj);
                    }, function() {
                        return "expected " + i(this.obj) + " to not contain " + i(obj);
                    });
                }
                return this;
            };
            Assertion.prototype.key = Assertion.prototype.keys = function($keys) {
                var str, ok = true;
                $keys = isArray($keys) ? $keys : Array.prototype.slice.call(arguments);
                if (!$keys.length) throw new Error("keys required");
                var actual = keys(this.obj), len = $keys.length;
                ok = every($keys, function(key) {
                    return ~indexOf(actual, key);
                });
                if (!this.flags.not && this.flags.only) {
                    ok = ok && $keys.length == actual.length;
                }
                if (len > 1) {
                    $keys = map($keys, function(key) {
                        return i(key);
                    });
                    var last = $keys.pop();
                    str = $keys.join(", ") + ", and " + last;
                } else {
                    str = i($keys[0]);
                }
                str = (len > 1 ? "keys " : "key ") + str;
                str = (!this.flags.only ? "include " : "only have ") + str;
                this.assert(ok, function() {
                    return "expected " + i(this.obj) + " to " + str;
                }, function() {
                    return "expected " + i(this.obj) + " to not " + str;
                });
                return this;
            };
            Assertion.prototype.fail = function(msg) {
                msg = msg || "explicit failure";
                this.assert(false, msg, msg);
                return this;
            };
            function bind(fn, scope) {
                return function() {
                    return fn.apply(scope, arguments);
                };
            }
            function every(arr, fn, thisObj) {
                var scope = thisObj || global;
                for (var i = 0, j = arr.length; i < j; ++i) {
                    if (!fn.call(scope, arr[i], i, arr)) {
                        return false;
                    }
                }
                return true;
            }
            function indexOf(arr, o, i) {
                if (Array.prototype.indexOf) {
                    return Array.prototype.indexOf.call(arr, o, i);
                }
                if (arr.length === undefined) {
                    return -1;
                }
                for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; i < j && arr[i] !== o; i++) ;
                return j <= i ? -1 : i;
            }
            var getOuterHTML = function(element) {
                if ("outerHTML" in element) return element.outerHTML;
                var ns = "http://www.w3.org/1999/xhtml";
                var container = document.createElementNS(ns, "_");
                var elemProto = (window.HTMLElement || window.Element).prototype;
                var xmlSerializer = new XMLSerializer;
                var html;
                if (document.xmlVersion) {
                    return xmlSerializer.serializeToString(element);
                } else {
                    container.appendChild(element.cloneNode(false));
                    html = container.innerHTML.replace("><", ">" + element.innerHTML + "<");
                    container.innerHTML = "";
                    return html;
                }
            };
            var isDOMElement = function(object) {
                if (typeof HTMLElement === "object") {
                    return object instanceof HTMLElement;
                } else {
                    return object && typeof object === "object" && object.nodeType === 1 && typeof object.nodeName === "string";
                }
            };
            function i(obj, showHidden, depth) {
                var seen = [];
                function stylize(str) {
                    return str;
                }
                function format(value, recurseTimes) {
                    if (value && typeof value.inspect === "function" && value !== exports && !(value.constructor && value.constructor.prototype === value)) {
                        return value.inspect(recurseTimes);
                    }
                    switch (typeof value) {
                      case "undefined":
                        return stylize("undefined", "undefined");
                      case "string":
                        var simple = "'" + json.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                        return stylize(simple, "string");
                      case "number":
                        return stylize("" + value, "number");
                      case "boolean":
                        return stylize("" + value, "boolean");
                    }
                    if (value === null) {
                        return stylize("null", "null");
                    }
                    if (isDOMElement(value)) {
                        return getOuterHTML(value);
                    }
                    var visible_keys = keys(value);
                    var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;
                    if (typeof value === "function" && $keys.length === 0) {
                        if (isRegExp(value)) {
                            return stylize("" + value, "regexp");
                        } else {
                            var name = value.name ? ": " + value.name : "";
                            return stylize("[Function" + name + "]", "special");
                        }
                    }
                    if (isDate(value) && $keys.length === 0) {
                        return stylize(value.toUTCString(), "date");
                    }
                    var base, type, braces;
                    if (isArray(value)) {
                        type = "Array";
                        braces = [ "[", "]" ];
                    } else {
                        type = "Object";
                        braces = [ "{", "}" ];
                    }
                    if (typeof value === "function") {
                        var n = value.name ? ": " + value.name : "";
                        base = isRegExp(value) ? " " + value : " [Function" + n + "]";
                    } else {
                        base = "";
                    }
                    if (isDate(value)) {
                        base = " " + value.toUTCString();
                    }
                    if ($keys.length === 0) {
                        return braces[0] + base + braces[1];
                    }
                    if (recurseTimes < 0) {
                        if (isRegExp(value)) {
                            return stylize("" + value, "regexp");
                        } else {
                            return stylize("[Object]", "special");
                        }
                    }
                    seen.push(value);
                    var output = map($keys, function(key) {
                        var name, str;
                        if (value.__lookupGetter__) {
                            if (value.__lookupGetter__(key)) {
                                if (value.__lookupSetter__(key)) {
                                    str = stylize("[Getter/Setter]", "special");
                                } else {
                                    str = stylize("[Getter]", "special");
                                }
                            } else {
                                if (value.__lookupSetter__(key)) {
                                    str = stylize("[Setter]", "special");
                                }
                            }
                        }
                        if (indexOf(visible_keys, key) < 0) {
                            name = "[" + key + "]";
                        }
                        if (!str) {
                            if (indexOf(seen, value[key]) < 0) {
                                if (recurseTimes === null) {
                                    str = format(value[key]);
                                } else {
                                    str = format(value[key], recurseTimes - 1);
                                }
                                if (str.indexOf("\n") > -1) {
                                    if (isArray(value)) {
                                        str = map(str.split("\n"), function(line) {
                                            return "  " + line;
                                        }).join("\n").substr(2);
                                    } else {
                                        str = "\n" + map(str.split("\n"), function(line) {
                                            return "   " + line;
                                        }).join("\n");
                                    }
                                }
                            } else {
                                str = stylize("[Circular]", "special");
                            }
                        }
                        if (typeof name === "undefined") {
                            if (type === "Array" && key.match(/^\d+$/)) {
                                return str;
                            }
                            name = json.stringify("" + key);
                            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                                name = name.substr(1, name.length - 2);
                                name = stylize(name, "name");
                            } else {
                                name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                                name = stylize(name, "string");
                            }
                        }
                        return name + ": " + str;
                    });
                    seen.pop();
                    var numLinesEst = 0;
                    var length = reduce(output, function(prev, cur) {
                        numLinesEst++;
                        if (indexOf(cur, "\n") >= 0) numLinesEst++;
                        return prev + cur.length + 1;
                    }, 0);
                    if (length > 50) {
                        output = braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
                    } else {
                        output = braces[0] + base + " " + output.join(", ") + " " + braces[1];
                    }
                    return output;
                }
                return format(obj, typeof depth === "undefined" ? 2 : depth);
            }
            function isArray(ar) {
                return Object.prototype.toString.call(ar) == "[object Array]";
            }
            function isRegExp(re) {
                var s;
                try {
                    s = "" + re;
                } catch (e) {
                    return false;
                }
                return re instanceof RegExp || typeof re === "function" && re.constructor.name === "RegExp" && re.compile && re.test && re.exec && s.match(/^\/.*\/[gim]{0,3}$/);
            }
            function isDate(d) {
                if (d instanceof Date) return true;
                return false;
            }
            function keys(obj) {
                if (Object.keys) {
                    return Object.keys(obj);
                }
                var keys = [];
                for (var i in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, i)) {
                        keys.push(i);
                    }
                }
                return keys;
            }
            function map(arr, mapper, that) {
                if (Array.prototype.map) {
                    return Array.prototype.map.call(arr, mapper, that);
                }
                var other = new Array(arr.length);
                for (var i = 0, n = arr.length; i < n; i++) if (i in arr) other[i] = mapper.call(that, arr[i], i, arr);
                return other;
            }
            function reduce(arr, fun) {
                if (Array.prototype.reduce) {
                    return Array.prototype.reduce.apply(arr, Array.prototype.slice.call(arguments, 1));
                }
                var len = +this.length;
                if (typeof fun !== "function") throw new TypeError;
                if (len === 0 && arguments.length === 1) throw new TypeError;
                var i = 0;
                if (arguments.length >= 2) {
                    var rv = arguments[1];
                } else {
                    do {
                        if (i in this) {
                            rv = this[i++];
                            break;
                        }
                        if (++i >= len) throw new TypeError;
                    } while (true);
                }
                for (; i < len; i++) {
                    if (i in this) rv = fun.call(null, rv, this[i], i, this);
                }
                return rv;
            }
            expect.eql = function eql(actual, expected) {
                if (actual === expected) {
                    return true;
                } else if ("undefined" != typeof Buffer && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
                    if (actual.length != expected.length) return false;
                    for (var i = 0; i < actual.length; i++) {
                        if (actual[i] !== expected[i]) return false;
                    }
                    return true;
                } else if (actual instanceof Date && expected instanceof Date) {
                    return actual.getTime() === expected.getTime();
                } else if (typeof actual != "object" && typeof expected != "object") {
                    return actual == expected;
                } else {
                    return objEquiv(actual, expected);
                }
            };
            function isUndefinedOrNull(value) {
                return value === null || value === undefined;
            }
            function isArguments(object) {
                return Object.prototype.toString.call(object) == "[object Arguments]";
            }
            function objEquiv(a, b) {
                if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
                if (a.prototype !== b.prototype) return false;
                if (isArguments(a)) {
                    if (!isArguments(b)) {
                        return false;
                    }
                    a = pSlice.call(a);
                    b = pSlice.call(b);
                    return expect.eql(a, b);
                }
                try {
                    var ka = keys(a), kb = keys(b), key, i;
                } catch (e) {
                    return false;
                }
                if (ka.length != kb.length) return false;
                ka.sort();
                kb.sort();
                for (i = ka.length - 1; i >= 0; i--) {
                    if (ka[i] != kb[i]) return false;
                }
                for (i = ka.length - 1; i >= 0; i--) {
                    key = ka[i];
                    if (!expect.eql(a[key], b[key])) return false;
                }
                return true;
            }
            var json = function() {
                "use strict";
                if ("object" == typeof JSON && JSON.parse && JSON.stringify) {
                    return {
                        parse: nativeJSON.parse,
                        stringify: nativeJSON.stringify
                    };
                }
                var JSON = {};
                function f(n) {
                    return n < 10 ? "0" + n : n;
                }
                function date(d, key) {
                    return isFinite(d.valueOf()) ? d.getUTCFullYear() + "-" + f(d.getUTCMonth() + 1) + "-" + f(d.getUTCDate()) + "T" + f(d.getUTCHours()) + ":" + f(d.getUTCMinutes()) + ":" + f(d.getUTCSeconds()) + "Z" : null;
                }
                var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
                    "\b": "\\b",
                    "	": "\\t",
                    "\n": "\\n",
                    "\f": "\\f",
                    "\r": "\\r",
                    '"': '\\"',
                    "\\": "\\\\"
                }, rep;
                function quote(string) {
                    escapable.lastIndex = 0;
                    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
                        var c = meta[a];
                        return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                    }) + '"' : '"' + string + '"';
                }
                function str(key, holder) {
                    var i, k, v, length, mind = gap, partial, value = holder[key];
                    if (value instanceof Date) {
                        value = date(key);
                    }
                    if (typeof rep === "function") {
                        value = rep.call(holder, key, value);
                    }
                    switch (typeof value) {
                      case "string":
                        return quote(value);
                      case "number":
                        return isFinite(value) ? String(value) : "null";
                      case "boolean":
                      case "null":
                        return String(value);
                      case "object":
                        if (!value) {
                            return "null";
                        }
                        gap += indent;
                        partial = [];
                        if (Object.prototype.toString.apply(value) === "[object Array]") {
                            length = value.length;
                            for (i = 0; i < length; i += 1) {
                                partial[i] = str(i, value) || "null";
                            }
                            v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                            gap = mind;
                            return v;
                        }
                        if (rep && typeof rep === "object") {
                            length = rep.length;
                            for (i = 0; i < length; i += 1) {
                                if (typeof rep[i] === "string") {
                                    k = rep[i];
                                    v = str(k, value);
                                    if (v) {
                                        partial.push(quote(k) + (gap ? ": " : ":") + v);
                                    }
                                }
                            }
                        } else {
                            for (k in value) {
                                if (Object.prototype.hasOwnProperty.call(value, k)) {
                                    v = str(k, value);
                                    if (v) {
                                        partial.push(quote(k) + (gap ? ": " : ":") + v);
                                    }
                                }
                            }
                        }
                        v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                        gap = mind;
                        return v;
                    }
                }
                JSON.stringify = function(value, replacer, space) {
                    var i;
                    gap = "";
                    indent = "";
                    if (typeof space === "number") {
                        for (i = 0; i < space; i += 1) {
                            indent += " ";
                        }
                    } else if (typeof space === "string") {
                        indent = space;
                    }
                    rep = replacer;
                    if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                        throw new Error("JSON.stringify");
                    }
                    return str("", {
                        "": value
                    });
                };
                JSON.parse = function(text, reviver) {
                    var j;
                    function walk(holder, key) {
                        var k, v, value = holder[key];
                        if (value && typeof value === "object") {
                            for (k in value) {
                                if (Object.prototype.hasOwnProperty.call(value, k)) {
                                    v = walk(value, k);
                                    if (v !== undefined) {
                                        value[k] = v;
                                    } else {
                                        delete value[k];
                                    }
                                }
                            }
                        }
                        return reviver.call(holder, key, value);
                    }
                    text = String(text);
                    cx.lastIndex = 0;
                    if (cx.test(text)) {
                        text = text.replace(cx, function(a) {
                            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                        });
                    }
                    if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                        j = eval("(" + text + ")");
                        return typeof reviver === "function" ? walk({
                            "": j
                        }, "") : j;
                    }
                    throw new SyntaxError("JSON.parse");
                };
                return JSON;
            }();
            if ("undefined" != typeof window) {
                window.expect = module.exports;
            }
        })(this, "undefined" != typeof module ? module : {}, "undefined" != typeof exports ? exports : {});
        return module.exports;
    });
    define("linen/test-web/helpers/api.js", function(require, module, exports, __dirname, __filename) {
        var sift = require("sift/sift.js"), _cid = 0, _ = require("underscore/underscore.js"), outcome = require("outcome/lib/index.js"), beanpoll = require("beanpoll/lib/index.js"), vine = require("vine/index.js"), verify = require("verify/lib/index.js");
        var collections = {
            people: [ {
                _id: "craig",
                first_name: "craig",
                last_name: "condon",
                location: "sf",
                friends: [ "sam", "tim", "liam", "frank", "mitch" ]
            }, {
                _id: "sam",
                first_name: "Sam",
                last_name: "C",
                location: "pa",
                friends: [ "craig", "liam", "frank" ]
            }, {
                _id: "tim",
                first_name: "Sam",
                last_name: "C",
                location: "stpl",
                friends: [ "mitch", "craig" ]
            }, {
                _id: "mitch",
                first_name: "Mitch",
                last_name: "C",
                location: "stpl",
                friends: [ "tim", "craig" ]
            }, {
                _id: "liam",
                first_name: "Sam",
                last_name: "C",
                location: "sf",
                friends: [ "craig", "sam", "frank" ]
            }, {
                _id: "frank",
                first_name: "Frank",
                last_name: "C",
                location: "sf",
                friends: [ "craig", "liam", "sam" ]
            } ],
            locations: [ {
                _id: "sf",
                name: "San Francisco",
                state: "CA",
                zip: 94102
            }, {
                _id: "stpl",
                name: "Minneapolis",
                state: "MN",
                zip: 55124
            }, {
                _id: "pa",
                name: "Palo Alto",
                state: "CA",
                zip: 99999
            } ]
        };
        linen = require("linen/lib/index.js");
        var router = beanpoll.router();
        function getPerson(req) {
            return sift({
                _id: req.params.person
            }, collections.people).shift();
        }
        function findPeople(search) {
            return sift(search, collections.people);
        }
        router.on({
            "pull -method=GET people": function(req, res) {
                res.end(vine.result(collections.people));
            },
            "pull -method=POST people": function(req, res) {
                var body = req.query.body;
                if (findPeople({
                    first_name: body.first_name
                }).length) {
                    return res.end(vine.error("user already exists"));
                }
                _.defaults(body, {
                    _id: body.first_name,
                    friends: [],
                    hobbies: []
                });
                collections.people.push(body);
                res.end(vine.result(body));
            },
            "pull -method=GET people/:person": function(req, res) {
                res.end(vine.result(getPerson(req)));
            },
            "pull -method=PUT people/:person": function(req, res) {
                var person = getPerson(req);
                for (var key in req.query.body) {
                    person[key] = req.query.body[key];
                }
                res.end(vine.result(person));
            },
            "pull -method=GET locations/:location": function(req, res) {
                res.end(vine.result(sift({
                    _id: req.params.location
                }, collections.locations).shift()));
            },
            "pull -method=GET people/:person/friends": function(req, res) {
                var person = getPerson(req);
                var friends = findPeople({
                    _id: {
                        $in: person.friends
                    }
                });
                res.end(vine.result(friends));
            },
            "pull -method=POST people/:person/friends": function(req, res) {
                var person = getPerson(req), body = req.query.body;
                if (!person) return res.end(vine.error("person does not exist"));
                person.friends.push(body._id);
                res.end(vine.result(body));
            },
            "pull -method=DELETE people/:person/friends/:friend": function(req, res) {
                var person = getPerson(req);
                if (!person) return res.end(vine.error("person does not exist"));
                var friendIndex;
                var friend = person.friends[friendIndex = person.friends.indexOf(req.params.friend)];
                if (!friend) return res.end(vine.error("friend does not exist"));
                person.friends.splice(friendIndex, 1);
                res.end(vine.result(getPerson({
                    params: {
                        person: req.params.friend
                    }
                })));
            },
            "pull -method=DELETE people/:person": function(req, res) {
                var person = getPerson(req);
                collections.people.splice(collections.people.indexOf(person), 1);
                res.end(vine.result(person));
            }
        });
        module.exports = linen({
            routes: {
                people: {
                    name: "person",
                    schema: {
                        first_name: {
                            $type: "string",
                            $required: true
                        },
                        last_name: {
                            $type: "string",
                            $required: true
                        },
                        location: {
                            $ref: "location",
                            $objectKey: "_id",
                            $route: {
                                path: "locations"
                            }
                        },
                        friends: [ {
                            $ref: "person",
                            $route: {
                                path: "people",
                                inherit: false
                            }
                        } ],
                        hobbies: [ {
                            $ref: "hobby",
                            $route: {
                                virtual: true,
                                inherit: true
                            }
                        } ]
                    }
                },
                hobbies: {
                    name: "hobby",
                    schema: {
                        name: "string"
                    }
                },
                locations: {
                    name: "location",
                    schema: {
                        city: "string",
                        state: "string",
                        zip: {
                            $type: "number",
                            $is: /\d{5}/
                        }
                    }
                }
            },
            mapResponse: function(response, callback) {
                var data = response.data;
                function next() {
                    var args = arguments, self = this;
                    setTimeout(function() {
                        callback.apply(self, args);
                    }, 10);
                }
                if (data.errors) {
                    next(new Error(data.errors[0].message));
                } else {
                    next(null, _clone(data.result));
                }
            },
            transport: {
                request: function(options, callback) {
                    if (!/PUT|PATCH|DELETE|POST|GET/.test(String(options.method))) {
                        return callback(new Error("method " + options.method + " doesn't exist"));
                    }
                    router.request(options.path).tag({
                        method: options.method
                    }).query({
                        data: options.query,
                        body: options.body
                    }).pull(callback);
                }
            }
        });
        function _clone(object) {
            return JSON.parse(JSON.stringify(object));
        }
        return module.exports;
    });
    define("async/lib/async.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async = {};
            var root, previous_async;
            root = this;
            if (root != null) {
                previous_async = root.async;
            }
            async.noConflict = function() {
                root.async = previous_async;
                return async;
            };
            function only_once(fn) {
                var called = false;
                return function() {
                    if (called) throw new Error("Callback was already called.");
                    called = true;
                    fn.apply(root, arguments);
                };
            }
            var _each = function(arr, iterator) {
                if (arr.forEach) {
                    return arr.forEach(iterator);
                }
                for (var i = 0; i < arr.length; i += 1) {
                    iterator(arr[i], i, arr);
                }
            };
            var _map = function(arr, iterator) {
                if (arr.map) {
                    return arr.map(iterator);
                }
                var results = [];
                _each(arr, function(x, i, a) {
                    results.push(iterator(x, i, a));
                });
                return results;
            };
            var _reduce = function(arr, iterator, memo) {
                if (arr.reduce) {
                    return arr.reduce(iterator, memo);
                }
                _each(arr, function(x, i, a) {
                    memo = iterator(memo, x, i, a);
                });
                return memo;
            };
            var _keys = function(obj) {
                if (Object.keys) {
                    return Object.keys(obj);
                }
                var keys = [];
                for (var k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            };
            if (typeof process === "undefined" || !process.nextTick) {
                if (typeof setImmediate === "function") {
                    async.setImmediate = setImmediate;
                    async.nextTick = setImmediate;
                } else {
                    async.setImmediate = async.nextTick;
                    async.nextTick = function(fn) {
                        setTimeout(fn, 0);
                    };
                }
            } else {
                async.nextTick = process.nextTick;
                if (typeof setImmediate !== "undefined") {
                    async.setImmediate = setImmediate;
                } else {
                    async.setImmediate = async.nextTick;
                }
            }
            async.each = function(arr, iterator, callback) {
                callback = callback || function() {};
                if (!arr.length) {
                    return callback();
                }
                var completed = 0;
                _each(arr, function(x) {
                    iterator(x, only_once(function(err) {
                        if (err) {
                            callback(err);
                            callback = function() {};
                        } else {
                            completed += 1;
                            if (completed >= arr.length) {
                                callback(null);
                            }
                        }
                    }));
                });
            };
            async.forEach = async.each;
            async.eachSeries = function(arr, iterator, callback) {
                callback = callback || function() {};
                if (!arr.length) {
                    return callback();
                }
                var completed = 0;
                var iterate = function() {
                    iterator(arr[completed], function(err) {
                        if (err) {
                            callback(err);
                            callback = function() {};
                        } else {
                            completed += 1;
                            if (completed >= arr.length) {
                                callback(null);
                            } else {
                                iterate();
                            }
                        }
                    });
                };
                iterate();
            };
            async.forEachSeries = async.eachSeries;
            async.eachLimit = function(arr, limit, iterator, callback) {
                var fn = _eachLimit(limit);
                fn.apply(null, [ arr, iterator, callback ]);
            };
            async.forEachLimit = async.eachLimit;
            var _eachLimit = function(limit) {
                return function(arr, iterator, callback) {
                    callback = callback || function() {};
                    if (!arr.length || limit <= 0) {
                        return callback();
                    }
                    var completed = 0;
                    var started = 0;
                    var running = 0;
                    (function replenish() {
                        if (completed >= arr.length) {
                            return callback();
                        }
                        while (running < limit && started < arr.length) {
                            started += 1;
                            running += 1;
                            iterator(arr[started - 1], function(err) {
                                if (err) {
                                    callback(err);
                                    callback = function() {};
                                } else {
                                    completed += 1;
                                    running -= 1;
                                    if (completed >= arr.length) {
                                        callback();
                                    } else {
                                        replenish();
                                    }
                                }
                            });
                        }
                    })();
                };
            };
            var doParallel = function(fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(null, [ async.each ].concat(args));
                };
            };
            var doParallelLimit = function(limit, fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(null, [ _eachLimit(limit) ].concat(args));
                };
            };
            var doSeries = function(fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(null, [ async.eachSeries ].concat(args));
                };
            };
            var _asyncMap = function(eachfn, arr, iterator, callback) {
                var results = [];
                arr = _map(arr, function(x, i) {
                    return {
                        index: i,
                        value: x
                    };
                });
                eachfn(arr, function(x, callback) {
                    iterator(x.value, function(err, v) {
                        results[x.index] = v;
                        callback(err);
                    });
                }, function(err) {
                    callback(err, results);
                });
            };
            async.map = doParallel(_asyncMap);
            async.mapSeries = doSeries(_asyncMap);
            async.mapLimit = function(arr, limit, iterator, callback) {
                return _mapLimit(limit)(arr, iterator, callback);
            };
            var _mapLimit = function(limit) {
                return doParallelLimit(limit, _asyncMap);
            };
            async.reduce = function(arr, memo, iterator, callback) {
                async.eachSeries(arr, function(x, callback) {
                    iterator(memo, x, function(err, v) {
                        memo = v;
                        callback(err);
                    });
                }, function(err) {
                    callback(err, memo);
                });
            };
            async.inject = async.reduce;
            async.foldl = async.reduce;
            async.reduceRight = function(arr, memo, iterator, callback) {
                var reversed = _map(arr, function(x) {
                    return x;
                }).reverse();
                async.reduce(reversed, memo, iterator, callback);
            };
            async.foldr = async.reduceRight;
            var _filter = function(eachfn, arr, iterator, callback) {
                var results = [];
                arr = _map(arr, function(x, i) {
                    return {
                        index: i,
                        value: x
                    };
                });
                eachfn(arr, function(x, callback) {
                    iterator(x.value, function(v) {
                        if (v) {
                            results.push(x);
                        }
                        callback();
                    });
                }, function(err) {
                    callback(_map(results.sort(function(a, b) {
                        return a.index - b.index;
                    }), function(x) {
                        return x.value;
                    }));
                });
            };
            async.filter = doParallel(_filter);
            async.filterSeries = doSeries(_filter);
            async.select = async.filter;
            async.selectSeries = async.filterSeries;
            var _reject = function(eachfn, arr, iterator, callback) {
                var results = [];
                arr = _map(arr, function(x, i) {
                    return {
                        index: i,
                        value: x
                    };
                });
                eachfn(arr, function(x, callback) {
                    iterator(x.value, function(v) {
                        if (!v) {
                            results.push(x);
                        }
                        callback();
                    });
                }, function(err) {
                    callback(_map(results.sort(function(a, b) {
                        return a.index - b.index;
                    }), function(x) {
                        return x.value;
                    }));
                });
            };
            async.reject = doParallel(_reject);
            async.rejectSeries = doSeries(_reject);
            var _detect = function(eachfn, arr, iterator, main_callback) {
                eachfn(arr, function(x, callback) {
                    iterator(x, function(result) {
                        if (result) {
                            main_callback(x);
                            main_callback = function() {};
                        } else {
                            callback();
                        }
                    });
                }, function(err) {
                    main_callback();
                });
            };
            async.detect = doParallel(_detect);
            async.detectSeries = doSeries(_detect);
            async.some = function(arr, iterator, main_callback) {
                async.each(arr, function(x, callback) {
                    iterator(x, function(v) {
                        if (v) {
                            main_callback(true);
                            main_callback = function() {};
                        }
                        callback();
                    });
                }, function(err) {
                    main_callback(false);
                });
            };
            async.any = async.some;
            async.every = function(arr, iterator, main_callback) {
                async.each(arr, function(x, callback) {
                    iterator(x, function(v) {
                        if (!v) {
                            main_callback(false);
                            main_callback = function() {};
                        }
                        callback();
                    });
                }, function(err) {
                    main_callback(true);
                });
            };
            async.all = async.every;
            async.sortBy = function(arr, iterator, callback) {
                async.map(arr, function(x, callback) {
                    iterator(x, function(err, criteria) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, {
                                value: x,
                                criteria: criteria
                            });
                        }
                    });
                }, function(err, results) {
                    if (err) {
                        return callback(err);
                    } else {
                        var fn = function(left, right) {
                            var a = left.criteria, b = right.criteria;
                            return a < b ? -1 : a > b ? 1 : 0;
                        };
                        callback(null, _map(results.sort(fn), function(x) {
                            return x.value;
                        }));
                    }
                });
            };
            async.auto = function(tasks, callback) {
                callback = callback || function() {};
                var keys = _keys(tasks);
                if (!keys.length) {
                    return callback(null);
                }
                var results = {};
                var listeners = [];
                var addListener = function(fn) {
                    listeners.unshift(fn);
                };
                var removeListener = function(fn) {
                    for (var i = 0; i < listeners.length; i += 1) {
                        if (listeners[i] === fn) {
                            listeners.splice(i, 1);
                            return;
                        }
                    }
                };
                var taskComplete = function() {
                    _each(listeners.slice(0), function(fn) {
                        fn();
                    });
                };
                addListener(function() {
                    if (_keys(results).length === keys.length) {
                        callback(null, results);
                        callback = function() {};
                    }
                });
                _each(keys, function(k) {
                    var task = tasks[k] instanceof Function ? [ tasks[k] ] : tasks[k];
                    var taskCallback = function(err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        if (err) {
                            var safeResults = {};
                            _each(_keys(results), function(rkey) {
                                safeResults[rkey] = results[rkey];
                            });
                            safeResults[k] = args;
                            callback(err, safeResults);
                            callback = function() {};
                        } else {
                            results[k] = args;
                            async.setImmediate(taskComplete);
                        }
                    };
                    var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                    var ready = function() {
                        return _reduce(requires, function(a, x) {
                            return a && results.hasOwnProperty(x);
                        }, true) && !results.hasOwnProperty(k);
                    };
                    if (ready()) {
                        task[task.length - 1](taskCallback, results);
                    } else {
                        var listener = function() {
                            if (ready()) {
                                removeListener(listener);
                                task[task.length - 1](taskCallback, results);
                            }
                        };
                        addListener(listener);
                    }
                });
            };
            async.waterfall = function(tasks, callback) {
                callback = callback || function() {};
                if (tasks.constructor !== Array) {
                    var err = new Error("First argument to waterfall must be an array of functions");
                    return callback(err);
                }
                if (!tasks.length) {
                    return callback();
                }
                var wrapIterator = function(iterator) {
                    return function(err) {
                        if (err) {
                            callback.apply(null, arguments);
                            callback = function() {};
                        } else {
                            var args = Array.prototype.slice.call(arguments, 1);
                            var next = iterator.next();
                            if (next) {
                                args.push(wrapIterator(next));
                            } else {
                                args.push(callback);
                            }
                            async.setImmediate(function() {
                                iterator.apply(null, args);
                            });
                        }
                    };
                };
                wrapIterator(async.iterator(tasks))();
            };
            var _parallel = function(eachfn, tasks, callback) {
                callback = callback || function() {};
                if (tasks.constructor === Array) {
                    eachfn.map(tasks, function(fn, callback) {
                        if (fn) {
                            fn(function(err) {
                                var args = Array.prototype.slice.call(arguments, 1);
                                if (args.length <= 1) {
                                    args = args[0];
                                }
                                callback.call(null, err, args);
                            });
                        }
                    }, callback);
                } else {
                    var results = {};
                    eachfn.each(_keys(tasks), function(k, callback) {
                        tasks[k](function(err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            results[k] = args;
                            callback(err);
                        });
                    }, function(err) {
                        callback(err, results);
                    });
                }
            };
            async.parallel = function(tasks, callback) {
                _parallel({
                    map: async.map,
                    each: async.each
                }, tasks, callback);
            };
            async.parallelLimit = function(tasks, limit, callback) {
                _parallel({
                    map: _mapLimit(limit),
                    each: _eachLimit(limit)
                }, tasks, callback);
            };
            async.series = function(tasks, callback) {
                callback = callback || function() {};
                if (tasks.constructor === Array) {
                    async.mapSeries(tasks, function(fn, callback) {
                        if (fn) {
                            fn(function(err) {
                                var args = Array.prototype.slice.call(arguments, 1);
                                if (args.length <= 1) {
                                    args = args[0];
                                }
                                callback.call(null, err, args);
                            });
                        }
                    }, callback);
                } else {
                    var results = {};
                    async.eachSeries(_keys(tasks), function(k, callback) {
                        tasks[k](function(err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            results[k] = args;
                            callback(err);
                        });
                    }, function(err) {
                        callback(err, results);
                    });
                }
            };
            async.iterator = function(tasks) {
                var makeCallback = function(index) {
                    var fn = function() {
                        if (tasks.length) {
                            tasks[index].apply(null, arguments);
                        }
                        return fn.next();
                    };
                    fn.next = function() {
                        return index < tasks.length - 1 ? makeCallback(index + 1) : null;
                    };
                    return fn;
                };
                return makeCallback(0);
            };
            async.apply = function(fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                return function() {
                    return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
                };
            };
            var _concat = function(eachfn, arr, fn, callback) {
                var r = [];
                eachfn(arr, function(x, cb) {
                    fn(x, function(err, y) {
                        r = r.concat(y || []);
                        cb(err);
                    });
                }, function(err) {
                    callback(err, r);
                });
            };
            async.concat = doParallel(_concat);
            async.concatSeries = doSeries(_concat);
            async.whilst = function(test, iterator, callback) {
                if (test()) {
                    iterator(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        async.whilst(test, iterator, callback);
                    });
                } else {
                    callback();
                }
            };
            async.doWhilst = function(iterator, test, callback) {
                iterator(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    if (test()) {
                        async.doWhilst(iterator, test, callback);
                    } else {
                        callback();
                    }
                });
            };
            async.until = function(test, iterator, callback) {
                if (!test()) {
                    iterator(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        async.until(test, iterator, callback);
                    });
                } else {
                    callback();
                }
            };
            async.doUntil = function(iterator, test, callback) {
                iterator(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    if (!test()) {
                        async.doUntil(iterator, test, callback);
                    } else {
                        callback();
                    }
                });
            };
            async.queue = function(worker, concurrency) {
                if (concurrency === undefined) {
                    concurrency = 1;
                }
                function _insert(q, data, pos, callback) {
                    if (data.constructor !== Array) {
                        data = [ data ];
                    }
                    _each(data, function(task) {
                        var item = {
                            data: task,
                            callback: typeof callback === "function" ? callback : null
                        };
                        if (pos) {
                            q.tasks.unshift(item);
                        } else {
                            q.tasks.push(item);
                        }
                        if (q.saturated && q.tasks.length === concurrency) {
                            q.saturated();
                        }
                        async.setImmediate(q.process);
                    });
                }
                var workers = 0;
                var q = {
                    tasks: [],
                    concurrency: concurrency,
                    saturated: null,
                    empty: null,
                    drain: null,
                    push: function(data, callback) {
                        _insert(q, data, false, callback);
                    },
                    unshift: function(data, callback) {
                        _insert(q, data, true, callback);
                    },
                    process: function() {
                        if (workers < q.concurrency && q.tasks.length) {
                            var task = q.tasks.shift();
                            if (q.empty && q.tasks.length === 0) {
                                q.empty();
                            }
                            workers += 1;
                            var next = function() {
                                workers -= 1;
                                if (task.callback) {
                                    task.callback.apply(task, arguments);
                                }
                                if (q.drain && q.tasks.length + workers === 0) {
                                    q.drain();
                                }
                                q.process();
                            };
                            var cb = only_once(next);
                            worker(task.data, cb);
                        }
                    },
                    length: function() {
                        return q.tasks.length;
                    },
                    running: function() {
                        return workers;
                    }
                };
                return q;
            };
            async.cargo = function(worker, payload) {
                var working = false, tasks = [];
                var cargo = {
                    tasks: tasks,
                    payload: payload,
                    saturated: null,
                    empty: null,
                    drain: null,
                    push: function(data, callback) {
                        if (data.constructor !== Array) {
                            data = [ data ];
                        }
                        _each(data, function(task) {
                            tasks.push({
                                data: task,
                                callback: typeof callback === "function" ? callback : null
                            });
                            if (cargo.saturated && tasks.length === payload) {
                                cargo.saturated();
                            }
                        });
                        async.setImmediate(cargo.process);
                    },
                    process: function process() {
                        if (working) return;
                        if (tasks.length === 0) {
                            if (cargo.drain) cargo.drain();
                            return;
                        }
                        var ts = typeof payload === "number" ? tasks.splice(0, payload) : tasks.splice(0);
                        var ds = _map(ts, function(task) {
                            return task.data;
                        });
                        if (cargo.empty) cargo.empty();
                        working = true;
                        worker(ds, function() {
                            working = false;
                            var args = arguments;
                            _each(ts, function(data) {
                                if (data.callback) {
                                    data.callback.apply(null, args);
                                }
                            });
                            process();
                        });
                    },
                    length: function() {
                        return tasks.length;
                    },
                    running: function() {
                        return working;
                    }
                };
                return cargo;
            };
            var _console_fn = function(name) {
                return function(fn) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    fn.apply(null, args.concat([ function(err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (typeof console !== "undefined") {
                            if (err) {
                                if (console.error) {
                                    console.error(err);
                                }
                            } else if (console[name]) {
                                _each(args, function(x) {
                                    console[name](x);
                                });
                            }
                        }
                    } ]));
                };
            };
            async.log = _console_fn("log");
            async.dir = _console_fn("dir");
            async.memoize = function(fn, hasher) {
                var memo = {};
                var queues = {};
                hasher = hasher || function(x) {
                    return x;
                };
                var memoized = function() {
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    var key = hasher.apply(null, args);
                    if (key in memo) {
                        callback.apply(null, memo[key]);
                    } else if (key in queues) {
                        queues[key].push(callback);
                    } else {
                        queues[key] = [ callback ];
                        fn.apply(null, args.concat([ function() {
                            memo[key] = arguments;
                            var q = queues[key];
                            delete queues[key];
                            for (var i = 0, l = q.length; i < l; i++) {
                                q[i].apply(null, arguments);
                            }
                        } ]));
                    }
                };
                memoized.memo = memo;
                memoized.unmemoized = fn;
                return memoized;
            };
            async.unmemoize = function(fn) {
                return function() {
                    return (fn.unmemoized || fn).apply(null, arguments);
                };
            };
            async.times = function(count, iterator, callback) {
                var counter = [];
                for (var i = 0; i < count; i++) {
                    counter.push(i);
                }
                return async.map(counter, iterator, callback);
            };
            async.timesSeries = function(count, iterator, callback) {
                var counter = [];
                for (var i = 0; i < count; i++) {
                    counter.push(i);
                }
                return async.mapSeries(counter, iterator, callback);
            };
            async.compose = function() {
                var fns = Array.prototype.reverse.call(arguments);
                return function() {
                    var that = this;
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    async.reduce(fns, args, function(newargs, fn, cb) {
                        fn.apply(that, newargs.concat([ function() {
                            var err = arguments[0];
                            var nextargs = Array.prototype.slice.call(arguments, 1);
                            cb(err, nextargs);
                        } ]));
                    }, function(err, results) {
                        callback.apply(that, [ err ].concat(results));
                    });
                };
            };
            var _applyEach = function(eachfn, fns) {
                var go = function() {
                    var that = this;
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    return eachfn(fns, function(fn, cb) {
                        fn.apply(that, args.concat([ cb ]));
                    }, callback);
                };
                if (arguments.length > 2) {
                    var args = Array.prototype.slice.call(arguments, 2);
                    return go.apply(this, args);
                } else {
                    return go;
                }
            };
            async.applyEach = doParallel(_applyEach);
            async.applyEachSeries = doSeries(_applyEach);
            async.forever = function(fn, callback) {
                function next(err) {
                    if (err) {
                        if (callback) {
                            return callback(err);
                        }
                        throw err;
                    }
                    fn(next);
                }
                next();
            };
            if (typeof define !== "undefined" && define.amd) {
                define([], function() {
                    return async;
                });
            } else if (typeof module !== "undefined" && module.exports) {
                module.exports = async;
            } else {
                root.async = async;
            }
        })();
        return module.exports;
    });
    define("outcome/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var EventEmitter = require("events/index.js").EventEmitter, globalEmitter = global.outcomeEmitter = global.outcomeEmitter ? global.outcomeEmitter : new EventEmitter;
        var Chain = function(listeners) {
            if (!listeners) listeners = {};
            var runFn = function(event, callback, args) {
                if (!!listeners[callback].emit) {
                    listeners[callback].emit.apply(listeners[callback], [ event ].concat(args));
                } else {
                    listeners[callback].apply(this, args);
                }
            };
            var runErr = function(args) {
                runFn("error", "error", args);
                globalEmitter.emit("handledError", args[0]);
            };
            var fn = function() {
                var args = Array.apply(null, arguments), orgArgs = arguments;
                if (listeners.callback) {
                    listeners.callback.apply(this, args);
                }
                if (listeners.handle) {
                    listeners.handle.apply(listeners, args);
                } else {
                    var e = args.shift();
                    if (e) {
                        runErr.call(this, [ e ]);
                    } else if (listeners.success) {
                        runFn.call(this, "complete", "success", args);
                    }
                }
            };
            var oldToString = fn.toString;
            fn.toString = function() {
                var str = [ "outcome()" ];
                if (listeners.error) {
                    str.push("\n.e(", String(listeners.error), ")");
                }
                if (listeners.success) {
                    str.push("\n.s(", String(listeners.success), ")");
                }
                return str.join("");
            };
            fn.listeners = listeners;
            fn.done = function(fn) {
                return fn.callback(fn);
            };
            fn.handle = function(value) {
                return _copy({
                    handle: value
                });
            };
            fn.vine = function() {
                return fn.handle(function(resp) {
                    if (resp.errors) {
                        this.error(resp.errors);
                    } else {
                        this.success(resp.result);
                    }
                });
            };
            fn.callback = function(value) {
                return _copy({
                    callback: value
                });
            };
            fn.success = fn.s = function(value) {
                return _copy({
                    success: value
                });
            };
            fn.error = fn.e = function(value) {
                return _copy({
                    error: value
                });
            };
            fn.throwError = function(err) {
                if (!globalEmitter.emit("unhandledError", err) && !listeners.callback) throw err;
            };
            if (!listeners.error) {
                listeners.error = function(err) {
                    fn.throwError(err);
                };
            }
            function _copy(childListeners) {
                for (var type in listeners) {
                    if (childListeners[type]) continue;
                    childListeners[type] = listeners[type];
                }
                return Chain(childListeners);
            }
            return fn;
        };
        module.exports = function(listeners) {
            return Chain(listeners);
        };
        module.exports.on = function() {
            globalEmitter.on.apply(globalEmitter, arguments);
        };
        module.exports.once = function() {
            globalEmitter.once.apply(globalEmitter, arguments);
        };
        var chain = Chain();
        Object.keys(chain).forEach(function(prop) {
            module.exports[prop] = function() {
                var child = Chain();
                return child[prop].apply(child, arguments);
            };
        });
        module.exports.logAllErrors = function(v) {
            if (v) {
                globalEmitter.on("handledError", onGlobalError);
            } else {
                globalEmitter.removeListener("handledError", onGlobalError);
            }
        };
        function onGlobalError(e) {
            console.error(e.stack);
        }
        if (typeof window != "undefined") {
            window.outcome = module.exports;
        }
        return module.exports;
    });
    define("sift/sift.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var _convertDotToSubObject = function(keyParts, value) {
                var subObject = {}, currentValue = subObject;
                for (var i = 0, n = keyParts.length - 1; i < n; i++) {
                    currentValue = currentValue[keyParts[i]] = {};
                }
                currentValue[keyParts[i]] = value;
                return subObject;
            };
            var _queryParser = new function() {
                var priority = this.priority = function(statement, data) {
                    var exprs = statement.exprs, priority = 0;
                    for (var i = 0, n = exprs.length; i < n; i++) {
                        var expr = exprs[i], p;
                        if (!~(p = expr.e(expr.v, _comparable(data), data))) return -1;
                        priority += p;
                    }
                    return priority;
                };
                var parse = this.parse = function(statement, key) {
                    if (!statement) statement = {
                        $eq: statement
                    };
                    var testers = [];
                    if (statement.constructor == Object) {
                        for (var k in statement) {
                            var operator = !!_testers[k] ? k : "$trav", value = statement[k], exprValue = value;
                            if (TRAV_OP[operator]) {
                                if (~k.indexOf(".")) {
                                    var keyParts = k.split(".");
                                    k = keyParts.shift();
                                    exprValue = value = _convertDotToSubObject(keyParts, value);
                                }
                                if (value instanceof Array) {
                                    exprValue = [];
                                    for (var i = value.length; i--; ) {
                                        exprValue.push(parse(value[i]));
                                    }
                                } else {
                                    exprValue = parse(value, k);
                                }
                            }
                            testers.push(_getExpr(operator, k, exprValue));
                        }
                    } else {
                        testers.push(_getExpr("$eq", k, statement));
                    }
                    var stmt = {
                        exprs: testers,
                        k: key,
                        test: function(value) {
                            return !!~stmt.priority(value);
                        },
                        priority: function(value) {
                            return priority(stmt, value);
                        }
                    };
                    return stmt;
                };
                var TRAV_OP = {
                    $and: true,
                    $or: true,
                    $nor: true,
                    $trav: true,
                    $not: true
                };
                function _comparable(value) {
                    if (value instanceof Date) {
                        return value.getTime();
                    } else {
                        return value;
                    }
                }
                function btop(value) {
                    return value ? 0 : -1;
                }
                var _testers = {
                    $eq: function(a, b) {
                        return btop(a.test(b));
                    },
                    $ne: function(a, b) {
                        return btop(!a.test(b));
                    },
                    $lt: function(a, b) {
                        return btop(a > b);
                    },
                    $gt: function(a, b) {
                        return btop(a < b);
                    },
                    $lte: function(a, b) {
                        return btop(a >= b);
                    },
                    $gte: function(a, b) {
                        return btop(a <= b);
                    },
                    $exists: function(a, b) {
                        return btop(a == !!b);
                    },
                    $in: function(a, b) {
                        if (b instanceof Array) {
                            for (var i = b.length; i--; ) {
                                if (~a.indexOf(b[i])) return i;
                            }
                        } else {
                            return btop(~a.indexOf(b));
                        }
                        return -1;
                    },
                    $not: function(a, b) {
                        if (!a.test) throw new Error("$not test should include an expression, not a value. Use $ne instead.");
                        return btop(!a.test(b));
                    },
                    $type: function(a, b, org) {
                        return org ? btop(org instanceof a || org.constructor == a) : -1;
                    },
                    $nin: function(a, b) {
                        return ~_testers.$in(a, b) ? -1 : 0;
                    },
                    $mod: function(a, b) {
                        return b % a[0] == a[1] ? 0 : -1;
                    },
                    $all: function(a, b) {
                        for (var i = a.length; i--; ) {
                            if (b.indexOf(a[i]) == -1) return -1;
                        }
                        return 0;
                    },
                    $size: function(a, b) {
                        return b ? btop(a == b.length) : -1;
                    },
                    $or: function(a, b) {
                        var i = a.length, p, n = i;
                        for (; i--; ) {
                            if (~priority(a[i], b)) {
                                return i;
                            }
                        }
                        return btop(n == 0);
                    },
                    $nor: function(a, b) {
                        var i = a.length, n = i;
                        for (; i--; ) {
                            if (~priority(a[i], b)) {
                                return -1;
                            }
                        }
                        return 0;
                    },
                    $and: function(a, b) {
                        for (var i = a.length; i--; ) {
                            if (!~priority(a[i], b)) {
                                return -1;
                            }
                        }
                        return 0;
                    },
                    $trav: function(a, b) {
                        if (b instanceof Array) {
                            for (var i = b.length; i--; ) {
                                var subb = b[i];
                                if (subb[a.k] && ~priority(a, subb[a.k])) return i;
                            }
                            return -1;
                        }
                        return b ? priority(a, b[a.k]) : -1;
                    }
                };
                var _prepare = {
                    $eq: function(a) {
                        var fn;
                        if (a instanceof RegExp) {
                            return a;
                        } else if (a instanceof Function) {
                            fn = a;
                        } else {
                            fn = function(b) {
                                if (b instanceof Array) {
                                    return ~b.indexOf(a);
                                } else {
                                    return a == b;
                                }
                            };
                        }
                        return {
                            test: fn
                        };
                    },
                    $ne: function(a) {
                        return _prepare.$eq(a);
                    }
                };
                var _getExpr = function(type, key, value) {
                    var v = _comparable(value);
                    return {
                        k: key,
                        v: _prepare[type] ? _prepare[type](v) : v,
                        e: _testers[type]
                    };
                };
            };
            var getSelector = function(selector) {
                if (!selector) {
                    return function(value) {
                        return value;
                    };
                } else if (typeof selector == "function") {
                    return selector;
                }
                throw new Error("Unknown sift selector " + selector);
            };
            var sifter = function(query, selector) {
                var filter = _queryParser.parse(query);
                var self = function(target) {
                    var sifted = [], results = [], value, priority;
                    for (var i = 0, n = target.length; i < n; i++) {
                        value = selector(target[i]);
                        if (!~(priority = filter.priority(value))) continue;
                        sifted.push({
                            value: value,
                            priority: priority
                        });
                    }
                    sifted.sort(function(a, b) {
                        return a.priority > b.priority ? -1 : 1;
                    });
                    var values = Array(sifted.length);
                    for (var i = sifted.length; i--; ) {
                        values[i] = sifted[i].value;
                    }
                    return values;
                };
                self.test = filter.test;
                self.score = filter.priority;
                self.query = query;
                return self;
            };
            var sift = function(query, target, rawSelector) {
                if (typeof target != "object") {
                    rawSelector = target;
                    target = undefined;
                }
                var sft = sifter(query, getSelector(rawSelector));
                if (target) return sft(target);
                return sft;
            };
            if (typeof module != "undefined" && typeof module.exports != "undefined") {
                module.exports = sift;
            } else if (typeof window != "undefined") {
                window.sift = sift;
            }
        })();
        return module.exports;
    });
    define("underscore/underscore.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var root = this;
            var previousUnderscore = root._;
            var breaker = {};
            var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
            var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
            var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
            var _ = function(obj) {
                if (obj instanceof _) return obj;
                if (!(this instanceof _)) return new _(obj);
                this._wrapped = obj;
            };
            if (typeof exports !== "undefined") {
                if (typeof module !== "undefined" && module.exports) {
                    exports = module.exports = _;
                }
                exports._ = _;
            } else {
                root._ = _;
            }
            _.VERSION = "1.4.4";
            var each = _.each = _.forEach = function(obj, iterator, context) {
                if (obj == null) return;
                if (nativeForEach && obj.forEach === nativeForEach) {
                    obj.forEach(iterator, context);
                } else if (obj.length === +obj.length) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        if (iterator.call(context, obj[i], i, obj) === breaker) return;
                    }
                } else {
                    for (var key in obj) {
                        if (_.has(obj, key)) {
                            if (iterator.call(context, obj[key], key, obj) === breaker) return;
                        }
                    }
                }
            };
            _.map = _.collect = function(obj, iterator, context) {
                var results = [];
                if (obj == null) return results;
                if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
                each(obj, function(value, index, list) {
                    results[results.length] = iterator.call(context, value, index, list);
                });
                return results;
            };
            var reduceError = "Reduce of empty array with no initial value";
            _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
                var initial = arguments.length > 2;
                if (obj == null) obj = [];
                if (nativeReduce && obj.reduce === nativeReduce) {
                    if (context) iterator = _.bind(iterator, context);
                    return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
                }
                each(obj, function(value, index, list) {
                    if (!initial) {
                        memo = value;
                        initial = true;
                    } else {
                        memo = iterator.call(context, memo, value, index, list);
                    }
                });
                if (!initial) throw new TypeError(reduceError);
                return memo;
            };
            _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
                var initial = arguments.length > 2;
                if (obj == null) obj = [];
                if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
                    if (context) iterator = _.bind(iterator, context);
                    return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
                }
                var length = obj.length;
                if (length !== +length) {
                    var keys = _.keys(obj);
                    length = keys.length;
                }
                each(obj, function(value, index, list) {
                    index = keys ? keys[--length] : --length;
                    if (!initial) {
                        memo = obj[index];
                        initial = true;
                    } else {
                        memo = iterator.call(context, memo, obj[index], index, list);
                    }
                });
                if (!initial) throw new TypeError(reduceError);
                return memo;
            };
            _.find = _.detect = function(obj, iterator, context) {
                var result;
                any(obj, function(value, index, list) {
                    if (iterator.call(context, value, index, list)) {
                        result = value;
                        return true;
                    }
                });
                return result;
            };
            _.filter = _.select = function(obj, iterator, context) {
                var results = [];
                if (obj == null) return results;
                if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
                each(obj, function(value, index, list) {
                    if (iterator.call(context, value, index, list)) results[results.length] = value;
                });
                return results;
            };
            _.reject = function(obj, iterator, context) {
                return _.filter(obj, function(value, index, list) {
                    return !iterator.call(context, value, index, list);
                }, context);
            };
            _.every = _.all = function(obj, iterator, context) {
                iterator || (iterator = _.identity);
                var result = true;
                if (obj == null) return result;
                if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
                each(obj, function(value, index, list) {
                    if (!(result = result && iterator.call(context, value, index, list))) return breaker;
                });
                return !!result;
            };
            var any = _.some = _.any = function(obj, iterator, context) {
                iterator || (iterator = _.identity);
                var result = false;
                if (obj == null) return result;
                if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
                each(obj, function(value, index, list) {
                    if (result || (result = iterator.call(context, value, index, list))) return breaker;
                });
                return !!result;
            };
            _.contains = _.include = function(obj, target) {
                if (obj == null) return false;
                if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
                return any(obj, function(value) {
                    return value === target;
                });
            };
            _.invoke = function(obj, method) {
                var args = slice.call(arguments, 2);
                var isFunc = _.isFunction(method);
                return _.map(obj, function(value) {
                    return (isFunc ? method : value[method]).apply(value, args);
                });
            };
            _.pluck = function(obj, key) {
                return _.map(obj, function(value) {
                    return value[key];
                });
            };
            _.where = function(obj, attrs, first) {
                if (_.isEmpty(attrs)) return first ? null : [];
                return _[first ? "find" : "filter"](obj, function(value) {
                    for (var key in attrs) {
                        if (attrs[key] !== value[key]) return false;
                    }
                    return true;
                });
            };
            _.findWhere = function(obj, attrs) {
                return _.where(obj, attrs, true);
            };
            _.max = function(obj, iterator, context) {
                if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                    return Math.max.apply(Math, obj);
                }
                if (!iterator && _.isEmpty(obj)) return -Infinity;
                var result = {
                    computed: -Infinity,
                    value: -Infinity
                };
                each(obj, function(value, index, list) {
                    var computed = iterator ? iterator.call(context, value, index, list) : value;
                    computed >= result.computed && (result = {
                        value: value,
                        computed: computed
                    });
                });
                return result.value;
            };
            _.min = function(obj, iterator, context) {
                if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                    return Math.min.apply(Math, obj);
                }
                if (!iterator && _.isEmpty(obj)) return Infinity;
                var result = {
                    computed: Infinity,
                    value: Infinity
                };
                each(obj, function(value, index, list) {
                    var computed = iterator ? iterator.call(context, value, index, list) : value;
                    computed < result.computed && (result = {
                        value: value,
                        computed: computed
                    });
                });
                return result.value;
            };
            _.shuffle = function(obj) {
                var rand;
                var index = 0;
                var shuffled = [];
                each(obj, function(value) {
                    rand = _.random(index++);
                    shuffled[index - 1] = shuffled[rand];
                    shuffled[rand] = value;
                });
                return shuffled;
            };
            var lookupIterator = function(value) {
                return _.isFunction(value) ? value : function(obj) {
                    return obj[value];
                };
            };
            _.sortBy = function(obj, value, context) {
                var iterator = lookupIterator(value);
                return _.pluck(_.map(obj, function(value, index, list) {
                    return {
                        value: value,
                        index: index,
                        criteria: iterator.call(context, value, index, list)
                    };
                }).sort(function(left, right) {
                    var a = left.criteria;
                    var b = right.criteria;
                    if (a !== b) {
                        if (a > b || a === void 0) return 1;
                        if (a < b || b === void 0) return -1;
                    }
                    return left.index < right.index ? -1 : 1;
                }), "value");
            };
            var group = function(obj, value, context, behavior) {
                var result = {};
                var iterator = lookupIterator(value || _.identity);
                each(obj, function(value, index) {
                    var key = iterator.call(context, value, index, obj);
                    behavior(result, key, value);
                });
                return result;
            };
            _.groupBy = function(obj, value, context) {
                return group(obj, value, context, function(result, key, value) {
                    (_.has(result, key) ? result[key] : result[key] = []).push(value);
                });
            };
            _.countBy = function(obj, value, context) {
                return group(obj, value, context, function(result, key) {
                    if (!_.has(result, key)) result[key] = 0;
                    result[key]++;
                });
            };
            _.sortedIndex = function(array, obj, iterator, context) {
                iterator = iterator == null ? _.identity : lookupIterator(iterator);
                var value = iterator.call(context, obj);
                var low = 0, high = array.length;
                while (low < high) {
                    var mid = low + high >>> 1;
                    iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
                }
                return low;
            };
            _.toArray = function(obj) {
                if (!obj) return [];
                if (_.isArray(obj)) return slice.call(obj);
                if (obj.length === +obj.length) return _.map(obj, _.identity);
                return _.values(obj);
            };
            _.size = function(obj) {
                if (obj == null) return 0;
                return obj.length === +obj.length ? obj.length : _.keys(obj).length;
            };
            _.first = _.head = _.take = function(array, n, guard) {
                if (array == null) return void 0;
                return n != null && !guard ? slice.call(array, 0, n) : array[0];
            };
            _.initial = function(array, n, guard) {
                return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
            };
            _.last = function(array, n, guard) {
                if (array == null) return void 0;
                if (n != null && !guard) {
                    return slice.call(array, Math.max(array.length - n, 0));
                } else {
                    return array[array.length - 1];
                }
            };
            _.rest = _.tail = _.drop = function(array, n, guard) {
                return slice.call(array, n == null || guard ? 1 : n);
            };
            _.compact = function(array) {
                return _.filter(array, _.identity);
            };
            var flatten = function(input, shallow, output) {
                each(input, function(value) {
                    if (_.isArray(value)) {
                        shallow ? push.apply(output, value) : flatten(value, shallow, output);
                    } else {
                        output.push(value);
                    }
                });
                return output;
            };
            _.flatten = function(array, shallow) {
                return flatten(array, shallow, []);
            };
            _.without = function(array) {
                return _.difference(array, slice.call(arguments, 1));
            };
            _.uniq = _.unique = function(array, isSorted, iterator, context) {
                if (_.isFunction(isSorted)) {
                    context = iterator;
                    iterator = isSorted;
                    isSorted = false;
                }
                var initial = iterator ? _.map(array, iterator, context) : array;
                var results = [];
                var seen = [];
                each(initial, function(value, index) {
                    if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
                        seen.push(value);
                        results.push(array[index]);
                    }
                });
                return results;
            };
            _.union = function() {
                return _.uniq(concat.apply(ArrayProto, arguments));
            };
            _.intersection = function(array) {
                var rest = slice.call(arguments, 1);
                return _.filter(_.uniq(array), function(item) {
                    return _.every(rest, function(other) {
                        return _.indexOf(other, item) >= 0;
                    });
                });
            };
            _.difference = function(array) {
                var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
                return _.filter(array, function(value) {
                    return !_.contains(rest, value);
                });
            };
            _.zip = function() {
                var args = slice.call(arguments);
                var length = _.max(_.pluck(args, "length"));
                var results = new Array(length);
                for (var i = 0; i < length; i++) {
                    results[i] = _.pluck(args, "" + i);
                }
                return results;
            };
            _.object = function(list, values) {
                if (list == null) return {};
                var result = {};
                for (var i = 0, l = list.length; i < l; i++) {
                    if (values) {
                        result[list[i]] = values[i];
                    } else {
                        result[list[i][0]] = list[i][1];
                    }
                }
                return result;
            };
            _.indexOf = function(array, item, isSorted) {
                if (array == null) return -1;
                var i = 0, l = array.length;
                if (isSorted) {
                    if (typeof isSorted == "number") {
                        i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
                    } else {
                        i = _.sortedIndex(array, item);
                        return array[i] === item ? i : -1;
                    }
                }
                if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
                for (; i < l; i++) if (array[i] === item) return i;
                return -1;
            };
            _.lastIndexOf = function(array, item, from) {
                if (array == null) return -1;
                var hasIndex = from != null;
                if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
                    return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
                }
                var i = hasIndex ? from : array.length;
                while (i--) if (array[i] === item) return i;
                return -1;
            };
            _.range = function(start, stop, step) {
                if (arguments.length <= 1) {
                    stop = start || 0;
                    start = 0;
                }
                step = arguments[2] || 1;
                var len = Math.max(Math.ceil((stop - start) / step), 0);
                var idx = 0;
                var range = new Array(len);
                while (idx < len) {
                    range[idx++] = start;
                    start += step;
                }
                return range;
            };
            _.bind = function(func, context) {
                if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
                var args = slice.call(arguments, 2);
                return function() {
                    return func.apply(context, args.concat(slice.call(arguments)));
                };
            };
            _.partial = function(func) {
                var args = slice.call(arguments, 1);
                return function() {
                    return func.apply(this, args.concat(slice.call(arguments)));
                };
            };
            _.bindAll = function(obj) {
                var funcs = slice.call(arguments, 1);
                if (funcs.length === 0) funcs = _.functions(obj);
                each(funcs, function(f) {
                    obj[f] = _.bind(obj[f], obj);
                });
                return obj;
            };
            _.memoize = function(func, hasher) {
                var memo = {};
                hasher || (hasher = _.identity);
                return function() {
                    var key = hasher.apply(this, arguments);
                    return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
                };
            };
            _.delay = function(func, wait) {
                var args = slice.call(arguments, 2);
                return setTimeout(function() {
                    return func.apply(null, args);
                }, wait);
            };
            _.defer = function(func) {
                return _.delay.apply(_, [ func, 1 ].concat(slice.call(arguments, 1)));
            };
            _.throttle = function(func, wait) {
                var context, args, timeout, result;
                var previous = 0;
                var later = function() {
                    previous = new Date;
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            };
            _.debounce = function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) result = func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) result = func.apply(context, args);
                    return result;
                };
            };
            _.once = function(func) {
                var ran = false, memo;
                return function() {
                    if (ran) return memo;
                    ran = true;
                    memo = func.apply(this, arguments);
                    func = null;
                    return memo;
                };
            };
            _.wrap = function(func, wrapper) {
                return function() {
                    var args = [ func ];
                    push.apply(args, arguments);
                    return wrapper.apply(this, args);
                };
            };
            _.compose = function() {
                var funcs = arguments;
                return function() {
                    var args = arguments;
                    for (var i = funcs.length - 1; i >= 0; i--) {
                        args = [ funcs[i].apply(this, args) ];
                    }
                    return args[0];
                };
            };
            _.after = function(times, func) {
                if (times <= 0) return func();
                return function() {
                    if (--times < 1) {
                        return func.apply(this, arguments);
                    }
                };
            };
            _.keys = nativeKeys || function(obj) {
                if (obj !== Object(obj)) throw new TypeError("Invalid object");
                var keys = [];
                for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
                return keys;
            };
            _.values = function(obj) {
                var values = [];
                for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
                return values;
            };
            _.pairs = function(obj) {
                var pairs = [];
                for (var key in obj) if (_.has(obj, key)) pairs.push([ key, obj[key] ]);
                return pairs;
            };
            _.invert = function(obj) {
                var result = {};
                for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
                return result;
            };
            _.functions = _.methods = function(obj) {
                var names = [];
                for (var key in obj) {
                    if (_.isFunction(obj[key])) names.push(key);
                }
                return names.sort();
            };
            _.extend = function(obj) {
                each(slice.call(arguments, 1), function(source) {
                    if (source) {
                        for (var prop in source) {
                            obj[prop] = source[prop];
                        }
                    }
                });
                return obj;
            };
            _.pick = function(obj) {
                var copy = {};
                var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                each(keys, function(key) {
                    if (key in obj) copy[key] = obj[key];
                });
                return copy;
            };
            _.omit = function(obj) {
                var copy = {};
                var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                for (var key in obj) {
                    if (!_.contains(keys, key)) copy[key] = obj[key];
                }
                return copy;
            };
            _.defaults = function(obj) {
                each(slice.call(arguments, 1), function(source) {
                    if (source) {
                        for (var prop in source) {
                            if (obj[prop] == null) obj[prop] = source[prop];
                        }
                    }
                });
                return obj;
            };
            _.clone = function(obj) {
                if (!_.isObject(obj)) return obj;
                return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
            };
            _.tap = function(obj, interceptor) {
                interceptor(obj);
                return obj;
            };
            var eq = function(a, b, aStack, bStack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a instanceof _) a = a._wrapped;
                if (b instanceof _) b = b._wrapped;
                var className = toString.call(a);
                if (className != toString.call(b)) return false;
                switch (className) {
                  case "[object String]":
                    return a == String(b);
                  case "[object Number]":
                    return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
                  case "[object Date]":
                  case "[object Boolean]":
                    return +a == +b;
                  case "[object RegExp]":
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
                if (typeof a != "object" || typeof b != "object") return false;
                var length = aStack.length;
                while (length--) {
                    if (aStack[length] == a) return bStack[length] == b;
                }
                aStack.push(a);
                bStack.push(b);
                var size = 0, result = true;
                if (className == "[object Array]") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                        }
                    }
                } else {
                    var aCtor = a.constructor, bCtor = b.constructor;
                    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                        return false;
                    }
                    for (var key in a) {
                        if (_.has(a, key)) {
                            size++;
                            if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (_.has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                aStack.pop();
                bStack.pop();
                return result;
            };
            _.isEqual = function(a, b) {
                return eq(a, b, [], []);
            };
            _.isEmpty = function(obj) {
                if (obj == null) return true;
                if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
                for (var key in obj) if (_.has(obj, key)) return false;
                return true;
            };
            _.isElement = function(obj) {
                return !!(obj && obj.nodeType === 1);
            };
            _.isArray = nativeIsArray || function(obj) {
                return toString.call(obj) == "[object Array]";
            };
            _.isObject = function(obj) {
                return obj === Object(obj);
            };
            each([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(name) {
                _["is" + name] = function(obj) {
                    return toString.call(obj) == "[object " + name + "]";
                };
            });
            if (!_.isArguments(arguments)) {
                _.isArguments = function(obj) {
                    return !!(obj && _.has(obj, "callee"));
                };
            }
            if (typeof /./ !== "function") {
                _.isFunction = function(obj) {
                    return typeof obj === "function";
                };
            }
            _.isFinite = function(obj) {
                return isFinite(obj) && !isNaN(parseFloat(obj));
            };
            _.isNaN = function(obj) {
                return _.isNumber(obj) && obj != +obj;
            };
            _.isBoolean = function(obj) {
                return obj === true || obj === false || toString.call(obj) == "[object Boolean]";
            };
            _.isNull = function(obj) {
                return obj === null;
            };
            _.isUndefined = function(obj) {
                return obj === void 0;
            };
            _.has = function(obj, key) {
                return hasOwnProperty.call(obj, key);
            };
            _.noConflict = function() {
                root._ = previousUnderscore;
                return this;
            };
            _.identity = function(value) {
                return value;
            };
            _.times = function(n, iterator, context) {
                var accum = Array(n);
                for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
                return accum;
            };
            _.random = function(min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            };
            var entityMap = {
                escape: {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#x27;",
                    "/": "&#x2F;"
                }
            };
            entityMap.unescape = _.invert(entityMap.escape);
            var entityRegexes = {
                escape: new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"),
                unescape: new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")
            };
            _.each([ "escape", "unescape" ], function(method) {
                _[method] = function(string) {
                    if (string == null) return "";
                    return ("" + string).replace(entityRegexes[method], function(match) {
                        return entityMap[method][match];
                    });
                };
            });
            _.result = function(object, property) {
                if (object == null) return null;
                var value = object[property];
                return _.isFunction(value) ? value.call(object) : value;
            };
            _.mixin = function(obj) {
                each(_.functions(obj), function(name) {
                    var func = _[name] = obj[name];
                    _.prototype[name] = function() {
                        var args = [ this._wrapped ];
                        push.apply(args, arguments);
                        return result.call(this, func.apply(_, args));
                    };
                });
            };
            var idCounter = 0;
            _.uniqueId = function(prefix) {
                var id = ++idCounter + "";
                return prefix ? prefix + id : id;
            };
            _.templateSettings = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /<%=([\s\S]+?)%>/g,
                escape: /<%-([\s\S]+?)%>/g
            };
            var noMatch = /(.)^/;
            var escapes = {
                "'": "'",
                "\\": "\\",
                "\r": "r",
                "\n": "n",
                "	": "t",
                "\u2028": "u2028",
                "\u2029": "u2029"
            };
            var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
            _.template = function(text, data, settings) {
                var render;
                settings = _.defaults({}, settings, _.templateSettings);
                var matcher = new RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g");
                var index = 0;
                var source = "__p+='";
                text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
                    source += text.slice(index, offset).replace(escaper, function(match) {
                        return "\\" + escapes[match];
                    });
                    if (escape) {
                        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                    }
                    if (interpolate) {
                        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                    }
                    if (evaluate) {
                        source += "';\n" + evaluate + "\n__p+='";
                    }
                    index = offset + match.length;
                    return match;
                });
                source += "';\n";
                if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
                source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
                try {
                    render = new Function(settings.variable || "obj", "_", source);
                } catch (e) {
                    e.source = source;
                    throw e;
                }
                if (data) return render(data, _);
                var template = function(data) {
                    return render.call(this, data, _);
                };
                template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
                return template;
            };
            _.chain = function(obj) {
                return _(obj).chain();
            };
            var result = function(obj) {
                return this._chain ? _(obj).chain() : obj;
            };
            _.mixin(_);
            each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(name) {
                var method = ArrayProto[name];
                _.prototype[name] = function() {
                    var obj = this._wrapped;
                    method.apply(obj, arguments);
                    if ((name == "shift" || name == "splice") && obj.length === 0) delete obj[0];
                    return result.call(this, obj);
                };
            });
            each([ "concat", "join", "slice" ], function(name) {
                var method = ArrayProto[name];
                _.prototype[name] = function() {
                    return result.call(this, method.apply(this._wrapped, arguments));
                };
            });
            _.extend(_.prototype, {
                chain: function() {
                    this._chain = true;
                    return this;
                },
                value: function() {
                    return this._wrapped;
                }
            });
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Router;
            Router = require("beanpoll/lib/router.js");
            exports.Messenger = require("beanpoll/lib/concrete/messenger.js");
            exports.Director = require("beanpoll/lib/concrete/director.js");
            exports.Request = require("beanpoll/lib/request.js");
            exports.Response = require("beanpoll/lib/concrete/response.js");
            exports.router = function() {
                return new Router;
            };
        }).call(this);
        return module.exports;
    });
    define("vine/index.js", function(require, module, exports, __dirname, __filename) {
        var outcome = require("outcome/lib/index.js");
        function combineArrays(c1, c2, target, property) {
            var c1p = c1[property];
            c2p = c2[property];
            if (!c1p && !c2p) return;
            c1p = c1p || [];
            c2p = c2p || [];
            c1p = c1p instanceof Array ? c1p : [ c1p ];
            c2p = c2p instanceof Array ? c2p : [ c2p ];
            target[property] = c1p.concat(c2p);
        }
        var Vine = {
            setApi: function(request) {
                request.api = Vine.api(request);
                return request;
            },
            api: function(request, methods, data) {
                if (!data) data = {};
                var methods = methods || {};
                var invoker = {
                    error: function(err) {
                        if (!data.errors) data.errors = [];
                        if (err.errors) {
                            for (var i = err.errors.length; i--; ) {
                                invoker.error(err.errors[i]);
                            }
                            return this;
                        }
                        var error = {
                            message: err.message ? err.message : err
                        };
                        if (err.code) error.code = err.code;
                        if (err.statusCode) error.code = err.statusCode;
                        if (err.tags) error.tags = err.tags;
                        data.errors.push(error);
                        return this;
                    },
                    type: function(type) {
                        if (!arguments.length) return data.type;
                        data.type = type;
                        return this;
                    },
                    warn: function(message) {
                        if (!arguments.length) return data.warnings;
                        if (!data.warnings) data.warnings = [];
                        data.warnings.push({
                            message: message
                        });
                        return this;
                    },
                    success: function(message) {
                        if (!arguments.length) return data.messages;
                        if (!data.messages) data.messages = [];
                        data.messages.push({
                            message: message
                        });
                        return this;
                    },
                    message: function() {
                        return invoker.success.apply(invoker, arguments);
                    },
                    combine: function(api) {
                        var thisData = data, thatData = api.data || api, newData = {};
                        for (var i in thisData) newData[i] = thisData;
                        combineArrays(thisData, thatData, newData, "errors");
                        combineArrays(thisData, thatData, newData, "warnings");
                        combineArrays(thisData, thatData, newData, "messages");
                        combineArrays(thisData, thatData, newData, "result");
                        return Vine.api(null, null, newData);
                    },
                    redirect: function(to) {
                        if (!arguments.length) return data.redirect;
                        data.redirect = to;
                        return this;
                    },
                    method: function(method) {
                        if (!arguments.length) return data.method;
                        data.method = method;
                        return this;
                    },
                    list: function(data) {
                        this.result(data);
                        return this.method("list");
                    },
                    add: function(data) {
                        this.result(data);
                        return this.method("add");
                    },
                    remove: function(data) {
                        this.result(data);
                        return this.method("remove");
                    },
                    update: function(data) {
                        this.result(data);
                        return this.method("update");
                    },
                    result: function(result) {
                        if (!arguments.length) return data.result;
                        data.result = result;
                        return this;
                    },
                    results: function(result) {
                        if (!arguments.length) return data.result;
                        if (!(data.result instanceof Array)) data.result = [];
                        data.result.push(result);
                        return this;
                    },
                    ttl: function(ttl) {
                        if (ttl > -1) data.ttl = ttl;
                        return this;
                    },
                    end: function(target) {
                        if (target) if (target.end) {
                            target.end(data);
                        } else if (typeof target == "function") {
                            target(data);
                        }
                        return data;
                    },
                    fn: function(fn) {
                        if (data.errors) {
                            target(data.errors.length > 1 ? data.errors : data.errors[0]);
                        } else {
                            fn(null, data.result);
                        }
                    },
                    onOutcome: function(resp, messages) {
                        if (messages) {
                            messages.resp = resp;
                        }
                        if (!messages) messages = {};
                        return outcome.error(function(err) {
                            invoker.error(messages.error || (err ? err.message : err));
                        }).success(function(result) {
                            invoker.result(messages.success || result);
                        }).done(function() {
                            if (messages.resp) invoker.end(messages.resp);
                        });
                    },
                    toJSON: function() {
                        return invoker.data;
                    }
                };
                invoker.data = data;
                return invoker;
            }
        };
        exports.api = Vine.api;
        var v = Vine.api();
        Object.keys(v).forEach(function(method) {
            exports[method] = function() {
                var api = exports.api();
                return api[method].apply(api, arguments);
            };
        });
        return module.exports;
    });
    define("verify/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var defaults = require("verify/lib/defaults.js"), Check = require("verify/lib/check.js"), Testers = require("verify/lib/testers.js");
        module.exports = function() {
            var testers = new Testers;
            var self = {
                register: function(name, message) {
                    return testers.register(name, message);
                },
                tester: function() {
                    return testers.create();
                },
                get: function(name) {
                    return testers.get(name);
                },
                check: function(target) {
                    return new Check({
                        testers: testers,
                        target: target
                    });
                },
                that: function(target) {
                    return this.check(target);
                }
            };
            defaults.plugin(self);
            return self;
        };
        return module.exports;
    });
    define("linen/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Linen, ModelPlugin, Resource, mannequin, outcome;
            mannequin = require("mannequin/lib/index.js");
            ModelPlugin = require("linen/lib/modelPlugin.js");
            outcome = require("outcome/lib/index.js");
            Resource = require("linen/lib/resource.js");
            Linen = function() {
                function Linen(options) {
                    this.options = options;
                    this.schemas = mannequin.dictionary();
                    this._schemasByCollectionName = {};
                    this.resource = new Resource(options, this);
                    if (options.schemas) {
                        this._registerSchemas(options.schemas);
                    }
                    this._registerRoutes(options.routes);
                }
                Linen.prototype.collection = function(collectionName, query) {
                    if (query == null) {
                        query = {};
                    }
                    return this._schemasByCollectionName[collectionName].createCollection(collectionName, {
                        query: query
                    });
                };
                Linen.prototype._registerSchemas = function(schemas) {
                    var key, _results;
                    _results = [];
                    for (key in schemas) {
                        _results.push(this._registerSchema(key, schemas[key]));
                    }
                    return _results;
                };
                Linen.prototype._registerRoutes = function(routes) {
                    var builder, collectionName, route, _results;
                    _results = [];
                    for (collectionName in routes) {
                        route = routes[collectionName];
                        builder = this._schemasByCollectionName[collectionName] = this._registerSchema(route.name, route.schema);
                        delete route.schema;
                        builder.route = route;
                        _results.push(builder.route.root = true);
                    }
                    return _results;
                };
                Linen.prototype._registerSchema = function(name, schema) {
                    return ModelPlugin.plugin(this, this.schemas.register(name, schema));
                };
                return Linen;
            }();
            module.exports = function(options) {
                return new Linen(options);
            };
        }).call(this);
        return module.exports;
    });
    define("events/index.js", function(require, module, exports, __dirname, __filename) {
        var isArray = Array.isArray;
        function EventEmitter() {}
        exports.EventEmitter = EventEmitter;
        var defaultMaxListeners = 100;
        EventEmitter.prototype.setMaxListeners = function(n) {
            if (!this._events) this._events = {};
            this._events.maxListeners = n;
        };
        EventEmitter.prototype.emit = function() {
            var type = arguments[0];
            if (type === "error") {
                if (!this._events || !this._events.error || isArray(this._events.error) && !this._events.error.length) {
                    if (arguments[1] instanceof Error) {
                        throw arguments[1];
                    } else {
                        throw new Error("Uncaught, unspecified 'error' event.");
                    }
                    return false;
                }
            }
            if (!this._events) return false;
            var handler = this._events[type];
            if (!handler) return false;
            if (typeof handler == "function") {
                switch (arguments.length) {
                  case 1:
                    handler.call(this);
                    break;
                  case 2:
                    handler.call(this, arguments[1]);
                    break;
                  case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                  default:
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    handler.apply(this, args);
                }
                return true;
            } else if (isArray(handler)) {
                var l = arguments.length;
                var args = new Array(l - 1);
                for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                var listeners = handler.slice();
                for (var i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].apply(this, args);
                }
                return true;
            } else {
                return false;
            }
        };
        EventEmitter.prototype.addListener = function(type, listener) {
            if ("function" !== typeof listener) {
                throw new Error("addListener only takes instances of Function");
            }
            if (!this._events) this._events = {};
            this.emit("newListener", type, listener);
            if (!this._events[type]) {
                this._events[type] = listener;
            } else if (isArray(this._events[type])) {
                this._events[type].push(listener);
                if (!this._events[type].warned) {
                    var m;
                    if (this._events.maxListeners !== undefined) {
                        m = this._events.maxListeners;
                    } else {
                        m = defaultMaxListeners;
                    }
                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                        console.trace();
                    }
                }
            } else {
                this._events[type] = [ this._events[type], listener ];
            }
            return this;
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function(type, listener) {
            if ("function" !== typeof listener) {
                throw new Error(".once only takes instances of Function");
            }
            var self = this;
            function g() {
                self.removeListener(type, g);
                listener.apply(this, arguments);
            }
            g.listener = listener;
            self.on(type, g);
            return this;
        };
        EventEmitter.prototype.removeListener = function(type, listener) {
            if ("function" !== typeof listener) {
                throw new Error("removeListener only takes instances of Function");
            }
            if (!this._events || !this._events[type]) return this;
            var list = this._events[type];
            if (isArray(list)) {
                var position = -1;
                for (var i = 0, length = list.length; i < length; i++) {
                    if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                        position = i;
                        break;
                    }
                }
                if (position < 0) return this;
                list.splice(position, 1);
                if (list.length == 0) delete this._events[type];
            } else if (list === listener || list.listener && list.listener === listener) {
                delete this._events[type];
            }
            return this;
        };
        EventEmitter.prototype.removeAllListeners = function(type) {
            if (arguments.length === 0) {
                this._events = {};
                return this;
            }
            if (type && this._events && this._events[type]) this._events[type] = null;
            return this;
        };
        EventEmitter.prototype.listeners = function(type) {
            if (!this._events) this._events = {};
            if (!this._events[type]) this._events[type] = [];
            if (!isArray(this._events[type])) {
                this._events[type] = [ this._events[type] ];
            }
            return this._events[type];
        };
        return module.exports;
    });
    define("beanpoll/lib/router.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var RequestBuilder, Router, collectPlugin, crema, disposable, plugins, pullPlugin, pushPlugin, _;
            crema = require("crema/lib/index.js");
            RequestBuilder = require("beanpoll/lib/request.js").Builder;
            pushPlugin = require("beanpoll/lib/push/plugin.js");
            pullPlugin = require("beanpoll/lib/pull/plugin.js");
            collectPlugin = require("beanpoll/lib/collect/plugin.js");
            plugins = require("beanpoll/lib/plugins.js");
            disposable = require("disposable/lib/index.js");
            _ = require("underscore/underscore.js");
            Router = function() {
                function Router() {
                    this.directors = {};
                    this.parse = crema;
                    this._requestBuilder = new RequestBuilder(this);
                    this._plugins = new plugins(this);
                    this.use(pushPlugin);
                    this.use(pullPlugin);
                    this.use(collectPlugin);
                }
                Router.prototype.use = function(plugin) {
                    return this._plugins.add(plugin);
                };
                Router.prototype.using = function() {
                    return this._plugins.using();
                };
                Router.prototype.on = function(routeOrListeners, ops, callback) {
                    var listenerDisposables, route, routes, type, _fn, _i, _len, _this = this;
                    if (!callback) {
                        callback = ops;
                        ops = {};
                    }
                    listenerDisposables = disposable.create();
                    if (typeof routeOrListeners === "object" && !callback) {
                        for (type in routeOrListeners) {
                            listenerDisposables.add(this.on(type, routeOrListeners[type]));
                        }
                        return listenerDisposables;
                    }
                    if (typeof routeOrListeners === "string") {
                        routes = crema(routeOrListeners);
                    } else if (routeOrListeners instanceof Array) {
                        routes = routeOrListeners;
                    } else {
                        routes = [ routeOrListeners ];
                    }
                    _fn = function(route) {
                        if (ops.type) {
                            route.type = ops.type;
                        }
                        if (ops.tags) {
                            _.extend(route.tags, ops.tags);
                        }
                        listenerDisposables.add(_this.director(route.type).addListener(route, callback));
                        return _this._plugins.newListener({
                            route: route,
                            callback: callback
                        });
                    };
                    for (_i = 0, _len = routes.length; _i < _len; _i++) {
                        route = routes[_i];
                        _fn(route);
                    }
                    return listenerDisposables;
                };
                Router.prototype.director = function(type) {
                    var director;
                    director = this.directors[type];
                    if (!director) {
                        throw new Error("director " + type + " does not exist");
                    }
                    return director;
                };
                Router.prototype.paths = function(ops) {
                    var director, name, paths;
                    paths = [];
                    for (name in this.directors) {
                        director = this.directors[name];
                        paths = paths.concat(director.paths(ops));
                    }
                    return paths;
                };
                Router.prototype.dispatch = function(requestWriter) {
                    return this.director(requestWriter.type).dispatch(requestWriter);
                };
                Router.prototype.req = function() {
                    return this.request.apply(this, arguments);
                };
                Router.prototype.request = function(path, query, headers) {
                    return this._requestBuilder.clean().path(typeof path === "string" ? crema.parsePath(path) : path).query(query).headers(headers);
                };
                return Router;
            }();
            module.exports = Router;
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/concrete/messenger.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var LinkedQueue, Response, _, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            LinkedQueue = require("beanpoll/lib/collections/linkedQueue.js");
            Response = require("beanpoll/lib/concrete/response.js");
            _ = require("underscore/underscore.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(request, first, director) {
                    var _this = this;
                    this.request = request;
                    this.first = first;
                    this.director = director;
                    this.request = this.request;
                    this.router = director.router;
                    this.from = request.from;
                    _Class.__super__.constructor.call(this, first);
                    this.response = new Response(this);
                    this.response.reader().dump(function() {
                        return _this.request.callback.apply(_this.request, arguments);
                    }, this.request.headers);
                }
                _Class.prototype.start = function() {
                    return this.next();
                };
                _Class.prototype.data = function(name) {
                    var obj, _i, _len;
                    if (arguments.length === 0) {
                        return _.extend({}, this.request.sanitized, this.current.params, this.request.query);
                    } else if (arguments.length > 1) {
                        obj = {};
                        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
                            name = arguments[_i];
                            obj[name] = this.data(name);
                        }
                        obj;
                    }
                    return this.request.sanitized[name] || this.current.params[name] || (this.request.query ? this.request.query[name] : null);
                };
                _Class.prototype.flattenData = function(reset) {
                    var allData, cur;
                    if (this._allData && !reset) {
                        return this._allData;
                    }
                    cur = this.current;
                    allData = _.defaults(cur.params, this.request.query);
                    cur = cur.getNextSibling();
                    while (cur) {
                        _.defaults(allData, cur.params);
                        cur = cur.getNextSibling();
                    }
                    return this._allData = allData;
                };
                _Class.prototype._onNext = function(middleware, args) {
                    var e;
                    if (args && args.length) {
                        if (args[0]) {
                            return _onError(args[0]);
                        } else {
                            _onNextData(args[1]);
                        }
                    }
                    this.request.params = middleware.params;
                    try {
                        this.request.cache(this.hasNext);
                        return this._next(middleware, args);
                    } catch (_error) {
                        e = _error;
                        return this.response.error(e);
                    }
                };
                _Class.prototype._next = function(middleware) {
                    return middleware.listener(this);
                };
                _Class.prototype._onError = function(error) {};
                _Class.prototype._onNextData = function() {};
                return _Class;
            }(LinkedQueue);
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/concrete/director.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Messenger, RequestMiddleware, comerr, crema, dolce;
            dolce = require("dolce/lib/index.js");
            RequestMiddleware = require("beanpoll/lib/concrete/middleware.js");
            crema = require("crema/lib/index.js");
            Messenger = require("beanpoll/lib/concrete/messenger.js");
            comerr = require("comerr/lib/index.js");
            module.exports = function() {
                _Class.prototype.passive = false;
                function _Class(name, router) {
                    this.name = name;
                    this.router = router;
                    this._collection = dolce.collection();
                }
                _Class.prototype.numListeners = function(path, ops) {
                    return this._collection.get(path, ops).chains.length;
                };
                _Class.prototype.dispatch = function(requestWriter) {
                    var chain, chains, e, messanger, middleware, numChains, numRunning, oldAck, requestReader, _i, _len;
                    try {
                        chains = this.getListeners(requestWriter, void 0, !this.passive);
                    } catch (_error) {
                        e = _error;
                        return requestWriter.callback(new Error("" + this.name + " " + e.message));
                    }
                    numChains = chains.length;
                    numRunning = numChains;
                    oldAck = requestWriter.callback;
                    requestWriter.running = !!numChains;
                    requestWriter.callback = function() {
                        requestWriter.running = !!--numRunning;
                        if (oldAck) {
                            return oldAck.apply(this, Array.apply(null, arguments).concat([ numRunning, numChains ]));
                        }
                    };
                    if (!!!chains.length && !this.passive) {
                        requestWriter.callback(new comerr.NotFound("" + this.name + ' route "' + crema.stringifySegments(requestWriter.path.segments) + '" does not exist'));
                        return this;
                    }
                    for (_i = 0, _len = chains.length; _i < _len; _i++) {
                        chain = chains[_i];
                        requestReader = requestWriter.reader();
                        middleware = RequestMiddleware.wrap(chain, requestWriter.pre, requestWriter.next, this);
                        messanger = this._newMessenger(requestReader, middleware);
                        messanger.start();
                    }
                    return this;
                };
                _Class.prototype.addListener = function(route, callback) {
                    disposable;
                    var disposable, oldCallback;
                    if (route.tags.one) {
                        oldCallback = callback;
                        callback = function() {
                            oldCallback.apply(this, arguments);
                            return disposable.dispose();
                        };
                    }
                    this._validateListener(route, callback);
                    return disposable = this._collection.add(route, callback);
                };
                _Class.prototype.removeListeners = function(route) {
                    return this._collection.remove(route.path, {
                        tags: route.tags
                    });
                };
                _Class.prototype.paths = function(ops) {
                    var listener, _i, _len, _ref, _results;
                    _ref = this._collection.find(ops);
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        listener = _ref[_i];
                        _results.push({
                            tags: listener.tags,
                            type: this.name,
                            value: listener.path,
                            segments: listener.segments
                        });
                    }
                    return _results;
                };
                _Class.prototype.listenerQuery = function(ops) {
                    var filter, key, tag;
                    filter = [];
                    for (key in ops.filter) {
                        tag = {};
                        tag[key] = ops.filter[key];
                        filter.push(tag);
                    }
                    return {
                        $or: [ {
                            $and: filter
                        }, {
                            unfilterable: {
                                $exists: true
                            }
                        } ]
                    };
                };
                _Class.prototype.getListeners = function(request, expand, throwError) {
                    return this._collection.get(request.path, {
                        siftTags: this.listenerQuery(request),
                        expand: expand,
                        throwErrors: throwError
                    }).chains;
                };
                _Class.prototype._newMessenger = function(request, middleware) {
                    return new Messenger(request, middleware, this);
                };
                _Class.prototype._validateListener = function(route) {
                    var listeners;
                    if (this.passive) {
                        return;
                    }
                    listeners = this._collection.get(route.path, {
                        tags: route.tags,
                        expand: false
                    });
                    if (!!listeners.length) {
                        throw new Error('Route "' + route.path.value + '" already exists');
                    }
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/request.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Reader, RequestReader, RequestWriter, Writer, outcome, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Reader = require("beanpoll/lib/io/reader.js");
            Writer = require("beanpoll/lib/io/writer.js");
            outcome = require("outcome/lib/index.js");
            exports.Reader = RequestReader = function(_super) {
                __extends(RequestReader, _super);
                function RequestReader(writer, from, path, query, sanitized, headers, filter, callback) {
                    this.writer = writer;
                    this.from = from;
                    this.path = path;
                    this.query = query;
                    this.sanitized = sanitized != null ? sanitized : {};
                    this.headers = headers != null ? headers : {};
                    this.filter = filter != null ? filter : {};
                    this.callback = callback != null ? callback : null;
                    RequestReader.__super__.constructor.call(this, writer);
                }
                return RequestReader;
            }(Reader);
            exports.Writer = RequestWriter = function(_super) {
                __extends(RequestWriter, _super);
                function RequestWriter(_ops) {
                    this._ops = _ops;
                    this.next = _ops.next;
                    this.pre = _ops.pre;
                    this.path = _ops.path;
                    this.type = _ops.type;
                    this.from = _ops.from;
                    this.query = _ops.query;
                    this.filter = _ops.filter || {};
                    this.headers = _ops.headers;
                    this.callback = _ops.callback;
                    this.sanitized = _ops.sanitized;
                    RequestWriter.__super__.constructor.call(this);
                }
                RequestWriter.prototype.reader = function() {
                    return new RequestReader(this, this.from, this.path, this.query, this.sanitized, this.headers, this.filter, this.callback);
                };
                return RequestWriter;
            }(Writer);
            exports.Builder = function() {
                function _Class(router) {
                    this.router = router;
                    this.clean();
                }
                _Class.prototype.options = function(value) {
                    if (!arguments.length) {
                        return this._ops;
                    }
                    this._ops = value || {};
                    return this;
                };
                _Class.prototype.clean = function() {
                    this._ops = {};
                    return this.from(this.router);
                };
                _Class.prototype.tag = function(keyOrTags, value) {
                    return this._objParam("filter", arguments, function(value) {
                        if (typeof value === "boolean") {
                            return {
                                $exists: value
                            };
                        }
                        return value;
                    });
                };
                _Class.prototype.filter = function(keyOrTag, value) {
                    return this.tag(keyOrTag, value);
                };
                _Class.prototype.headers = function(value) {
                    return this.header(value);
                };
                _Class.prototype.header = function(keyOrHeaders, value) {
                    return this._objParam("headers", arguments);
                };
                _Class.prototype.type = function(value) {
                    return this._param("type", arguments);
                };
                _Class.prototype.from = function(value) {
                    return this._param("from", arguments);
                };
                _Class.prototype.to = function(value) {
                    return this._param("to", arguments);
                };
                _Class.prototype.path = function(value) {
                    return this._param("path", arguments);
                };
                _Class.prototype.query = function(value) {
                    return this._param("query", arguments);
                };
                _Class.prototype.sanitized = function(value) {
                    return this._param("sanitized", arguments);
                };
                _Class.prototype.response = function(callback) {
                    return this._param("response", arguments);
                };
                _Class.prototype.error = function(callback) {
                    return this._param("error", arguments);
                };
                _Class.prototype.success = function(callback) {
                    return this._param("success", arguments);
                };
                _Class.prototype.next = function(middleware) {
                    return this._param("next", arguments);
                };
                _Class.prototype.pre = function(middleware) {
                    return this._param("pre", arguments);
                };
                _Class.prototype.dispatch = function(type) {
                    var writer;
                    this._ops.callback = outcome({
                        error: this.error(),
                        success: this.success(),
                        callback: this.response()
                    });
                    if (type) {
                        this.type(type);
                    }
                    writer = new RequestWriter(this._ops);
                    this.router.dispatch(writer);
                    return writer;
                };
                _Class.prototype.hasListeners = function() {
                    return this.exists();
                };
                _Class.prototype.exists = function() {
                    return !!this.listeners().length;
                };
                _Class.prototype.listeners = function() {
                    return this.router.director(this.type()).getListeners({
                        path: this._ops.path,
                        filter: this._ops.filter
                    }, false);
                };
                _Class.prototype._param = function(name, args) {
                    if (!args.length) {
                        return this._ops[name];
                    }
                    this._ops[name] = args[0];
                    return this;
                };
                _Class.prototype._objParam = function(name, args, getValue) {
                    var key, keyOrObj, value;
                    if (!args.length) {
                        return this._ops[name];
                    }
                    if (!this._ops[name]) {
                        this._ops[name] = {};
                    }
                    keyOrObj = args[0];
                    value = args[1];
                    if (typeof keyOrObj === "string") {
                        if (args.length === 1) {
                            return this._ops.headers[keyOrObj];
                        }
                        this._ops[name][keyOrObj] = getValue ? getValue(value) : value;
                    } else {
                        for (key in keyOrObj) {
                            this._objParam(name, [ key, keyOrObj[key] ], getValue);
                        }
                    }
                    return this;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/concrete/response.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Reader, Response, ResponseReader, Writer, outcome, _, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Writer = require("beanpoll/lib/io/writer.js");
            Reader = require("beanpoll/lib/io/reader.js");
            _ = require("underscore/underscore.js");
            outcome = require("outcome/lib/index.js");
            ResponseReader = function(_super) {
                __extends(ResponseReader, _super);
                function ResponseReader() {
                    _ref = ResponseReader.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                ResponseReader.prototype._listenTo = function() {
                    return ResponseReader.__super__._listenTo.call(this).concat("headers");
                };
                ResponseReader.prototype._listen = function() {
                    var _this = this;
                    ResponseReader.__super__._listen.call(this);
                    return this.on("headers", function(headers) {
                        return _this.headers = headers;
                    });
                };
                ResponseReader.prototype._dumpCached = function(pipedReader) {
                    if (this.headers) {
                        pipedReader.emit("headers", this.headers);
                    }
                    return ResponseReader.__super__._dumpCached.call(this, pipedReader);
                };
                return ResponseReader;
            }(Reader);
            module.exports = Response = function(_super) {
                __extends(Response, _super);
                function Response(messenger) {
                    var _this = this;
                    this.messenger = messenger;
                    Response.__super__.constructor.call(this);
                    this._headers = {};
                    this.once("data", function() {
                        return _this.sendHeaders();
                    });
                    this.once("end", function() {
                        return _this.sendHeaders();
                    });
                }
                Response.prototype.header = function(typeOrObj, value) {
                    if (typeof typeOrObj === "object") {
                        _.extend(this._headers, typeOrObj);
                    } else {
                        this._headers[typeOrObj] = value;
                    }
                    return this;
                };
                Response.prototype.headers = function(typeOrObj, value) {
                    return this.header(typeOrObj, value);
                };
                Response.prototype.success = function(success) {
                    var _this = this;
                    if (!this._outcome) {
                        this._outcome = outcome.error(function(err) {
                            return _this.error(err);
                        });
                    }
                    return this._outcome.success(success);
                };
                Response.prototype.sendHeaders = function() {
                    if (this.sentHeaders) {
                        return this;
                    }
                    this.sentHeaders = true;
                    this.emit("headers", this._headers);
                    return this;
                };
                Response.prototype.reader = function() {
                    return new ResponseReader(this);
                };
                return Response;
            }(Writer);
            Writer.prototype.writable = true;
        }).call(this);
        return module.exports;
    });
    define("verify/lib/defaults.js", function(require, module, exports, __dirname, __filename) {
        var validator = require("validator/lib/index.js"), check = validator.check;
        exports.plugin = function(verify) {
            var reg = {
                email: "isEmail",
                url: "isUrl",
                ip: "isIP",
                alpha: "isAlpha",
                numeric: "isNumeric",
                "int": "isInt",
                lowercase: "isLowercase",
                uppercase: "isUppercase",
                decimal: "isDecimal",
                "float": "isFloat",
                "null": "null",
                notNull: "notNull",
                notEmpter: "notEmpty",
                array: "isArray",
                creditCard: "isCreditCard"
            };
            Object.keys(reg).forEach(function(key) {
                var fn = reg[key];
                verify.register(key).is(function(value) {
                    try {
                        var chain = check(value);
                        chain[fn].call(chain, value);
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
            });
        };
        return module.exports;
    });
    define("verify/lib/check.js", function(require, module, exports, __dirname, __filename) {
        var structr = require("structr/lib/index.js"), comerr = require("comerr/lib/index.js");
        module.exports = structr({
            __construct: function(options) {
                this._target = options.target;
                this._testers = options.testers;
                this.errors = [];
                this.success = true;
            },
            onError: function(fn) {
                this._onError = fn;
                return this;
            },
            onSuccess: function(fn) {
                this._onSuccess = fn;
                return this;
            },
            has: function() {
                if (!this.success) return this;
                var keys = Array.prototype.slice.call(arguments, 0), testers = this._testers2 = this._getTesters(keys), errors = this.errors = [];
                for (var i = testers.length; i--; ) {
                    var t = testers[i];
                    if (!t.tester.test(this._target[t.key])) {
                        errors.push(new comerr.Invalid(t.tester.message() || '"' + t.key + '" is invalid', {
                            field: t.key
                        }));
                    }
                }
                if (errors.length) {
                    this.success = false;
                    if (this._onError) {
                        var err = new comerr.Invalid(this._getErrorMessage(errors), {
                            all: errors
                        });
                        this._onError(err);
                    }
                } else {
                    if (this._onSuccess) this._onSuccess(null, true);
                }
                return this;
            },
            sanitize: function() {
                if (!this.success) return this;
                var testers = this._testers2;
                for (var i = testers.length; i--; ) {
                    var t = testers[i];
                    t.tester.sanitize(this._target[t.key]);
                }
                return this;
            },
            _getTesters: function(keys) {
                var testers = [];
                for (var i = keys.length; i--; ) {
                    var keyParts = keys[i].split(":"), key = keyParts[0], type = keyParts[1] || key;
                    testers.push({
                        tester: this._testers.get(type),
                        key: key
                    });
                }
                return testers;
            },
            _getErrorMessage: function(errors) {
                return errors.map(function(error) {
                    return error.message;
                }).join("\n");
            }
        });
        return module.exports;
    });
    define("verify/lib/testers.js", function(require, module, exports, __dirname, __filename) {
        var structr = require("structr/lib/index.js"), Tester = require("verify/lib/tester.js");
        module.exports = structr({
            __construct: function() {
                this._source = {};
                this.register();
            },
            register: function(name, message) {
                return this._source[name] = this.create(name, message);
            },
            create: function(name, message) {
                return new Tester({
                    testers: this,
                    name: name,
                    message: message
                });
            },
            get: function(key) {
                return this._source[key] || this.register(key);
            }
        });
        return module.exports;
    });
    define("mannequin/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            exports.Schema = require("mannequin/lib/schema.js");
            exports.dictionary = require("mannequin/lib/dictionary.js");
        }).call(this);
        return module.exports;
    });
    define("linen/lib/modelPlugin.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Collection, ModelPlugin, async, createLinenModel, cstep, dref, outcome, _, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            Collection = require("bindable/lib/index.js").Collection;
            cstep = require("cstep/lib/index.js");
            dref = require("dref/lib/index.js");
            outcome = require("outcome/lib/index.js");
            async = require("async/lib/async.js");
            _ = require("underscore/underscore.js");
            Collection = require("linen/lib/collection.js");
            createLinenModel = require("linen/lib/model.js");
            ModelPlugin = function() {
                function ModelPlugin(linen, modelBuilder) {
                    this.linen = linen;
                    this.modelBuilder = modelBuilder;
                    this._modelBuilderCreateCollection = __bind(this._modelBuilderCreateCollection, this);
                    this.schema = modelBuilder.schema;
                    this.route = {};
                    this._setup();
                }
                ModelPlugin.prototype.createCollection = function(path, options) {
                    if (options == null) {
                        options = {};
                    }
                    options.modelClass = options.modelClass || this.modelClass;
                    return new Collection(path, this, options);
                };
                ModelPlugin.prototype._modelBuilderCreateCollection = function(item, definition) {
                    var collectionName, route, schemaName, _ref;
                    schemaName = definition.options.$ref;
                    collectionName = definition.key;
                    route = _.extend({}, this.route, definition.options.$route || {});
                    route.modelClass = (_ref = definition.schemaRef()) != null ? _ref.linenBuilder.modelClass : void 0;
                    return this.createCollection(collectionName, route);
                };
                ModelPlugin.prototype._setup = function() {
                    var modelBuilder, self;
                    self = this;
                    modelBuilder = this.modelBuilder = this.schema.modelBuilder;
                    modelBuilder.createCollection = this._modelBuilderCreateCollection;
                    this.modelClass = createLinenModel(this, modelBuilder.getClass());
                    return modelBuilder.setClass(this.modelClass);
                };
                return ModelPlugin;
            }();
            exports.plugin = function(linen, modelBuilder) {
                var plugin;
                plugin = new ModelPlugin(linen, modelBuilder);
                modelBuilder.schema.linenBuilder = plugin;
                modelBuilder.linenBuilder = plugin;
                return plugin;
            };
        }).call(this);
        return module.exports;
    });
    define("linen/lib/resource.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async, outcome, toarray, type, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            toarray = require("toarray/index.js");
            outcome = require("outcome/lib/index.js");
            async = require("async/lib/async.js");
            type = require("type-component/index.js");
            module.exports = function() {
                function _Class(options, linen) {
                    this.linen = linen;
                    this._request = __bind(this._request, this);
                    this.transport = options.transport;
                    this.host = options.host;
                    this._mapPath = options.mapPath || this._defaultMapPath;
                    this._mapResponse = options.mapResponse || this._defaultMapResponse;
                    this._mapItem = options.mapItem || this._defaultMapItem;
                    this._mapCollection = options.mapCollection || this._defaultMapCollection;
                    this._cargo = async.queue(this._request, Math.max(3, options.requestLimit || 10));
                }
                _Class.prototype.request = function(options, callback) {
                    return this._cargo.push(options, callback);
                };
                _Class.prototype._request = function(options, callback) {
                    var body, collection, item, method, o, one, params, path, query, _this = this;
                    method = options.method;
                    item = options.item;
                    collection = options.collection;
                    params = options.params || {};
                    query = options.query || {};
                    body = JSON.parse(JSON.stringify(options.body || {}));
                    one = options.one;
                    path = this._mapPath({
                        method: method,
                        item: item,
                        params: params,
                        collection: collection
                    });
                    o = outcome.e(callback);
                    return this.transport.request({
                        host: this.host,
                        path: path,
                        method: method,
                        query: query,
                        body: body
                    }, o.s(function(response) {
                        return _this._mapResponse(response, o.s(function(result) {
                            if (one) {
                                return callback(null, _this._mapItem(result));
                            } else {
                                return callback(null, _this._mapCollection(result));
                            }
                        }));
                    }));
                };
                _Class.prototype._defaultMapResponse = function(response, next) {
                    var _ref;
                    if (response.error || response.errors) {
                        return next(((_ref = response.errors) != null ? _ref[0] : void 0) || response.error);
                    }
                    return next(null, response.result || response);
                };
                _Class.prototype._defaultMapItem = function(result) {
                    return toarray(result).shift();
                };
                _Class.prototype._defaultMapCollection = function(result) {
                    return toarray(result);
                };
                _Class.prototype._defaultMapPath = function(options) {
                    var paths;
                    paths = [];
                    if (options.collection) {
                        this._mapPathPart(options.collection, options, paths, true);
                        if (options.item) {
                            paths.unshift(options.item.get("_id"));
                        }
                    } else if (options.item) {
                        this._mapPathPart(options.item, options, paths, true);
                    }
                    paths = paths.reverse();
                    return paths.join("/");
                };
                _Class.prototype._mapPathPart = function(currentItem, options, paths, root) {
                    var croute, inh, inherit, _id;
                    if (!currentItem) {
                        return paths;
                    }
                    croute = currentItem.route();
                    if (currentItem.__isCollection) {
                        if (root) {
                            paths.push(croute.collectionName);
                        } else {
                            return this._mapPathPart(currentItem.parent, options, paths);
                        }
                    } else {
                        if (_id = currentItem.get("_id")) {
                            paths.push(_id);
                        }
                        inherit = croute.inherit;
                        inh = false;
                        if (type(inherit) === "array") {
                            inh = !!~inherit.indexOf(options.method.toLowerCase());
                        } else {
                            inh = !!inherit;
                        }
                        if (inh) {
                            paths.push(croute.collectionName);
                        } else {
                            paths.push(croute.path);
                            return paths;
                        }
                    }
                    return this._mapPathPart(currentItem.parent, options, paths, false);
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("crema/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var strscanner = require("strscanner/lib/index.js");
        function parseTokens(route) {
            return route.replace(/\s+/g, " ").split(" ");
        }
        function splitOr(tokens, route, routes, start) {
            for (var i = start, n = tokens.length; i < n; i++) {
                var token = tokens[i];
                if (token.toLowerCase() == "or") {
                    var orRoute = route.concat();
                    orRoute.pop();
                    orRoute.push(tokens[++i]);
                    splitOr(tokens, orRoute, routes, i + 1);
                    while (i < n - 1 && tokens[i + 1].toLowerCase() == "or") {
                        i += 2;
                    }
                } else {
                    route.push(token);
                }
            }
            routes.push(route);
            return routes;
        }
        function scanGroups(scanner) {
            var buffer = "(";
            while (scanner.cchar() != ")") {
                buffer += scanner.cchar();
                scanner.nextChar();
                if (scanner.cchar() == "(") {
                    scanner.nextChar();
                    buffer += scanGroups(scanner);
                }
            }
            scanner.nextChar();
            return buffer + ")";
        }
        function parsePath(path) {
            var scanner = strscanner(path), segs = [];
            while (!scanner.eof()) {
                var cchar = scanner.cchar();
                if (cchar != "/") {
                    var isParam = false, name = null, test = null;
                    if (cchar == ":") {
                        isParam = true;
                        cchar = scanner.nextChar();
                    }
                    if (cchar != "(") {
                        name = scanner.nextUntil(/[\/(]/);
                        cchar = scanner.cchar();
                    }
                    if (cchar == "(") {
                        scanner.nextChar();
                        test = new RegExp(scanGroups(scanner));
                    }
                    segs.push({
                        value: name,
                        param: isParam,
                        test: test
                    });
                }
                scanner.nextChar();
            }
            if (!segs.length) {
                segs.push({
                    value: "",
                    param: false,
                    test: null
                });
            }
            return {
                value: module.exports.stringifySegments(segs),
                segments: segs
            };
        }
        function parseRoutePaths(rootExpr, tokens, start) {
            var n = tokens.length, currentExpression = rootExpr;
            currentExpression.path = parsePath(tokens[n - 1]);
            for (var i = n - 2; i >= start; i--) {
                var token = tokens[i], buffer = [];
                if (token == "->") continue;
                currentExpression = currentExpression.thru = {
                    path: parsePath(token)
                };
            }
            return rootExpr;
        }
        function fixRoute(route, grammar) {
            for (var expr in grammar) {
                route = route.replace(grammar[expr], expr);
            }
            return route;
        }
        function parseRoute(route, grammar) {
            if (grammar) {
                route = fixRoute(route, grammar);
            }
            var tokens = parseTokens(route), routes = splitOr(tokens, [], [], 0), currentRoute, expressions = [];
            for (var i = 0, n = routes.length; i < n; i++) {
                var routeTokens = routes[i], expr = {
                    tags: {}
                }, start = 0;
                if (routeTokens[0].match(/^\w+$/) && routeTokens[1] != "->" && routeTokens.length - 1) {
                    start = 1;
                    expr.type = routeTokens[0];
                }
                for (var j = start, jn = routeTokens.length; j < jn; j++) {
                    var routeToken = routeTokens[j];
                    if (routeToken.substr(0, 1) == "-") {
                        var tagParts = routeToken.split("=");
                        var tagName = tagParts[0].substr(1);
                        expr.tags[tagName] = tagParts.length > 1 ? tagParts[1] : true;
                        continue;
                    }
                    expressions.push(parseRoutePaths(expr, routeTokens, j));
                    break;
                }
            }
            return expressions;
        }
        module.exports = function(source, grammar) {
            return parseRoute(source, grammar);
        };
        module.exports.grammar = function(grammar) {
            return {
                fixRoute: function(source) {
                    return fixRoute(source, grammar);
                },
                parse: function(source) {
                    return parseRoute(source, grammar);
                }
            };
        };
        module.exports.parsePath = parsePath;
        module.exports.stringifySegments = function(segments, params, ignoreParams) {
            var segs = segments.map(function(seg) {
                var buffer = "";
                if (seg.param) buffer += ":";
                if (seg.value) buffer += seg.value;
                if (seg.test) buffer += seg.test.source;
                return buffer;
            }).join("/");
            if (segs.substr(0, 1) != ".") return "/" + segs;
            return segs;
        };
        module.exports.stringifyTags = function(tags) {
            var stringified = [];
            for (var tagName in tags) {
                var tagValue = tags[tagName];
                if (tagValue === true) {
                    stringified.push("-" + tagName);
                } else {
                    stringified.push("-" + tagName + "=" + tagValue);
                }
            }
            return stringified.join(" ");
        };
        module.exports.stringifyThru = function(cthru) {
            var thru = [];
            while (cthru) {
                thru.push(module.exports.stringifySegments(cthru.path.segments));
                cthru = cthru.thru;
            }
            return thru.reverse().join(" -> ");
        };
        module.exports.stringify = function(route, includeType) {
            var stringified = [];
            if (route.type && includeType !== false) stringified.push(route.type);
            var tags = module.exports.stringifyTags(route.tags), thru = module.exports.stringifyThru(route);
            if (tags.length) stringified.push(tags);
            stringified.push(thru);
            return stringified.join(" ");
        };
        return module.exports;
    });
    define("beanpoll/lib/push/plugin.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Director;
            Director = require("beanpoll/lib/push/director.js");
            module.exports = function(router) {
                var director;
                director = new Director("push", router);
                return {
                    name: director.name,
                    director: director,
                    newListener: function(listener) {
                        return router.request("new/listener").tag("private", true).query(listener).push();
                    },
                    router: {
                        push: function(path, query, headers) {
                            return this.request(path, query, headers).push(null);
                        }
                    },
                    request: {
                        push: function(data) {
                            var writer;
                            writer = this.dispatch(director.name);
                            if (!!arguments.length) {
                                writer.end(data);
                            }
                            return writer;
                        }
                    }
                };
            };
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/pull/plugin.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Director, outcome;
            Director = require("beanpoll/lib/pull/director.js");
            outcome = require("outcome/lib/index.js");
            module.exports = function(router) {
                var director;
                director = new Director("pull", router);
                return {
                    name: director.name,
                    director: director,
                    newListener: function(listener) {
                        if (!!listener.route.tags.pull) {
                            return router.request(listener.route.path).headers(listener.route.tags).success(listener.callback).error(function() {}).pull();
                        }
                    },
                    router: {
                        pull: function(path, query, headers, callback) {
                            return this._pull(path, query, headers, callback, director.name);
                        },
                        _pull: function(path, query, headers, callback, type) {
                            if (typeof query === "function") {
                                callback = query;
                                headers = null;
                                query = null;
                            }
                            if (typeof headers === "function") {
                                callback = headers;
                                headers = null;
                            }
                            return this.request(path, query, headers)[type](callback);
                        }
                    },
                    request: {
                        pull: function(query, callback) {
                            return this._pull(query, callback, director.name);
                        },
                        _pull: function(query, callback, type) {
                            if (typeof query === "function") {
                                callback = query;
                                query = null;
                            }
                            if (!!query) {
                                this.query(query);
                            }
                            if (!!callback) {
                                this.response(callback);
                            }
                            return this.dispatch(type);
                        }
                    }
                };
            };
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/collect/plugin.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Director, outcome;
            Director = require("beanpoll/lib/collect/director.js");
            outcome = require("outcome/lib/index.js");
            module.exports = function(router) {
                var director;
                director = new Director("collect", router);
                return {
                    name: director.name,
                    director: director,
                    router: {
                        collect: function(path, query, headers, callback) {
                            return this._pull(path, query, headers, callback, director.name);
                        }
                    },
                    newListener: function(listener) {
                        if (!!listener.route.tags.collect) {
                            return router.request(listener.route.path).headers(listener.route.tags).success(listener.callback).collect();
                        }
                    },
                    request: {
                        collect: function(query, callback) {
                            return this._pull(query, callback, director.name);
                        }
                    }
                };
            };
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/plugins.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Request, _;
            Request = require("beanpoll/lib/request.js");
            _ = require("underscore/underscore.js");
            module.exports = function() {
                function _Class(router) {
                    this.router = router;
                    this._pluginsByName = {};
                    this._using = [];
                }
                _Class.prototype.using = function() {
                    return this._using;
                };
                _Class.prototype.add = function(plugin) {
                    var mod, plg, _i, _len;
                    if (plugin instanceof Array) {
                        for (_i = 0, _len = plugin.length; _i < _len; _i++) {
                            plg = plugin[_i];
                            this.add(plg);
                        }
                        return;
                    }
                    this._using.push(plugin);
                    mod = plugin(this.router);
                    this._pluginsByName[mod.name] = mod;
                    _.extend(this.router._requestBuilder, mod.request);
                    _.extend(this.router, mod.router);
                    if (mod.director) {
                        return this.router.directors[mod.name] = mod.director;
                    }
                };
                _Class.prototype.get = function(name) {
                    return this._pluginsByName[name];
                };
                _Class.prototype.newListener = function(listener) {
                    return this._emit("newListener", listener);
                };
                _Class.prototype._emit = function(type, data) {
                    var plugin, pluginName, _results;
                    _results = [];
                    for (pluginName in this._pluginsByName) {
                        plugin = this._pluginsByName[pluginName];
                        if (plugin[type]) {
                            _results.push(plugin[type](data));
                        } else {
                            _results.push(void 0);
                        }
                    }
                    return _results;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("disposable/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var disposable = {};
            disposable.create = function() {
                var self = {}, disposables = [];
                self.add = function(disposable) {
                    if (typeof disposable == "function") {
                        var disposableFunc = disposable, args = Array.prototype.slice.call(arguments, 0);
                        args.shift();
                        disposable = {
                            dispose: function() {
                                disposableFunc.apply(null, args);
                            }
                        };
                    }
                    disposables.push(disposable);
                    return {
                        dispose: function() {
                            var i = disposables.indexOf(disposable);
                            if (i > -1) disposables.splice(i, 1);
                        }
                    };
                };
                self.addTimeout = function(timerId) {
                    return self.add(clearTimeout, timerId);
                };
                self.addInterval = function(timerId) {
                    return self.add(clearInterval, timerId);
                };
                self.dispose = function() {
                    for (var i = disposables.length; i--; ) {
                        disposables[i].dispose();
                    }
                    disposables = [];
                };
                return self;
            };
            if (typeof module != "undefined") {
                module.exports = disposable;
            }
            if (typeof window != "undefined") {
                window.disposable = disposable;
            }
        })();
        var disposable = module.exports.create();
        disposable.dispose();
        return module.exports;
    });
    define("beanpoll/lib/collections/linkedQueue.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var EventEmitter, LinkedQueue, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            EventEmitter = require("events/index.js").EventEmitter;
            module.exports = LinkedQueue = function(_super) {
                __extends(LinkedQueue, _super);
                LinkedQueue.prototype.hasNext = true;
                function LinkedQueue(first, onNext) {
                    this.first = first;
                    LinkedQueue.__super__.constructor.call(this);
                    this.last = first.getLastSibling();
                    if (onNext) {
                        this._onNext = onNext;
                    }
                }
                LinkedQueue.prototype.next = function() {
                    if (!this.hasNext) {
                        return false;
                    }
                    this._setNext();
                    this._onNext(this.current, arguments);
                    return true;
                };
                LinkedQueue.prototype.skipNext = function(count) {
                    if (count == null) {
                        count = 2;
                    }
                    if (!this.hasNext) {
                        return false;
                    }
                    while (count-- && this.hasNext) {
                        this._setNext();
                    }
                    this._onNext(this.current);
                    return true;
                };
                LinkedQueue.prototype._setNext = function() {
                    this.current = this.current ? this.current.getNextSibling() : this.first;
                    this.hasNext = this.current.getNextSibling();
                    if (!this.hasNext && !this.ended) {
                        this.ended = true;
                        return this._onEnd();
                    }
                };
                LinkedQueue.prototype._onNext = function(middleware) {};
                LinkedQueue.prototype._onEnd = function() {};
                return LinkedQueue;
            }(EventEmitter);
            module.exports = LinkedQueue;
        }).call(this);
        return module.exports;
    });
    define("dolce/lib/index.js", function(require, module, exports, __dirname, __filename) {
        exports.collection = require("dolce/lib/collection.js");
        return module.exports;
    });
    define("beanpoll/lib/concrete/middleware.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var LinkedList, Middleware, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            LinkedList = require("beanpoll/lib/collections/linkedList.js");
            module.exports = Middleware = function(_super) {
                __extends(Middleware, _super);
                function Middleware(item, director) {
                    this.director = director;
                    this.listener = item.value;
                    this.path = {
                        segments: item.cmpSegments
                    };
                    this.params = item.params;
                    this.tags = item.tags;
                }
                return Middleware;
            }(LinkedList);
            Middleware.wrap = function(chain, pre, next, director) {
                var current, item, prev, _i, _len;
                for (_i = 0, _len = chain.length; _i < _len; _i++) {
                    item = chain[_i];
                    current = new Middleware(item, director);
                    if (prev) {
                        current.addPrevSibling(prev, true);
                    }
                    prev = current;
                }
                if (typeof pre === "function") {
                    current.getFirstSibling().addPrevSibling(new Middleware({
                        value: pre,
                        params: {},
                        tags: {},
                        path: {
                            segments: []
                        }
                    }));
                }
                if (typeof next === "function") {
                    current.addNextSibling(new Middleware({
                        value: next,
                        params: {},
                        tags: {},
                        path: {
                            segments: []
                        }
                    }));
                }
                return current.getFirstSibling();
            };
        }).call(this);
        return module.exports;
    });
    define("comerr/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var DEFAULT_CODES = {
            401: "Unauthorized",
            402: "Payment Required",
            404: "Not Found",
            403: "Forbidden",
            408: "Timeout",
            423: "Locked",
            429: "Too Many Requests",
            500: "Unknown error",
            501: "Not Implemented",
            601: "Incorrect Input",
            602: "Invalid",
            604: "Already Exists",
            605: "Expired",
            606: "Unable To Connect",
            607: "Already Called",
            608: "Not Enough Info",
            609: "Incorrect Type"
        };
        exports.codes = {};
        exports.register = function(codes) {
            Object.keys(codes).forEach(function(code) {
                var name = codes[code], message = name, className = name.replace(/\s+/g, "");
                if (exports[className]) {
                    throw new Error("Error code '" + code + "' already exists.");
                }
                var Err = exports[className] = function(message, tags) {
                    if (typeof message == "object") {
                        tags = message;
                        message = null;
                    }
                    Error.call(this, message);
                    this.message = message || name;
                    this.code = code;
                    this.tags = tags;
                    this.stack = (new Error(this.message)).stack;
                };
                Err.prototype = new Error;
                Err.prototype.constructor = Err;
                Err.prototype.name = name;
                exports.codes[className] = code;
            });
        };
        exports.register(DEFAULT_CODES);
        return module.exports;
    });
    define("beanpoll/lib/io/reader.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Reader, Stream, disposable, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Stream = require("stream/index.js").Stream;
            disposable = require("disposable/lib/index.js");
            module.exports = Reader = function(_super) {
                __extends(Reader, _super);
                function Reader(source) {
                    this.source = source;
                    Reader.__super__.constructor.call(this);
                    this.setMaxListeners(0);
                    this._listen();
                }
                Reader.prototype._listenTo = function() {
                    return [ "data", "end", "error" ];
                };
                Reader.prototype._listen = function() {
                    var event, listeners, _fn, _i, _len, _ref, _this = this;
                    this._buffer = [];
                    listeners = disposable.create();
                    if (this.source) {
                        _ref = this._listenTo();
                        _fn = function(event) {
                            var onEvent;
                            onEvent = function(arg1, arg2) {
                                _this._started = true;
                                return _this.emit(event, arg1, arg2);
                            };
                            _this.source.on(event, onEvent);
                            return listeners.add(function() {
                                return _this.source.removeListener(event, onEvent);
                            });
                        };
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            event = _ref[_i];
                            _fn(event);
                        }
                    }
                    this.on("data", function(data, encoding) {
                        if (!_this._cache) {
                            return;
                        }
                        return _this._buffer.push({
                            chunk: data,
                            encoding: encoding
                        });
                    });
                    this.on("end", function() {
                        if (_this.ended) {
                            throw new Error("Cannot end more than once");
                        }
                        return _this.ended = true;
                    });
                    return this.on("error", function(err) {
                        return _this.error = err;
                    });
                };
                Reader.prototype.setEncoding = function(encoding) {
                    var _ref;
                    return (_ref = this.source) != null ? _ref.setEncoding(encoding) : void 0;
                };
                Reader.prototype.pause = function() {
                    var _ref;
                    return (_ref = this.source) != null ? typeof _ref.pause === "function" ? _ref.pause() : void 0 : void 0;
                };
                Reader.prototype.resume = function() {
                    var _ref;
                    return (_ref = this.source) != null ? typeof _ref.resume === "function" ? _ref.resume() : void 0 : void 0;
                };
                Reader.prototype.destroy = function() {
                    var _ref;
                    return (_ref = this.source) != null ? typeof _ref.destroy === "function" ? _ref.destroy() : void 0 : void 0;
                };
                Reader.prototype.destroySoon = function() {
                    var _ref;
                    return (_ref = this.source) != null ? typeof _ref.destroySoon === "function" ? _ref.destroySoon() : void 0 : void 0;
                };
                Reader.prototype.cache = function(value) {
                    if (arguments.length) {
                        this._cache = value || !!this._buffer.length;
                    }
                    return this._cache;
                };
                Reader.prototype.dump = function(callback, ops) {
                    var pipedStream, wrappedCallback;
                    if (!ops) {
                        ops = {};
                    }
                    wrappedCallback = this._dumpCallback(callback, ops);
                    pipedStream = this._started ? new Reader(this) : this;
                    wrappedCallback.call(this, null, pipedStream);
                    if (!this._started) {
                        return;
                    }
                    return this._dumpCached(pipedStream, ops);
                };
                Reader.prototype._dumpCallback = function(callback, ops) {
                    var listeners, pipeTo, _this = this;
                    if (callback instanceof Stream) {
                        ops.stream = true;
                        pipeTo = callback;
                        callback = function(err, stream) {
                            var type, _fn, _i, _len, _ref;
                            _ref = _this._listenTo();
                            _fn = function(type) {
                                return stream.on(type, function() {
                                    return pipeTo.emit.apply(pipeTo, [ type ].concat(Array.prototype.slice.call(arguments)));
                                });
                            };
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                type = _ref[_i];
                                _fn(type);
                            }
                            return null;
                        };
                    }
                    if (typeof callback === "object") {
                        ops.stream = true;
                        listeners = callback;
                        callback = function(err, stream) {
                            var type, _results;
                            _results = [];
                            for (type in listeners) {
                                _results.push(stream.on(type, listeners[type]));
                            }
                            return _results;
                        };
                    }
                    if (ops.stream) {
                        return callback;
                    }
                    return function(err, reader) {
                        var buffer, onEnd;
                        if (err) {
                            return callback(err);
                        }
                        buffer = [];
                        onEnd = function(err) {
                            var chunk, _i, _len, _results;
                            if (ops.batch) {
                                return callback.call(_this, err, buffer);
                            }
                            if (!buffer.length) {
                                return callback.call(_this, err);
                            }
                            if (ops.each) {
                                _results = [];
                                for (_i = 0, _len = buffer.length; _i < _len; _i++) {
                                    chunk = buffer[_i];
                                    _results.push(callback.call(_this, err, chunk));
                                }
                                return _results;
                            } else {
                                return callback.call(_this, err, buffer.length > 1 ? buffer : buffer[0]);
                            }
                        };
                        reader.on("data", function(data, encoding) {
                            return buffer.push(data);
                        });
                        reader.on("error", onEnd);
                        return reader.on("end", onEnd);
                    };
                };
                Reader.prototype._dumpCached = function(pipedReader) {
                    var data, _i, _len, _ref;
                    _ref = this._buffer;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        data = _ref[_i];
                        pipedReader.emit("data", data.chunk, data.encoding);
                    }
                    if (this.ended) {
                        pipedReader.emit("end");
                    }
                    if (this.error) {
                        return pipedReader.emit("error");
                    }
                };
                return Reader;
            }(Stream);
            Reader.prototype.readable = true;
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/io/writer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Reader, Stream, Writer, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Stream = require("stream/index.js").Stream;
            Reader = require("beanpoll/lib/io/reader.js");
            module.exports = Writer = function(_super) {
                __extends(Writer, _super);
                function Writer() {
                    var _this = this;
                    Writer.__super__.constructor.call(this);
                    this._paused = false;
                    this._reallyResumed = true;
                    this.setMaxListeners(0);
                    this.on("pipe", function(src) {
                        _this._source = src;
                        if (_this._paused) {
                            return _this._source.pause();
                        }
                    });
                }
                Writer.prototype.error = function(err) {
                    if (typeof err === "string") {
                        err = new Error(err);
                    }
                    return this.emit("error", err);
                };
                Writer.prototype.write = function(chunk, encoding) {
                    if (encoding == null) {
                        encoding = "utf8";
                    }
                    if (this._paused) {
                        return false;
                    }
                    return this.emit("data", chunk, encoding);
                };
                Writer.prototype.end = function(chunk, encoding) {
                    if (chunk) {
                        this.write(chunk, encoding);
                    }
                    if (this.ended) {
                        throw new Error("Cannot call end twice");
                    }
                    this.ended = true;
                    this.emit("end");
                    return this;
                };
                Writer.prototype.pause = function() {
                    var _ref;
                    clearInterval(this._resumeTimeout);
                    if (!this._reallyResumed) {
                        if ((_ref = this._source) != null) {
                            if (typeof _ref.pause === "function") {
                                _ref.pause();
                            }
                        }
                    }
                    return this._paused = true;
                };
                Writer.prototype.resume = function() {
                    var _this = this;
                    this._paused = false;
                    clearInterval(this._resumeTimeout);
                    return this._resumeTimeout = setTimeout(function() {
                        var _ref;
                        if (_this._paused) {
                            return;
                        }
                        _this._reallyResumed = true;
                        return (_ref = _this._source) != null ? typeof _ref.resume === "function" ? _ref.resume() : void 0 : void 0;
                    }, 1);
                };
                Writer.prototype.destroy = function() {};
                Writer.prototype.reader = function() {
                    return new Reader(this);
                };
                Writer.prototype._resume = function() {};
                return Writer;
            }(Stream);
            Writer.prototype.writable = true;
        }).call(this);
        return module.exports;
    });
    define("validator/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var node_validator = require("validator/lib/validator.js");
        exports.Validator = node_validator.Validator;
        exports.ValidatorError = node_validator.ValidatorError;
        exports.Filter = require("validator/lib/filter.js").Filter;
        exports.validators = require("validator/lib/validators.js");
        exports.defaultError = require("validator/lib/defaultError.js");
        exports.entities = require("validator/lib/entities.js");
        exports.sanitize = exports.convert = function(str) {
            var filter = new exports.Filter;
            return filter.sanitize(str);
        };
        exports.check = exports.validate = exports.assert = function(str, fail_msg) {
            var validator = new exports.Validator;
            return validator.check(str, fail_msg);
        };
        return module.exports;
    });
    define("structr/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var Structr = function() {
            var that = Structr.extend.apply(null, arguments);
            if (!that.structurized) {
                that = Structr.ize(that);
            }
            for (var prop in that) {
                that.__construct.prototype[prop] = that[prop];
            }
            if (!that.__construct.extend) {
                that.__construct.extend = function() {
                    return Structr.apply(null, [ that ].concat(Array.apply([], arguments)));
                };
            }
            return that.__construct;
        };
        Structr.copy = function(from, to, lite) {
            if (typeof to == "boolean") {
                lite = to;
                to = undefined;
            }
            if (!to) to = from instanceof Array ? [] : {};
            var i;
            for (i in from) {
                var fromValue = from[i], toValue = to[i], newValue;
                if (!lite && typeof fromValue == "object" && (!fromValue || fromValue.constructor.prototype == Object.prototype || fromValue instanceof Array)) {
                    if (toValue && fromValue instanceof toValue.constructor) {
                        newValue = toValue;
                    } else {
                        newValue = fromValue instanceof Array ? [] : {};
                    }
                    Structr.copy(fromValue, newValue);
                } else {
                    newValue = fromValue;
                }
                to[i] = newValue;
            }
            return to;
        };
        Structr.getMethod = function(that, property) {
            return function() {
                return that[property].apply(that, arguments);
            };
        };
        Structr.wrap = function(that, prop) {
            if (that._wrapped) return that;
            that._wrapped = true;
            function wrap(target) {
                return function() {
                    return target.apply(that, arguments);
                };
            }
            if (prop) {
                that[prop] = wrap(target[prop]);
                return that;
            }
            for (var property in that) {
                var target = that[property];
                if (typeof target == "function") {
                    that[property] = wrap(target);
                }
            }
            return that;
        };
        Structr.findProperties = function(target, modifier) {
            var props = [], property;
            for (property in target) {
                var v = target[property];
                if (v && v[modifier]) {
                    props.push(property);
                }
            }
            return props;
        };
        Structr.nArgs = function(func) {
            var inf = func.toString().replace(/\{[\W\S]+\}/g, "").match(/\w+(?=[,\)])/g);
            return inf ? inf.length : 0;
        };
        Structr.getFuncsByNArgs = function(that, property) {
            return that.__private["overload::" + property] || (that.__private["overload::" + property] = {});
        };
        Structr.getOverloadedMethod = function(that, property, nArgs) {
            var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
            return funcsByNArgs[nArgs];
        };
        Structr.setOverloadedMethod = function(that, property, func, nArgs) {
            var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
            if (func.overloaded) return funcsByNArgs;
            funcsByNArgs[nArgs || Structr.nArgs(func)] = func;
            return funcsByNArgs;
        };
        Structr._mixin = {
            operators: {}
        };
        Structr.mixin = function(options) {
            switch (options.type) {
              case "operator":
                Structr._mixin.operators[options.name] = options.factory;
                break;
              default:
                throw new Error("Mixin type " + options.type + "does not exist");
                break;
            }
        };
        Structr.modifiers = {
            _override: function(that, property, newMethod) {
                var oldMethod = that.__private && that.__private[property] || that[property] || function() {}, parentMethod = oldMethod;
                if (oldMethod.overloaded) {
                    var overloadedMethod = oldMethod, nArgs = Structr.nArgs(newMethod);
                    parentMethod = Structr.getOverloadedMethod(that, property, nArgs);
                }
                var wrappedMethod = function() {
                    this._super = parentMethod;
                    var ret = newMethod.apply(this, arguments);
                    delete this._super;
                    return ret;
                };
                wrappedMethod.parent = newMethod;
                if (oldMethod.overloaded) {
                    return Structr.modifiers._overload(that, property, wrappedMethod, nArgs);
                }
                return wrappedMethod;
            },
            _explicit: function(that, property, gs) {
                var pprop = "__" + property;
                if (typeof gs != "object") {
                    gs = {};
                }
                if (!gs.get) {
                    gs.get = function() {
                        return this._value;
                    };
                }
                if (!gs.set) {
                    gs.set = function(value) {
                        this._value = value;
                    };
                }
                return function(value) {
                    if (!arguments.length) {
                        this._value = this[pprop];
                        var ret = gs.get.apply(this);
                        delete this._value;
                        return ret;
                    } else {
                        if (this[pprop] == value) return;
                        this._value = this[pprop];
                        gs.set.apply(this, [ value ]);
                        this[pprop] = this._value;
                    }
                };
            },
            _implicit: function(that, property, egs) {
                that.__private[property] = egs;
                that.__defineGetter__(property, egs);
                that.__defineSetter__(property, egs);
            },
            _overload: function(that, property, value, nArgs) {
                var funcsByNArgs = Structr.setOverloadedMethod(that, property, value, nArgs);
                var multiFunc = function() {
                    var func = funcsByNArgs[arguments.length];
                    if (func) {
                        return funcsByNArgs[arguments.length].apply(this, arguments);
                    } else {
                        var expected = [];
                        for (var sizes in funcsByNArgs) {
                            expected.push(sizes);
                        }
                        throw new Error("Expected " + expected.join(",") + " parameters, got " + arguments.length + ".");
                    }
                };
                multiFunc.overloaded = true;
                return multiFunc;
            },
            _abstract: function(that, property, value) {
                var ret = function() {
                    throw new Error('"' + property + '" is abstract and must be overridden.');
                };
                ret.isAbstract = true;
                return ret;
            }
        };
        Structr.parseProperty = function(property) {
            var parts = property.split(" ");
            var modifiers = [], name = parts.pop(), metadata = [];
            for (var i = 0, n = parts.length; i < n; i++) {
                var part = parts[i];
                if (part.substr(0, 1) == "[") {
                    metadata.push(Structr.parseMetadata(part));
                    continue;
                }
                modifiers.push(part);
            }
            return {
                name: name,
                modifiers: modifiers,
                metadata: metadata
            };
        };
        Structr.parseMetadata = function(metadata) {
            var parts = metadata.match(/\[(\w+)(\((.*?)\))?\]/), name = String(parts[1]).toLowerCase(), params = parts[2] || "()", paramParts = params.length > 2 ? params.substr(1, params.length - 2).split(",") : [];
            var values = {};
            for (var i = paramParts.length; i--; ) {
                var paramPart = paramParts[i].split("=");
                values[paramPart[0]] = paramPart[1] || true;
            }
            return {
                name: name,
                params: values
            };
        };
        Structr.extend = function() {
            var from = {}, mixins = Array.prototype.slice.call(arguments, 0), to = mixins.pop();
            if (mixins.length > 1) {
                for (var i = 0, n = mixins.length; i < n; i++) {
                    var mixin = mixins[i];
                    from = Structr.extend(from, typeof mixin == "function" ? mixin.prototype : mixin);
                }
            } else {
                from = mixins.pop() || from;
            }
            if (typeof from == "function") {
                var fromConstructor = from;
                from = Structr.copy(from.prototype);
                from.__construct = fromConstructor;
            }
            var that = {
                __private: {
                    propertyModifiers: {}
                }
            };
            Structr.copy(from, that);
            var usedProperties = {}, property;
            for (property in to) {
                var value = to[property];
                var propModifiersAr = Structr.parseProperty(property), propertyName = propModifiersAr.name, modifierList = that.__private.propertyModifiers[propertyName] || (that.__private.propertyModifiers[propertyName] = []);
                if (propModifiersAr.modifiers.length) {
                    var propModifiers = {};
                    for (var i = propModifiersAr.modifiers.length; i--; ) {
                        var modifier = propModifiersAr.modifiers[i];
                        propModifiers["_" + propModifiersAr.modifiers[i]] = 1;
                        if (modifierList.indexOf(modifier) == -1) {
                            modifierList.push(modifier);
                        }
                    }
                    if (propModifiers._merge) {
                        value = Structr.copy(from[propertyName], value);
                    }
                    if (propModifiers._explicit || propModifiers._implicit) {
                        value = Structr.modifiers._explicit(that, propertyName, value);
                    }
                    for (var name in Structr._mixin.operators) {
                        if (propModifiers["_" + name]) {
                            value = Structr._mixin.operators[name](that, propertyName, value);
                        }
                    }
                    if (propModifiers._override) {
                        value = Structr.modifiers._override(that, propertyName, value);
                    }
                    if (propModifiers._abstract) {
                        value = Structr.modifiers._abstract(that, propertyName, value);
                    }
                    if (propModifiers._implicit) {
                        Structr.modifiers._implicit(that, propertyName, value);
                        continue;
                    }
                }
                for (var j = modifierList.length; j--; ) {
                    value[modifierList[j]] = true;
                }
                if (usedProperties[propertyName]) {
                    var oldValue = that[propertyName];
                    if (!oldValue.overloaded) Structr.modifiers._overload(that, propertyName, oldValue, undefined);
                    value = Structr.modifiers._overload(that, propertyName, value, undefined);
                }
                usedProperties[propertyName] = 1;
                that.__private[propertyName] = that[propertyName] = value;
            }
            if (that.__construct && from.__construct && that.__construct == from.__construct) {
                that.__construct = Structr.modifiers._override(that, "__construct", function() {
                    this._super.apply(this, arguments);
                });
            } else if (!that.__construct) {
                that.__construct = function() {};
            }
            for (var property in from.__construct) {
                if (from.__construct[property]["static"] && !that[property]) {
                    that.__construct[property] = from.__construct[property];
                }
            }
            var propertyName;
            for (propertyName in that) {
                var value = that[propertyName];
                if (value && value["static"]) {
                    that.__construct[propertyName] = value;
                    delete that[propertyName];
                }
                if (usedProperties[propertyName]) continue;
                if (value.isAbstract) {
                    value();
                }
            }
            return that;
        };
        Structr.fh = function(that) {
            if (!that) {
                that = {};
            }
            that = Structr.extend({}, that);
            return Structr.ize(that);
        };
        Structr.ize = function(that) {
            that.structurized = true;
            that.getMethod = function(property) {
                return Structr.getMethod(this, property);
            };
            that.extend = function() {
                return Structr.extend.apply(null, [ this ].concat(arguments));
            };
            that.copyTo = function(target, lite) {
                Structr.copy(this, target, lite);
            };
            that.wrap = function(property) {
                return Structr.wrap(this, property);
            };
            return that;
        };
        module.exports = Structr;
        return module.exports;
    });
    define("verify/lib/tester.js", function(require, module, exports, __dirname, __filename) {
        var structr = require("structr/lib/index.js"), Sanitizers = require("verify/lib/sanitizers.js"), Matchers = require("verify/lib/matchers.js"), Siblings = require("verify/lib/siblings.js"), validator = require("validator/lib/index.js"), check = validator.check, toarray = require("toarray/index.js");
        module.exports = structr({
            __construct: function(options) {
                this._testers = options.testers;
                this.name = options.name;
                this._message = options.message;
                this._sanitizers = new Sanitizers;
                this._is = new Matchers(this._testers, true);
                this._not = new Matchers(this._testers);
                this._registerValidator("equals", "contains", "len", "isUUID", "isBefore", "isAfter", "isIn", "notIn", "max", "min");
            },
            message: function(value) {
                if (arguments.length === 0) return this._message;
                this._message = value;
                return this;
            },
            is: function(test) {
                this._is.add(test);
                return this;
            },
            not: function(test) {
                this._not.add(test);
                return this;
            },
            addSanitizer: function() {
                this.sanitize.apply(this, arguments);
            },
            sanitize: function(match, sanitizer) {
                this._sanitizers.add(match, sanitizer);
                return this;
            },
            test: function(value) {
                return value !== undefined && this._is.test(value) && !this._not.test(value);
            },
            match: function(options) {
                for (var key in options) {
                    this[key].apply(this, toarray(options[key]));
                }
                return this;
            },
            sanitize: function(value) {
                var newValue = this._is.sanitize(value);
                return this._sanitizers.sanitize(newValue);
            },
            _registerValidator: function() {
                var keys = Array.prototype.slice.call(arguments, 0), self = this;
                keys.forEach(function(key) {
                    self[key] = function() {
                        var args = arguments;
                        self.is(function(value) {
                            try {
                                var chain = check(value);
                                chain[key].apply(chain, args);
                                return true;
                            } catch (e) {
                                return false;
                            }
                        });
                    };
                });
            }
        });
        return module.exports;
    });
    define("mannequin/lib/schema.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PropertyDefinition, Schema, async, utils;
            utils = require("mannequin/lib/utils.js");
            async = require("async/lib/async.js");
            PropertyDefinition = require("mannequin/lib/propertyDefinition.js");
            module.exports = Schema = function() {
                Schema.prototype.__isSchema = true;
                function Schema(definition, options) {
                    this.definition = definition;
                    this.options = options;
                    this._definitionsByKey = {};
                    this.build();
                }
                Schema.prototype.test = function(target, next) {
                    return async.forEach(this.definitions, function(definition, next) {
                        return definition.test(target, next);
                    }, next);
                };
                Schema.prototype.hasDefinition = function() {
                    return !!this._definitionsByKey[key];
                };
                Schema.prototype.getDefinition = function(key) {
                    return this._definitionsByKey[key];
                };
                Schema.prototype.refs = function() {
                    var def, refs, _i, _len, _ref;
                    refs = [];
                    _ref = this.definitions;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        def = _ref[_i];
                        if (def.options.$ref) {
                            refs.push(def);
                        }
                    }
                    return refs;
                };
                Schema.prototype.clone = function() {
                    return new Schema(this.definition, this.options);
                };
                Schema.prototype.dictionary = function(value) {
                    if (!arguments.length) {
                        return this._dictionary;
                    }
                    this._dictionary = value;
                    return this;
                };
                Schema.prototype.validate = function(target, next) {
                    return this.test(target, next);
                };
                Schema.prototype.build = function() {
                    var flattenedDefinitions, key, _results;
                    flattenedDefinitions = utils.flattenDefinitions(this.definition);
                    this.definitions = [];
                    _results = [];
                    for (key in flattenedDefinitions) {
                        _results.push(this.definitions.push(this._definitionsByKey[key] = new PropertyDefinition(this, key, flattenedDefinitions[key])));
                    }
                    return _results;
                };
                return Schema;
            }();
        }).call(this);
        return module.exports;
    });
    define("mannequin/lib/dictionary.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Dictionary, EventEmitter, ModelBuilder, Schema, utils, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            utils = require("mannequin/lib/utils.js");
            Schema = require("mannequin/lib/schema.js");
            ModelBuilder = require("mannequin/lib/modelBuilder.js");
            EventEmitter = require("events/index.js").EventEmitter;
            module["export"] = Dictionary = function(_super) {
                __extends(Dictionary, _super);
                function Dictionary() {
                    this._schemas = {};
                    this._modelBuilders = {};
                }
                Dictionary.prototype.register = function(name, schema) {
                    this._schemas[name] = schema = utils.isSchema(schema) ? schema.clone() : new Schema(schema);
                    schema.dictionary(this);
                    return schema.modelBuilder = this.modelBuilder(name);
                };
                Dictionary.prototype.getSchema = function(name) {
                    return this._schemas[name];
                };
                Dictionary.prototype.modelBuilder = function(name) {
                    var modelBuilder;
                    if (this._modelBuilders[name]) {
                        return this._modelBuilders[name];
                    }
                    this.emit("modelBuilder", this._modelBuilders[name] = modelBuilder = new ModelBuilder(this, name, this.getSchema(name)));
                    return modelBuilder;
                };
                return Dictionary;
            }(EventEmitter);
            module.exports = function() {
                return new Dictionary;
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Binding;
            Binding = require("bindable/lib/object/binding.js");
            exports.Object = require("bindable/lib/object/index.js");
            exports.Collection = require("bindable/lib/collection/index.js");
            exports.EventEmitter = require("bindable/lib/core/eventEmitter.js");
            Binding.Collection = exports.Collection;
        }).call(this);
        return module.exports;
    });
    define("cstep/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CStep, tq, tryInitializingCStep;
            tq = require("tq/lib/index.js");
            tryInitializingCStep = function(target) {
                if (target.cstep) {
                    return target.cstep;
                }
                return target.cstep = new CStep;
            };
            CStep = function() {
                function CStep() {
                    this._queue = tq.create().start();
                }
                CStep.prototype.add = function(fnOrObj) {
                    var fn, self, _i, _len;
                    if (typeof fnOrObj === "object") {
                        return this.add(function(next) {
                            var _this = this;
                            return tryInitializingCStep(fnOrObj).add(function(parentNext) {
                                next();
                                return parentNext();
                            });
                        });
                    }
                    if (arguments.length > 1) {
                        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
                            fn = arguments[_i];
                            this.add(fn);
                        }
                        this;
                    }
                    if (!this._cqueue || this._calling) {
                        this._cqueue = tq.create().start();
                        this._callingStepper = false;
                    }
                    self = this;
                    this._cqueue.push(function(next) {
                        var args, oldQueue;
                        args = Array.prototype.slice.apply(arguments);
                        args[fnOrObj.length - 1] = next;
                        oldQueue = self._cqueue;
                        self._callingStepper = true;
                        fnOrObj.apply(self, args);
                        self._callingStepper = false;
                        return self._cqueue = oldQueue;
                    });
                    return this;
                };
                return CStep;
            }();
            module.exports = function(fnOrObj) {
                if (typeof fnOrObj === "object") {
                    return tryInitializingCStep(fnOrObj);
                }
                return function() {
                    var args, called, orgNext, tole, _this = this;
                    tryInitializingCStep(this);
                    args = Array.prototype.slice.apply(arguments);
                    tole = typeof args[args.length - 1];
                    orgNext = null;
                    if (tole === "function" || tole === "undefined") {
                        orgNext = args.pop();
                    }
                    if (!orgNext) {
                        orgNext = function(err) {
                            if (err) {
                                throw err;
                            }
                        };
                    }
                    called = false;
                    this.cstep.add(function(next) {
                        args[fnOrObj.length - 1] = function() {
                            if (called) {
                                throw new Error("cannot call cstep callback twice");
                            }
                            called = true;
                            orgNext.apply(_this, arguments);
                            return next();
                        };
                        return fnOrObj.apply(_this, args);
                    });
                    return this;
                };
            };
        }).call(this);
        return module.exports;
    });
    define("dref/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var _gss = global._gss = global._gss || [], type = require("type-component/index.js");
        var _gs = function(context) {
            for (var i = _gss.length; i--; ) {
                var gs = _gss[i];
                if (gs.test(context)) {
                    return gs;
                }
            }
        };
        var _length = function(context) {
            var gs = _gs(context);
            return gs ? gs.length(context) : context.length;
        };
        var _get = function(context, key) {
            var gs = _gs(context);
            return gs ? gs.get(context, key) : context[key];
        };
        var _set = function(context, key, value) {
            var gs = _gs(context);
            return gs ? gs.set(context, key, value) : context[key] = value;
        };
        var _findValues = function(keyParts, target, create, index, values) {
            if (!values) {
                keyParts = (type(keyParts) === "array" ? keyParts : keyParts.split(".")).filter(function(part) {
                    return !!part.length;
                });
                values = [];
                index = 0;
            }
            var ct, j, kp, i = index, n = keyParts.length, pt = target;
            for (; i < n; i++) {
                kp = keyParts[i];
                ct = _get(pt, kp);
                if (kp == "$") {
                    for (j = _length(pt); j--; ) {
                        _findValues(keyParts, _get(pt, j), create, i + 1, values);
                    }
                    return values;
                } else if (ct == undefined || ct == null) {
                    if (!create) return values;
                    _set(pt, kp, {});
                    ct = _get(pt, kp);
                }
                pt = ct;
            }
            if (ct) {
                values.push(ct);
            } else {
                values.push(pt);
            }
            return values;
        };
        var getValue = function(target, key) {
            key = String(key);
            var values = _findValues(key, target);
            return key.indexOf(".$.") == -1 ? values[0] : values;
        };
        var setValue = function(target, key, newValue) {
            key = String(key);
            var keyParts = key.split("."), keySet = keyParts.pop();
            if (keySet == "$") {
                keySet = keyParts.pop();
            }
            var values = _findValues(keyParts, target, true);
            for (var i = values.length; i--; ) {
                _set(values[i], keySet, newValue);
            }
        };
        exports.get = getValue;
        exports.set = setValue;
        exports.use = function(gs) {
            _gss.push(gs);
        };
        return module.exports;
    });
    define("linen/lib/collection.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Collection, async, asyngleton, bindable, outcome, type, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            bindable = require("bindable/lib/index.js");
            async = require("async/lib/async.js");
            outcome = require("outcome/lib/index.js");
            asyngleton = require("asyngleton/lib/index.js");
            type = require("type-component/index.js");
            module.exports = Collection = function(_super) {
                __extends(Collection, _super);
                function Collection(collectionName, modelBuilder, options) {
                    this.collectionName = collectionName;
                    this.modelBuilder = modelBuilder;
                    this.options = options != null ? options : {};
                    Collection.__super__.constructor.call(this);
                    this.options.path = this.route.path || this.collectionName;
                    this.options.collectionName = this.collectionName;
                    this._modelClass = options.modelClass;
                    this._modelBuilder = this._modelClass.builder;
                    this._isVirtual = options.virtual !== false;
                    this._isStatic = options["static"];
                    this._initCollection();
                    this.on("insert", this._persistInsert);
                    this.on("remove", this._persistRemove);
                }
                Collection.prototype.route = function() {
                    return this.options;
                };
                Collection.prototype.item = function(data) {
                    var Item;
                    Item = this.getModelClass();
                    return new Item(data);
                };
                Collection.prototype.getModelClass = function() {
                    var self, _ref;
                    if (this._class) {
                        return this._class;
                    }
                    self = this;
                    this._class = function(_super1) {
                        __extends(_Class, _super1);
                        function _Class() {
                            _ref = _Class.__super__.constructor.apply(this, arguments);
                            return _ref;
                        }
                        _Class.prototype._initData = function(data) {
                            _Class.__super__._initData.call(this, data);
                            this.route(self.options);
                            return this.parent = self;
                        };
                        return _Class;
                    }(this._modelClass);
                    this._class.collection = this;
                    return this._class;
                };
                Collection.prototype._initCollection = function() {
                    return this._initTransformations();
                };
                Collection.prototype._initTransformations = function() {
                    var _this = this;
                    return this.transform().map(this._modelBuilder._castRefClass(this.getModelClass())).postMap(function(item) {
                        item.route(_this.options);
                        return item;
                    });
                };
                Collection.prototype.clear = function() {
                    var _results;
                    _results = [];
                    while (this.length()) {
                        _results.push(this.shift());
                    }
                    return _results;
                };
                Collection.prototype.reset = function(source) {
                    var result;
                    this._resetting = true;
                    if (source.__isCollection) {
                        source = source.source();
                    }
                    if (!this._isStatic && type(source[0]) === "string" || !(type(source) === "array")) {
                        source = [];
                    } else if (this._isVirtual && !this._fetching) {
                        source = [];
                    }
                    result = Collection.__super__.reset.call(this, source);
                    this._resetting = false;
                    return result;
                };
                Collection.prototype.pushNoPersist = function(item) {
                    this._resetting = true;
                    this.push(item);
                    return this._resetting = false;
                };
                Collection.prototype.bind = function(to) {
                    this.fetch();
                    return Collection.__super__.bind.apply(this, arguments);
                };
                Collection.prototype.save = function(next) {
                    return async.forEach(this.source(), function(item, next) {
                        return item.save(next);
                    }, next);
                };
                Collection.prototype.fetch = asyngleton(true, function(callback) {
                    this._fetching = [];
                    if (this._isStatic || this.parent && !this.parent.__isCollection && !this.parent.data._id) {
                        return callback();
                    }
                    if (!this._isVirtual) {
                        return this._fetchReference(callback);
                    } else {
                        return this._fetchVirtual(callback);
                    }
                });
                Collection.prototype._fetchReference = function(next) {
                    var _this = this;
                    return async.forEach(this._fetchSource, function(_id, next) {
                        var i, item;
                        if (~(i = _this.indexOf({
                            _id: _id
                        }))) {
                            item = _this.at(i);
                        } else {
                            item = _this._transform({
                                _id: _id
                            });
                        }
                        return item.fetch(outcome.e(next).s(function() {
                            if (!~i) {
                                _this.push(item);
                            }
                            return next();
                        }));
                    }, next);
                };
                Collection.prototype._fetchVirtual = function(callback) {
                    var request, _this = this;
                    request = {
                        method: "GET"
                    };
                    return this._request(request, outcome.e(callback).s(function(source) {
                        _this.reset(source);
                        return callback();
                    }));
                };
                Collection.prototype._request = function(request, callback) {
                    if (callback == null) {
                        callback = function() {};
                    }
                    request.collection = this;
                    return this.modelBuilder.linen.resource.request(request, callback);
                };
                Collection.prototype._persistRemove = function(item) {
                    var request;
                    if (this._resetting || item.removed) {
                        return;
                    }
                    request = {
                        method: "DELETE",
                        item: item
                    };
                    return this._request(request);
                };
                Collection.prototype._persistInsert = function(item) {
                    var request, _this = this;
                    item.once("remove", function() {
                        return _this.splice(_this.indexOf(item), 1);
                    });
                    if (this._resetting) {
                        return;
                    }
                    request = {
                        method: "POST",
                        body: item
                    };
                    return this._request(request);
                };
                return Collection;
            }(bindable.Collection);
        }).call(this);
        return module.exports;
    });
    define("linen/lib/model.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var asyngleton, cstep, dref, outcome, _, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            dref = require("dref/lib/index.js");
            outcome = require("outcome/lib/index.js");
            cstep = require("cstep/lib/index.js");
            asyngleton = require("asyngleton/lib/index.js");
            _ = require("underscore/underscore.js");
            module.exports = function(builder, Model) {
                var LinenModel, linen;
                linen = builder.linen;
                return LinenModel = function(_super) {
                    __extends(LinenModel, _super);
                    function LinenModel(data) {
                        if (data == null) {
                            data = {};
                        }
                        if (typeof data === "string") {
                            data = {
                                _id: data
                            };
                        } else {
                            data = data;
                        }
                        this._o = outcome.e(this);
                        LinenModel.__super__.constructor.call(this, data);
                        this._setupRefs();
                        this._update = {};
                        this._initialized = true;
                    }
                    LinenModel.prototype.route = function(options) {
                        var _ref;
                        if (arguments.length) {
                            this._route = _.extend(this._route || {}, options);
                            return this;
                        }
                        return _.extend({}, this._route, ((_ref = this.definition) != null ? _ref.options.$route : void 0) || {});
                    };
                    LinenModel.prototype._set = function(key, value) {
                        LinenModel.__super__._set.call(this, key, value);
                        if (!this._update) {
                            this._update = {};
                        }
                        return dref.set(this._update, key, this.get(key));
                    };
                    LinenModel.prototype.hydrate = function(data) {
                        var cv, key, nv;
                        for (key in data) {
                            cv = this.get(key);
                            nv = data[key];
                            if (cv) {
                                if (cv.__isBindable) {
                                    cv = cv.get("_id");
                                } else if (cv.__isCollection) {
                                    delete data[key];
                                    continue;
                                }
                            }
                            if (cv === nv) {
                                delete data[key];
                            }
                        }
                        this.set(data);
                        this._update = {};
                        return this;
                    };
                    LinenModel.prototype.isNew = function() {
                        return !this.get("_id");
                    };
                    LinenModel.prototype.get = function() {
                        this._initFetch();
                        return LinenModel.__super__.get.apply(this, arguments);
                    };
                    LinenModel.prototype.fetch = asyngleton(true, function(next) {
                        var request;
                        request = {
                            method: "GET",
                            item: this
                        };
                        if (this.isNew()) {
                            return next(new Error("cannot fetch new model"));
                        }
                        return this._request(request, next);
                    });
                    LinenModel.prototype._initFetch = function() {
                        if (this._fetched || !this._initialized || !this.data._id) {
                            return;
                        }
                        this._fetched = true;
                        return this.fetch();
                    };
                    LinenModel.prototype._request = cstep(function(options, next) {
                        var _this = this;
                        options.item = this;
                        options.one = true;
                        linen.resource.request(options, outcome.e(next).s(function(result) {
                            _this.hydrate(result);
                            return next();
                        }));
                        return this;
                    });
                    LinenModel.prototype._refs = function() {
                        return this.schema.refs();
                    };
                    LinenModel.prototype._setupRefs = function() {
                        var ref, _i, _len, _ref, _results;
                        this._refs = {};
                        _ref = this.schema.refs();
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            ref = _ref[_i];
                            _results.push(this._refs[ref.key] = ref);
                        }
                        return _results;
                    };
                    LinenModel.prototype._toObject = function(data) {
                        var d, key, ref, v;
                        d = {};
                        for (key in data) {
                            ref = this._refs[key];
                            if (!(ref != null ? ref.options.$objectKey : void 0)) {
                                v = data[key];
                            } else {
                                v = dref.get(data[key], ref.options.$objectKey);
                            }
                            d[key] = v;
                        }
                        return this._toJSON(d);
                    };
                    LinenModel.prototype.save = function(next) {
                        var o, _this = this;
                        if (next == null) {
                            next = function() {};
                        }
                        o = this._o.e(next);
                        this.validate(o.s(function() {
                            if (_this.isNew()) {
                                return _this._request({
                                    method: "POST",
                                    body: _this
                                }, o.s(function() {
                                    _this.parent.pushNoPersist(_this);
                                    return next.call(_this);
                                }));
                            } else {
                                return _this._request({
                                    method: "PUT",
                                    body: _this._toObject(_this._update)
                                }, next);
                            }
                        }));
                        return this;
                    };
                    LinenModel.prototype.remove = function(next) {
                        var _this = this;
                        if (next == null) {
                            next = function() {};
                        }
                        if (this.isNew()) {
                            next(new Error("cannot remove a new item"));
                            return this;
                        }
                        this._request({
                            method: "DELETE"
                        }, outcome.e(next).s(function() {
                            _this.removed = true;
                            _this.emit("remove");
                            _this.dispose();
                            return next();
                        }));
                        return this;
                    };
                    return LinenModel;
                }(Model);
            };
        }).call(this);
        return module.exports;
    });
    define("toarray/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(item) {
            if (item === undefined) return [];
            return Object.prototype.toString.call(item) === "[object Array]" ? item : [ item ];
        };
        return module.exports;
    });
    define("type-component/index.js", function(require, module, exports, __dirname, __filename) {
        var toString = Object.prototype.toString;
        module.exports = function(val) {
            switch (toString.call(val)) {
              case "[object Function]":
                return "function";
              case "[object Date]":
                return "date";
              case "[object RegExp]":
                return "regexp";
              case "[object Arguments]":
                return "arguments";
              case "[object Array]":
                return "array";
            }
            if (val === null) return "null";
            if (val === undefined) return "undefined";
            if (val === Object(val)) return "object";
            return typeof val;
        };
        return module.exports;
    });
    define("strscanner/lib/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(source, options) {
            if (!options) {
                options = {
                    skipWhitespace: true
                };
            }
            var _cchar = "", _ccode = 0, _pos = 0, _len = 0, _src = source;
            var self = {
                source: function(value) {
                    _src = value;
                    _len = value.length;
                    self.pos(0);
                },
                eof: function() {
                    return _pos >= _len;
                },
                pos: function(value) {
                    if (!arguments.length) return _pos;
                    _pos = value;
                    _cchar = _src.charAt(value);
                    _ccode = _cchar.charCodeAt(0);
                },
                skip: function(count) {
                    _pos = Math.min(_pos + count, _len);
                    return _pos;
                },
                rewind: function(count) {
                    _pos = Math.max(_pos - count || 1, 0);
                    return _pos;
                },
                peek: function(count) {
                    return _src.substr(_pos, count || 1);
                },
                nextChar: function() {
                    self.pos(_pos + 1);
                    if (options.skipWhitespace) {
                        if (self.isWs()) {
                            self.nextChar();
                        }
                    }
                    return _cchar;
                },
                cchar: function() {
                    return _cchar;
                },
                ccode: function() {
                    return _ccode;
                },
                isAZ: function() {
                    return _ccode > 64 && _ccode < 91 || _ccode > 96 && _ccode < 123;
                },
                is09: function() {
                    return _ccode > 47 && _ccode < 58;
                },
                isWs: function() {
                    return _ccode === 9 || _ccode === 10 || _ccode === 13 || _ccode === 32;
                },
                isAlpha: function() {
                    return self.isAZ() || self.is09();
                },
                matches: function(search) {
                    return !!_src.substr(_pos).match(search);
                },
                next: function(search) {
                    var buffer = _src.substr(_pos), match = buffer.match(search);
                    _pos += match.index + match[0].length;
                    return match[0];
                },
                nextWord: function() {
                    if (self.isAZ()) return self.next(/[a-zA-Z]+/);
                },
                nextNumber: function() {
                    if (self.is09()) return self.next(/[0-9]+/);
                },
                nextAlpha: function() {
                    if (self.isAlpha()) return self.next(/[a-zA-Z0-9]+/);
                },
                nextNonAlpha: function() {
                    if (!self.isAlpha()) return self.next(/[^a-zA-Z0-9]+/);
                },
                nextWs: function() {
                    if (self.isWs()) return self.next(/[\s\r\n\t]+/);
                },
                nextUntil: function(match) {
                    var buffer = "";
                    while (!self.eof() && !_cchar.match(match)) {
                        buffer += _cchar;
                        self.nextChar();
                    }
                    return buffer;
                },
                to: function(count) {
                    var buffer = _src.substr(_pos, count);
                    _pos += count;
                    return buffer;
                }
            };
            self.source(source);
            return self;
        };
        return module.exports;
    });
    define("beanpoll/lib/push/director.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Director, Messenger, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Director = require("beanpoll/lib/concrete/director.js");
            Messenger = require("beanpoll/lib/push/messenger.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.passive = true;
                _Class.prototype._newMessenger = function(request, middleware) {
                    return new Messenger(request, middleware, this);
                };
                return _Class;
            }(Director);
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/collect/director.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Director, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Director = require("beanpoll/lib/pull/director.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.passive = true;
                _Class.prototype.prepareListeners = function(listeners) {
                    return listeners;
                };
                return _Class;
            }(Director);
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/pull/director.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Director, Messenger, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Director = require("beanpoll/lib/concrete/director.js");
            Messenger = require("beanpoll/lib/pull/messenger.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.passive = false;
                _Class.prototype._newMessenger = function(request, middleware) {
                    return new Messenger(request, middleware, this);
                };
                _Class.prototype.getListeners = function(request, search) {
                    return this.prepareListeners(_Class.__super__.getListeners.call(this, request, search));
                };
                _Class.prototype.prepareListeners = function(listeners) {
                    if (!!listeners.length) {
                        return [ listeners[0] ];
                    } else {
                        return [];
                    }
                };
                return _Class;
            }(Director);
        }).call(this);
        return module.exports;
    });
    define("dolce/lib/collection.js", function(require, module, exports, __dirname, __filename) {
        var crema = require("crema/lib/index.js"), tree = require("dolce/lib/tree.js"), sift = require("sift/sift.js"), _ = require("underscore/underscore.js");
        var routeTypes = {
            "*": "extend",
            "+": "extend",
            "**": "greedy"
        };
        var collection = module.exports = function() {
            var _rootTree = tree(), self = {}, _id = 0;
            var _addRoute = self.add = function(route, value) {
                var tree, type, segments = route.path.segments, lastPath = segments[segments.length - 1].value, secondLastPath = segments.length > 1 ? segments[segments.length - 2].value : null;
                if (type = routeTypes[lastPath]) {
                    route.path.segments.pop();
                } else {
                    type = "endpoint";
                }
                var thru = [], cthru = route.thru;
                while (cthru) {
                    thru.unshift(cthru.path.segments);
                    cthru = cthru.thru;
                }
                tree = _findTree(route.path.segments, true);
                return tree.addListener(type, {
                    routeStr: crema.stringify(route),
                    test: route.path.test,
                    tags: route.tags,
                    segments: route.path.segments,
                    thru: thru,
                    id: _id++,
                    value: value
                }, type);
            };
            self.contains = function(path, ops) {
                if (!ops) ops = {};
                var child = _findTree(path.segments);
                return !!child ? !!_andSifter(ops, child.collections.endpoint).length : false;
            };
            self.get = function(path, ops) {
                if (!ops) ops = {};
                var chains = _chains(path.segments, ops, true).sort(function(a, b) {
                    return Number(a[a.length - 1].tags.priority || 0) > Number(b[b.length - 1].tags.priority || 0) ? -1 : 1;
                });
                return {
                    segments: path.segments,
                    tags: ops.tags,
                    chains: chains
                };
            };
            self.remove = function(path, ops) {
                var child = _findTree(path.segments), sifter = _andSifter(ops);
                for (var i = child.collections.endpoint.length; i--; ) {
                    if (sifter.test(child.collections.endpoint[i])) {
                        child.collections.endpoint.splice(i, 1);
                    }
                }
            };
            self.find = function(ops) {
                var tagSifter, found = [];
                if (ops.tags) {
                    tagSifter = _andSifter(ops);
                } else if (ops.siftTags) {
                    tagSifter = sift({
                        tags: ops.siftTags
                    });
                }
                _rootTree.traverse(function(tree) {
                    if (tagSifter) for (var i = tree.collections.endpoint.length; i--; ) {
                        var data = tree.collections.endpoint[i];
                        if (tagSifter.test(data)) {
                            found.push(data);
                            break;
                        }
                    }
                });
                return found;
            };
            var _tagsToArray = function(tagsObj) {
                var key, tag, tags = [];
                for (key in tagsObj) {
                    tag = {};
                    tag[key] = tagsObj[key];
                    tags.push(tag);
                }
                return tags;
            };
            var _andSifter = function(ops, target) {
                var tags = ops.tags || {};
                for (var name in tags) {
                    if (tags[name] === true) {
                        tags[name] = {
                            $exists: true
                        };
                    }
                }
                var $and = _tagsToArray(tags);
                if (ops.siftTags) $and.push(ops.siftTags);
                return sift({
                    tags: {
                        $and: $and
                    }
                }, target);
            };
            var _chains = function(segments, ops) {
                var child = _rootTree.findChild(segments);
                if (!child) {
                    return [];
                }
                var entireChain = _allCollections(child), currentData, endCollection = _andSifter(ops)(child.collections.endpoint), expandedChains = [], expandedChain;
                for (var i = 0, n = endCollection.length; i < n; i++) {
                    currentData = endCollection[i];
                    expandedChains.push(ops.expand == undefined || ops.expand == true ? _chain(currentData, segments, entireChain, ops.throwErrors) : [ currentData ]);
                }
                return expandedChains;
            };
            var _chain = function(data, segments, entireChain, throwErrors) {
                var tags = data.tags;
                var chain = _siftChain(tags, entireChain);
                var usedGreedyPaths = {};
                return _expand(chain.concat(data), segments, throwErrors).filter(function(route) {
                    if (route.type != "greedy") return true;
                    if (usedGreedyPaths[route.id]) return false;
                    return usedGreedyPaths[route.id] = true;
                });
            };
            var _greedyEndpoint = function(segments, tags) {
                var tree;
                for (var i = segments.length; i--; ) {
                    if (tree = _rootTree.findChild(segments.slice(0, i))) break;
                }
                if (!tree) return [];
                var chain = _siftChain(tags || {}, _greedyCollections(tree));
                return chain;
            };
            var _copy = function(target) {
                var to = {};
                for (var i in target) {
                    to[i] = target[i];
                }
                return to;
            };
            var _expand = function(chain, segments, throwErrors) {
                var j, n2, i = 0, n = chain.length;
                var expanded = [];
                for (; i < n; i++) {
                    var data = chain[i];
                    var params = _params(data.segments, segments), subChain = [];
                    for (j = 0, n2 = data.thru.length; j < n2; j++) {
                        subChain.push(_thru(_fillPaths(data.thru[j], params), data.tags, throwErrors));
                    }
                    expanded = expanded.concat.apply(expanded, subChain);
                    expanded.push({
                        routeStr: data.routeStr,
                        segments: data.segments,
                        cmpSegments: segments,
                        params: params,
                        id: data.id,
                        tags: data.tags,
                        value: data.value,
                        type: data.type
                    });
                }
                return expanded;
            };
            var _siftChain = function(tags, target) {
                var usable = [], prev;
                toFind = _.extend({}, tags);
                for (var i = target.length; i--; ) {
                    var a = target[i], atags = a.tags, canUse = true;
                    if (a.greedy) {
                        if (!atags.unfilterable) {
                            for (var tagName in atags) {
                                av = atags[tagName];
                                tv = toFind[tagName];
                                if (av != tv && (!tv || av !== true) && av != "*") {
                                    canUse = false;
                                    break;
                                }
                            }
                        }
                    } else {
                        for (var tagName in tags) {
                            var tv = tags[tagName], av = atags[tagName];
                            if (tv != av && av !== undefined && av !== true) {
                                canUse = false;
                                break;
                            }
                        }
                    }
                    if (canUse) {
                        _.extend(toFind, atags);
                        usable.unshift(a);
                    }
                }
                return usable;
            };
            var _doesNotExist = function(segments) {
                throw new Error("route " + crema.stringifySegments(segments, null, true) + " does not exist");
            };
            var _thru = function(segments, tags, throwErrors) {
                var child = _rootTree.findChild(segments);
                if (!child) {
                    if (throwErrors) {
                        _doesNotExist(segments);
                    }
                    return [];
                }
                var filteredChildren = child.collections.endpoint.sort(function(a, b) {
                    return _scoreTags(a.tags, tags) > _scoreTags(b.tags, tags) ? -1 : 1;
                });
                var targetChild = filteredChildren[0];
                var chain = _siftChain(targetChild.tags, _allCollections(child));
                return _expand(chain.concat(targetChild), segments, throwErrors);
            };
            var _scoreTags = function(tags, match) {
                var score = 0;
                for (var tag in match) {
                    var tagV = tags[tag];
                    if (tagV == match[tag]) {
                        score += 2;
                    } else if (tagV) {
                        score += 1;
                    }
                }
                return score;
            };
            var _fillPaths = function(segments, params) {
                var i, path, n = segments.length, newPaths = [];
                for (i = 0; i < n; i++) {
                    path = segments[i];
                    newPaths.push({
                        value: path.param ? params[path.value] : path.value,
                        param: path.param
                    });
                }
                return newPaths;
            };
            var _params = function(treePaths, queryPaths) {
                var i, treePath, queryPath, params = {};
                for (i = treePaths.length; i--; ) {
                    treePath = treePaths[i];
                    queryPath = queryPaths[i];
                    if (treePath.param) {
                        params[treePath.value] = queryPath.value;
                    }
                }
                return params;
            };
            var _greedyCollections = function(tree) {
                var currentParent = tree, collections = [], gcol = [], cpath;
                while (currentParent) {
                    cpath = currentParent.pathStr();
                    collections = currentParent.collections.greedy.concat(collections);
                    currentParent = currentParent.parent();
                }
                return collections;
            };
            var _allCollections = function(tree) {
                return _greedyCollections(tree).concat(tree.collections.extend);
            };
            var _findTree = function(segments, createIfNotFound) {
                var i, path, n = segments.length, currentTree = _rootTree;
                for (i = 0; i < n; i++) {
                    path = segments[i];
                    if (!(currentTree = currentTree.child(path, createIfNotFound))) break;
                }
                return currentTree;
            };
            return self;
        };
        return module.exports;
    });
    define("beanpoll/lib/collections/linkedList.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var LinkedList;
            module.exports = LinkedList = function() {
                function LinkedList() {}
                LinkedList.prototype.getNextSibling = function() {
                    return this._nextSibling;
                };
                LinkedList.prototype.addNextSibling = function(sibling, replNext) {
                    if (!!this._nextSibling) {
                        this._nexSibling._prevSibling = sibling;
                    }
                    sibling._prevSibling = this;
                    if (!replNext) {
                        sibling._nextSibling = this._nextSibling;
                    }
                    return this._nextSibling = sibling;
                };
                LinkedList.prototype.getPrevSibling = function() {
                    return this._prevSibling;
                };
                LinkedList.prototype.addPrevSibling = function(sibling, replPrev) {
                    if (!!this._prevSibling) {
                        this._prevSibling._nextSibling = sibling;
                    }
                    sibling._nextSibling = this;
                    if (!replPrev) {
                        sibling._prevSibling = this._prevSibling;
                    }
                    return this._prevSibling = sibling;
                };
                LinkedList.prototype.getFirstSibling = function() {
                    var first;
                    first = this;
                    while (!!first._prevSibling) {
                        first = first._prevSibling;
                    }
                    return first;
                };
                LinkedList.prototype.getLastSibling = function() {
                    var last;
                    last = this;
                    while (!!last._nextSibling) {
                        last = last._nextSibling;
                    }
                    return last;
                };
                return LinkedList;
            }();
        }).call(this);
        return module.exports;
    });
    define("stream/index.js", function(require, module, exports, __dirname, __filename) {
        var events = require("events/index.js");
        var util = require("util/index.js");
        function Stream() {
            events.EventEmitter.call(this);
        }
        util.inherits(Stream, events.EventEmitter);
        module.exports = Stream;
        Stream.Stream = Stream;
        Stream.prototype.pipe = function(dest, options) {
            var source = this;
            function ondata(chunk) {
                if (dest.writable) {
                    if (false === dest.write(chunk) && source.pause) {
                        source.pause();
                    }
                }
            }
            source.on("data", ondata);
            function ondrain() {
                if (source.readable && source.resume) {
                    source.resume();
                }
            }
            dest.on("drain", ondrain);
            if (!dest._isStdio && (!options || options.end !== false)) {
                source.on("end", onend);
                source.on("close", onclose);
            }
            var didOnEnd = false;
            function onend() {
                if (didOnEnd) return;
                didOnEnd = true;
                cleanup();
                dest.end();
            }
            function onclose() {
                if (didOnEnd) return;
                didOnEnd = true;
                cleanup();
                dest.destroy();
            }
            function onerror(er) {
                cleanup();
                if (this.listeners("error").length === 0) {
                    throw er;
                }
            }
            source.on("error", onerror);
            dest.on("error", onerror);
            function cleanup() {
                source.removeListener("data", ondata);
                dest.removeListener("drain", ondrain);
                source.removeListener("end", onend);
                source.removeListener("close", onclose);
                source.removeListener("error", onerror);
                dest.removeListener("error", onerror);
                source.removeListener("end", cleanup);
                source.removeListener("close", cleanup);
                dest.removeListener("end", cleanup);
                dest.removeListener("close", cleanup);
            }
            source.on("end", cleanup);
            source.on("close", cleanup);
            dest.on("end", cleanup);
            dest.on("close", cleanup);
            dest.emit("pipe", source);
            return dest;
        };
        return module.exports;
    });
    define("validator/lib/validator.js", function(require, module, exports, __dirname, __filename) {
        var util = require("util/index.js");
        var validators = require("validator/lib/validators.js");
        exports.defaultError = require("validator/lib/defaultError.js");
        var ValidatorError = exports.ValidatorError = function(msg) {
            Error.captureStackTrace(this, this);
            this.name = "ValidatorError";
            this.message = msg;
        };
        util.inherits(ValidatorError, Error);
        var Validator = exports.Validator = function() {};
        Validator.prototype.error = function(msg) {
            throw new ValidatorError(msg);
        };
        Validator.prototype.check = function(str, fail_msg) {
            this.str = str == null || isNaN(str) && str.length == undefined ? "" : str;
            if (typeof this.str == "number") {
                this.str += "";
            }
            this.msg = fail_msg;
            this._errors = this._errors || [];
            return this;
        };
        for (var key in validators) {
            if (validators.hasOwnProperty(key)) {
                (function(key) {
                    Validator.prototype[key] = function() {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(this.str);
                        if (!validators[key].apply(this, args)) {
                            var msg = this.msg || exports.defaultError[key];
                            if (typeof msg === "string") {
                                args.forEach(function(arg, i) {
                                    msg = msg.replace("%" + i, arg);
                                });
                            }
                            return this.error(msg);
                        }
                        return this;
                    };
                })(key);
            }
        }
        Validator.prototype.validate = Validator.prototype.check;
        Validator.prototype.assert = Validator.prototype.check;
        Validator.prototype.isFloat = Validator.prototype.isDecimal;
        Validator.prototype.is = Validator.prototype.regex;
        Validator.prototype.not = Validator.prototype.notRegex;
        return module.exports;
    });
    define("validator/lib/filter.js", function(require, module, exports, __dirname, __filename) {
        var entities = require("validator/lib/entities.js");
        var xss = require("validator/lib/xss.js");
        var Filter = exports.Filter = function() {};
        var whitespace = "\\r\\n\\t\\s";
        Filter.prototype.modify = function(str) {
            this.str = str;
        };
        Filter.prototype.wrap = function(str) {
            return str;
        };
        Filter.prototype.value = function() {
            return this.str;
        };
        Filter.prototype.chain = function() {
            this.wrap = function() {
                return this;
            };
            return this;
        };
        Filter.prototype.convert = Filter.prototype.sanitize = function(str) {
            this.str = str == null ? "" : str + "";
            return this;
        };
        Filter.prototype.xss = function(is_image) {
            this.modify(xss.clean(this.str, is_image));
            return this.wrap(this.str);
        };
        Filter.prototype.entityDecode = function() {
            this.modify(entities.decode(this.str));
            return this.wrap(this.str);
        };
        Filter.prototype.entityEncode = function() {
            this.modify(entities.encode(this.str));
            return this.wrap(this.str);
        };
        Filter.prototype.ltrim = function(chars) {
            chars = chars || whitespace;
            this.modify(this.str.replace(new RegExp("^[" + chars + "]+", "g"), ""));
            return this.wrap(this.str);
        };
        Filter.prototype.rtrim = function(chars) {
            chars = chars || whitespace;
            this.modify(this.str.replace(new RegExp("[" + chars + "]+$", "g"), ""));
            return this.wrap(this.str);
        };
        Filter.prototype.trim = function(chars) {
            chars = chars || whitespace;
            this.modify(this.str.replace(new RegExp("^[" + chars + "]+|[" + chars + "]+$", "g"), ""));
            return this.wrap(this.str);
        };
        Filter.prototype.escape = function() {
            this.modify(this.str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
            return this.wrap(this.str);
        };
        Filter.prototype.ifNull = function(replace) {
            if (!this.str || this.str === "") {
                this.modify(replace);
            }
            return this.wrap(this.str);
        };
        Filter.prototype.toFloat = function() {
            this.modify(parseFloat(this.str));
            return this.wrap(this.str);
        };
        Filter.prototype.toInt = function(radix) {
            this.modify(parseInt(this.str, radix || 10));
            return this.wrap(this.str);
        };
        Filter.prototype.toBoolean = function() {
            if (!this.str || this.str == "0" || this.str == "false" || this.str == "") {
                this.modify(false);
            } else {
                this.modify(true);
            }
            return this.wrap(this.str);
        };
        Filter.prototype.toBooleanStrict = function() {
            if (this.str == "1" || this.str == "true") {
                this.modify(true);
            } else {
                this.modify(false);
            }
            return this.wrap(this.str);
        };
        return module.exports;
    });
    define("validator/lib/validators.js", function(require, module, exports, __dirname, __filename) {
        function toDateTime(date) {
            if (date instanceof Date) {
                return date;
            }
            var intDate = Date.parse(date);
            if (isNaN(intDate)) {
                return null;
            }
            return new Date(intDate);
        }
        function toDate(date) {
            if (!(date instanceof Date)) {
                date = toDateTime(date);
            }
            if (!date) {
                return null;
            }
            return date;
        }
        var validators = module.exports = {
            isEmail: function(str) {
                return str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/);
            },
            isUrl: function(str) {
                return str.length < 2083 && str.match(/^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i);
            },
            isIP: function(str) {
                if (!str) {
                    return 0;
                } else if (/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/.test(str)) {
                    var parts = str.split(".");
                    for (var i = 0; i < parts.length; i++) {
                        var part = parseInt(parts[i]);
                        if (part < 0 || 255 < part) {
                            return 0;
                        }
                    }
                    return 4;
                } else if (/^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/.test(str)) {
                    return 6;
                } else {
                    return 0;
                }
            },
            isIPv4: function(str) {
                return validators.isIP(str) === 4;
            },
            isIPv6: function(str) {
                return validators.isIP(str) === 6;
            },
            isIPNet: function(str) {
                return validators.isIP(str) !== 0;
            },
            isAlpha: function(str) {
                return str.match(/^[a-zA-Z]+$/);
            },
            isAlphanumeric: function(str) {
                return str.match(/^[a-zA-Z0-9]+$/);
            },
            isNumeric: function(str) {
                return str.match(/^-?[0-9]+$/);
            },
            isHexadecimal: function(str) {
                return str.match(/^[0-9a-fA-F]+$/);
            },
            isHexColor: function(str) {
                return str.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
            },
            isLowercase: function(str) {
                return str.match(/^[a-z0-9]+$/);
            },
            isUppercase: function(str) {
                return str.match(/^[A-Z0-9]+$/);
            },
            isInt: function(str) {
                var floatVal = parseFloat(str), intVal = parseInt(str * 1, 10);
                if (!isNaN(intVal) && floatVal == intVal) {
                    return true;
                } else {
                    return false;
                }
            },
            isDecimal: function(str) {
                return str !== "" && str.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/);
            },
            isDivisibleBy: function(str, n) {
                return !(parseFloat(str) % n);
            },
            notNull: function(str) {
                return str !== "";
            },
            isNull: function(str) {
                return str === "";
            },
            notEmpty: function(str) {
                return !str.match(/^[\s\t\r\n]*$/);
            },
            equals: function(a, b) {
                return a == b;
            },
            contains: function(str, elem) {
                return str.indexOf(elem) >= 0;
            },
            notContains: function(str, elem) {
                return !validators.contains(str, elem);
            },
            regex: function(str, pattern, modifiers) {
                str += "";
                if (Object.prototype.toString.call(pattern).slice(8, -1) !== "RegExp") {
                    pattern = new RegExp(pattern, modifiers);
                }
                return str.match(pattern);
            },
            notRegex: function(str, pattern, modifiers) {
                return !validators.regex(str, pattern, modifiers);
            },
            len: function(str, min, max) {
                return str.length >= min && (max === undefined || str.length <= max);
            },
            isUUID: function(str, version) {
                var pattern;
                if (version == 3 || version == "v3") {
                    pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
                } else if (version == 4 || version == "v4") {
                    pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
                } else {
                    pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
                }
                return str.match(pattern);
            },
            isDate: function(str) {
                var intDate = Date.parse(str);
                return !isNaN(intDate);
            },
            isAfter: function(str, date) {
                date = date || new Date;
                var origDate = toDate(str);
                var compDate = toDate(date);
                return !(origDate && compDate && origDate <= compDate);
            },
            isBefore: function(str, date) {
                date = date || new Date;
                var origDate = toDate(str);
                var compDate = toDate(date);
                return !(origDate && compDate && origDate >= compDate);
            },
            isIn: function(str, options) {
                var validOptions = options && typeof options.indexOf === "function";
                return validOptions && ~options.indexOf(str);
            },
            notIn: function(str, options) {
                var validOptions = options && typeof options.indexOf === "function";
                return validOptions && options.indexOf(str) === -1;
            },
            min: function(str, val) {
                var number = parseFloat(str);
                return isNaN(number) || number >= val;
            },
            max: function(str, val) {
                var number = parseFloat(str);
                return isNaN(number) || number <= val;
            },
            isArray: function(str) {
                return typeof str === "object" && Object.prototype.toString.call(str) === "[object Array]";
            },
            isCreditCard: function(str) {
                var sanitized = str.replace(/[^0-9]+/g, "");
                if (sanitized.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/) === null) {
                    return null;
                }
                var sum = 0;
                var digit;
                var tmpNum;
                var shouldDouble = false;
                for (var i = sanitized.length - 1; i >= 0; i--) {
                    digit = sanitized.substring(i, i + 1);
                    tmpNum = parseInt(digit, 10);
                    if (shouldDouble) {
                        tmpNum *= 2;
                        if (tmpNum >= 10) {
                            sum += tmpNum % 10 + 1;
                        } else {
                            sum += tmpNum;
                        }
                    } else {
                        sum += tmpNum;
                    }
                    if (shouldDouble) {
                        shouldDouble = false;
                    } else {
                        shouldDouble = true;
                    }
                }
                if (sum % 10 === 0) {
                    return sanitized;
                } else {
                    return null;
                }
            }
        };
        return module.exports;
    });
    define("validator/lib/defaultError.js", function(require, module, exports, __dirname, __filename) {
        var defaultError = module.exports = {
            isEmail: "Invalid email",
            isUrl: "Invalid URL",
            isIP: "Invalid IP",
            isAlpha: "Invalid characters",
            isAlphanumeric: "Invalid characters",
            isHexadecimal: "Invalid hexadecimal",
            isHexColor: "Invalid hexcolor",
            isNumeric: "Invalid number",
            isLowercase: "Invalid characters",
            isUppercase: "Invalid characters",
            isInt: "Invalid integer",
            isDecimal: "Invalid decimal",
            isDivisibleBy: "Not divisible",
            notNull: "String is empty",
            isNull: "String is not empty",
            notEmpty: "String is empty",
            equals: "Not equal",
            contains: "Invalid characters",
            notContains: "Invalid characters",
            regex: "Invalid characters",
            notRegex: "Invalid characters",
            len: "String is not in range",
            isUUID: "Not a UUID",
            isDate: "Not a date",
            isAfter: "Invalid date",
            isBefore: "Invalid date",
            isIn: "Unexpected value or invalid argument",
            notIn: "Unexpected value or invalid argument",
            min: "Invalid number",
            max: "Invalid number",
            isArray: "Not an array",
            isCreditCard: "Invalid credit card"
        };
        return module.exports;
    });
    define("validator/lib/entities.js", function(require, module, exports, __dirname, __filename) {
        var entities = {
            "&nbsp;": " ",
            "&iexcl;": "¡",
            "&cent;": "¢",
            "&pound;": "£",
            "&euro;": "€",
            "&yen;": "¥",
            "&brvbar;": "Š",
            "&sect;": "§",
            "&uml;": "š",
            "&copy;": "©",
            "&ordf;": "ª",
            "&laquo;": "«",
            "&not;": "¬",
            "&shy;": "­",
            "&reg;": "®",
            "&macr;": "¯",
            "&deg;": "°",
            "&plusmn;": "±",
            "&sup2;": "²",
            "&sup3;": "³",
            "&acute;": "Ž",
            "&micro;": "µ",
            "&para;": "¶",
            "&middot;": "·",
            "&cedil;": "ž",
            "&sup1;": "¹",
            "&ordm;": "º",
            "&raquo;": "»",
            "&frac14;": "Œ",
            "&frac12;": "½",
            "&frac34;": "Ÿ",
            "&iquest;": "¿",
            "&Agrave;": "À",
            "&Aacute;": "Á",
            "&Acirc;": "Â",
            "&Atilde;": "Ã",
            "&Auml;": "Ä",
            "&Aring;": "Å",
            "&AElig;": "Æ",
            "&Ccedil;": "Ç",
            "&Egrave;": "È",
            "&Eacute;": "É",
            "&Ecirc;": "Ê",
            "&Euml;": "Ë",
            "&Igrave;": "Ì",
            "&Iacute;": "Í",
            "&Icirc;": "Î",
            "&Iuml;": "Ï",
            "&ETH;": "Ð",
            "&Ntilde;": "Ñ",
            "&Ograve;": "Ò",
            "&Oacute;": "Ó",
            "&Ocirc;": "Ô",
            "&Otilde;": "Õ",
            "&Ouml;": "Ö",
            "&times;": "×",
            "&Oslash;": "Ø",
            "&Ugrave;": "Ù",
            "&Uacute;": "Ú",
            "&Ucirc;": "Û",
            "&Uuml;": "Ü",
            "&Yacute;": "Ý",
            "&THORN;": "Þ",
            "&szlig;": "ß",
            "&agrave;": "à",
            "&aacute;": "á",
            "&acirc;": "â",
            "&atilde;": "ã",
            "&auml;": "ä",
            "&aring;": "å",
            "&aelig;": "æ",
            "&ccedil;": "ç",
            "&egrave;": "è",
            "&eacute;": "é",
            "&ecirc;": "ê",
            "&euml;": "ë",
            "&igrave;": "ì",
            "&iacute;": "í",
            "&icirc;": "î",
            "&iuml;": "ï",
            "&eth;": "ð",
            "&ntilde;": "ñ",
            "&ograve;": "ò",
            "&oacute;": "ó",
            "&ocirc;": "ô",
            "&otilde;": "õ",
            "&ouml;": "ö",
            "&divide;": "÷",
            "&oslash;": "ø",
            "&ugrave;": "ù",
            "&uacute;": "ú",
            "&ucirc;": "û",
            "&uuml;": "ü",
            "&yacute;": "ý",
            "&thorn;": "þ",
            "&yuml;": "ÿ",
            "&quot;": '"',
            "&lt;": "<",
            "&gt;": ">",
            "&apos;": "'",
            "&minus;": "−",
            "&circ;": "ˆ",
            "&tilde;": "˜",
            "&Scaron;": "Š",
            "&lsaquo;": "‹",
            "&OElig;": "Œ",
            "&lsquo;": "‘",
            "&rsquo;": "’",
            "&ldquo;": "“",
            "&rdquo;": "”",
            "&bull;": "•",
            "&ndash;": "–",
            "&mdash;": "—",
            "&trade;": "™",
            "&scaron;": "š",
            "&rsaquo;": "›",
            "&oelig;": "œ",
            "&Yuml;": "Ÿ",
            "&fnof;": "ƒ",
            "&Alpha;": "Α",
            "&Beta;": "Β",
            "&Gamma;": "Γ",
            "&Delta;": "Δ",
            "&Epsilon;": "Ε",
            "&Zeta;": "Ζ",
            "&Eta;": "Η",
            "&Theta;": "Θ",
            "&Iota;": "Ι",
            "&Kappa;": "Κ",
            "&Lambda;": "Λ",
            "&Mu;": "Μ",
            "&Nu;": "Ν",
            "&Xi;": "Ξ",
            "&Omicron;": "Ο",
            "&Pi;": "Π",
            "&Rho;": "Ρ",
            "&Sigma;": "Σ",
            "&Tau;": "Τ",
            "&Upsilon;": "Υ",
            "&Phi;": "Φ",
            "&Chi;": "Χ",
            "&Psi;": "Ψ",
            "&Omega;": "Ω",
            "&alpha;": "α",
            "&beta;": "β",
            "&gamma;": "γ",
            "&delta;": "δ",
            "&epsilon;": "ε",
            "&zeta;": "ζ",
            "&eta;": "η",
            "&theta;": "θ",
            "&iota;": "ι",
            "&kappa;": "κ",
            "&lambda;": "λ",
            "&mu;": "μ",
            "&nu;": "ν",
            "&xi;": "ξ",
            "&omicron;": "ο",
            "&pi;": "π",
            "&rho;": "ρ",
            "&sigmaf;": "ς",
            "&sigma;": "σ",
            "&tau;": "τ",
            "&upsilon;": "υ",
            "&phi;": "φ",
            "&chi;": "χ",
            "&psi;": "ψ",
            "&omega;": "ω",
            "&thetasym;": "ϑ",
            "&upsih;": "ϒ",
            "&piv;": "ϖ",
            "&ensp;": " ",
            "&emsp;": " ",
            "&thinsp;": " ",
            "&zwnj;": "‌",
            "&zwj;": "‍",
            "&lrm;": "‎",
            "&rlm;": "‏",
            "&sbquo;": "‚",
            "&bdquo;": "„",
            "&dagger;": "†",
            "&Dagger;": "‡",
            "&hellip;": "…",
            "&permil;": "‰",
            "&prime;": "′",
            "&Prime;": "″",
            "&oline;": "‾",
            "&frasl;": "⁄",
            "&euro;": "€",
            "&image;": "ℑ",
            "&weierp;": "℘",
            "&real;": "ℜ",
            "&alefsym;": "ℵ",
            "&larr;": "←",
            "&uarr;": "↑",
            "&rarr;": "→",
            "&darr;": "↓",
            "&harr;": "↔",
            "&crarr;": "↵",
            "&lArr;": "⇐",
            "&uArr;": "⇑",
            "&rArr;": "⇒",
            "&dArr;": "⇓",
            "&hArr;": "⇔",
            "&forall;": "∀",
            "&part;": "∂",
            "&exist;": "∃",
            "&empty;": "∅",
            "&nabla;": "∇",
            "&isin;": "∈",
            "&notin;": "∉",
            "&ni;": "∋",
            "&prod;": "∏",
            "&sum;": "∑",
            "&lowast;": "∗",
            "&radic;": "√",
            "&prop;": "∝",
            "&infin;": "∞",
            "&ang;": "∠",
            "&and;": "∧",
            "&or;": "∨",
            "&cap;": "∩",
            "&cup;": "∪",
            "&int;": "∫",
            "&there4;": "∴",
            "&sim;": "∼",
            "&cong;": "≅",
            "&asymp;": "≈",
            "&ne;": "≠",
            "&equiv;": "≡",
            "&le;": "≤",
            "&ge;": "≥",
            "&sub;": "⊂",
            "&sup;": "⊃",
            "&nsub;": "⊄",
            "&sube;": "⊆",
            "&supe;": "⊇",
            "&oplus;": "⊕",
            "&otimes;": "⊗",
            "&perp;": "⊥",
            "&sdot;": "⋅",
            "&lceil;": "⌈",
            "&rceil;": "⌉",
            "&lfloor;": "⌊",
            "&rfloor;": "⌋",
            "&lang;": "〈",
            "&rang;": "〉",
            "&loz;": "◊",
            "&spades;": "♠",
            "&clubs;": "♣",
            "&hearts;": "♥",
            "&diams;": "♦"
        };
        exports.decode = function(str) {
            if (!~str.indexOf("&")) return str;
            for (var i in entities) {
                str = str.replace(new RegExp(i, "g"), entities[i]);
            }
            str = str.replace(/&#x(0*[0-9a-f]{2,5});?/gi, function(m, code) {
                return String.fromCharCode(parseInt(+code, 16));
            });
            str = str.replace(/&#([0-9]{2,4});?/gi, function(m, code) {
                return String.fromCharCode(+code);
            });
            str = str.replace(/&amp;/g, "&");
            return str;
        };
        exports.encode = function(str) {
            str = str.replace(/&/g, "&amp;");
            str = str.replace(/'/g, "&#39;");
            for (var i in entities) {
                str = str.replace(new RegExp(entities[i], "g"), i);
            }
            return str;
        };
        return module.exports;
    });
    define("verify/lib/sanitizers.js", function(require, module, exports, __dirname, __filename) {
        var structr = require("structr/lib/index.js");
        module.exports = structr({
            __construct: function() {
                this._source = [];
            },
            add: function(match, sanitizer) {
                if (arguments.length === 1) {
                    sanitizer = match;
                    match = null;
                }
                this._source.push({
                    match: match,
                    sanitize: sanitizer
                });
            },
            sanitize: function(value) {
                var newValue = value;
                for (var i = this._source.length; i--; ) {
                    var sanitizer = this._source[i];
                    if (!sanitizer.match || sanitizer.test(String(newValue))) {
                        newValue = sanitize(newValue);
                    }
                }
                return newValue;
            }
        });
        return module.exports;
    });
    define("verify/lib/matchers.js", function(require, module, exports, __dirname, __filename) {
        var structr = require("structr/lib/index.js");
        module.exports = structr({
            __construct: function(testers, pos) {
                this._testers = testers;
                this._source = [];
                this._pos = pos !== undefined;
            },
            add: function(value) {
                var match;
                if (value.test) {
                    match = value;
                } else if (typeof value == "string") {
                    match = this._testers.get(value);
                } else if (typeof value == "function") {
                    match = {
                        test: value
                    };
                }
                this._source.push(match);
            },
            test: function(value) {
                for (var i = 0, n = this._source.length; i < n; i++) {
                    var match = this._source[i];
                    if (!match.test(value)) return !this._pos;
                }
                return this._pos;
            },
            sanitize: function(value) {
                var newValue = value;
                for (var i = 0, n = this._source.length; i < n; i++) {
                    var match = this._source[i];
                    if (match.sanitize) match.sanitize(newValue);
                }
                return newValue;
            }
        });
        return module.exports;
    });
    define("verify/lib/siblings.js", function(require, module, exports, __dirname, __filename) {
        var structr = require("structr/lib/index.js");
        module.exports = structr({
            __construct: function() {
                this._source = [];
            },
            add: function(tester) {
                this._testers.push(tester);
            },
            validate: function(value) {
                for (var i = this._testers.length; i--; ) {
                    if (!this._testers.validate(newValue)) return false;
                }
                return true;
            },
            sanitize: function(value) {
                var newValue = value;
                for (var i = this._testers.length; i--; ) {
                    newValue = this._testers.sanitize(newValue);
                }
                return newValue;
            }
        });
        return module.exports;
    });
    define("mannequin/lib/utils.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var type, _flatten;
            type = require("type-component/index.js");
            _flatten = function(target, path, context) {
                var cp, key, kk, v;
                for (key in target) {
                    v = target[key];
                    cp = path.concat(key);
                    kk = cp.join(".");
                    if (key.substr(0, 1) === "$") {
                        context[path.join(".")] = target;
                        return;
                    } else if (!v) {
                        continue;
                    } else if (type(v) === "array") {
                        context[kk] = v;
                    } else if (type(v) === "object") {
                        if (exports.isSchema(v)) {
                            context[kk] = v;
                        } else {
                            _flatten(v, cp.concat(), context);
                        }
                    } else {
                        context[kk] = v;
                    }
                }
                return context;
            };
            exports.isSchema = function(target) {
                return !!target && target.__isSchema;
            };
            exports.flattenDefinitions = function(target) {
                return _flatten(target, [], {});
            };
            exports.firstKey = function(target) {
                var k;
                for (k in target) {
                    return k;
                }
            };
        }).call(this);
        return module.exports;
    });
    define("mannequin/lib/propertyDefinition.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PropertyDefinition, async, dref, toarray, type, utils, verify;
            dref = require("dref/lib/index.js");
            utils = require("mannequin/lib/utils.js");
            verify = require("verify/lib/index.js")();
            async = require("async/lib/async.js");
            toarray = require("toarray/index.js");
            type = require("type-component/index.js");
            PropertyDefinition = function() {
                function PropertyDefinition(schema, key, options) {
                    var keyParts;
                    this.schema = schema;
                    keyParts = key.split(" ");
                    this.key = keyParts.pop();
                    this.scope = keyParts.pop() || "private";
                    this.options = this._fixDefnition(options);
                    this._validateDefinition();
                    this._createValidators();
                }
                PropertyDefinition.prototype.test = function(target, callback) {
                    var originalValue, testV, v, _this = this;
                    if (this.options.$validate === false) {
                        return callback();
                    }
                    originalValue = dref.get(target, this.key);
                    v = testV = originalValue != null ? originalValue : this._default(target);
                    if (testV && testV.source) {
                        testV = testV.source();
                    }
                    if ((testV === void 0 || testV === null || typeof testV === "string" && !testV.length) && this.options.$required) {
                        return callback(new Error('"' + this.key + '" must be present'));
                    }
                    return async.forEach(this._testers, function(tester, next) {
                        return tester(testV, next);
                    }, function(err) {
                        if (err) {
                            return callback(new Error(_this.options.message || '"' + _this.key + '" is invalid'));
                        }
                        if (v !== originalValue) {
                            dref.set(target, _this.key, v);
                        }
                        return callback();
                    });
                };
                PropertyDefinition.prototype.schemaRef = function() {
                    if (!this.options.$ref) {
                        return null;
                    }
                    return this.schema.dictionary().getSchema(this.options.$ref);
                };
                PropertyDefinition.prototype._fixDefnition = function(definition) {
                    var def;
                    if (typeof definition === "string" && utils.firstKey(definition).substr(0, 1) !== "$") {
                        return {
                            $type: definition
                        };
                    } else if (type(definition) === "array") {
                        def = this._fixDefnition(definition[0]);
                        def.$multi = true;
                        def.$default = function() {
                            return [];
                        };
                        return def;
                    } else {
                        return definition;
                    }
                };
                PropertyDefinition.prototype._validateDefinition = function() {
                    if (!this.options.$type && !this.options.$ref) {
                        throw new Error("definition type must exist for " + this.key);
                    }
                };
                PropertyDefinition.prototype._createValidators = function() {
                    var testers, _this = this;
                    testers = [];
                    if (this.options.$ref) {
                        testers.push(this._multi(function(item, next) {
                            return _this.schemaRef().test(item, next);
                        }));
                    } else {}
                    if (this.options.$type) {
                        testers.push(this._multi(this._generateTypeTester()));
                    }
                    return this._testers = testers;
                };
                PropertyDefinition.prototype._generateTypeTester = function() {
                    var k, key, tester;
                    if (this.options.$test) {
                        return this.options.$test;
                    }
                    tester = verify.tester().is(this.options.$type);
                    for (key in this.options) {
                        k = key.substr(1);
                        if (!!tester[k]) {
                            tester[k].apply(tester, toarray(this.options[key]));
                        }
                    }
                    return tester;
                };
                PropertyDefinition.prototype._multi = function(tester) {
                    tester = this._tester(tester);
                    return function(value, next) {
                        return async.forEach(toarray(value), function(value, next) {
                            return tester(value, next);
                        }, next);
                    };
                };
                PropertyDefinition.prototype._default = function(target) {
                    if (!this.options.$default) {
                        return this.options.$default;
                    }
                    if (typeof this.options.$default === "function") {
                        return this.options.$default.call(target);
                    }
                    return this.options.$default;
                };
                PropertyDefinition.prototype._getSchema = function(value) {
                    var _ref;
                    return (_ref = this.schema.dictionary()) != null ? _ref.getSchema(value) : void 0;
                };
                PropertyDefinition.prototype._tester = function(target) {
                    var context, test;
                    context = this;
                    test = null;
                    if (typeof target === "function") {
                        test = target;
                    } else if (target.test) {
                        test = target.test;
                        context = target;
                    }
                    return function(value, next) {
                        if (test.length === 1) {
                            return next(!test.call(context, value));
                        } else {
                            return test.call(context, value, next);
                        }
                    };
                };
                return PropertyDefinition;
            }();
            module.exports = PropertyDefinition;
        }).call(this);
        return module.exports;
    });
    define("mannequin/lib/modelBuilder.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var EventEmitter, Model, ModelBuilder, Virtual, async, bindable, outcome, step, toarray, _, _modelClassId, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            }, __slice = [].slice, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            _ = require("underscore/underscore.js");
            toarray = require("toarray/index.js");
            async = require("async/lib/async.js");
            step = require("stepc/lib/step.js");
            Model = require("mannequin/lib/model.js");
            bindable = require("bindable/lib/index.js");
            outcome = require("outcome/lib/index.js");
            EventEmitter = require("events/index.js").EventEmitter;
            _modelClassId = 0;
            Virtual = function() {
                Virtual.prototype.__isVirtual = true;
                function Virtual(key) {
                    this.key = key;
                    this.call = __bind(this.call, this);
                    this.get(function() {
                        return this[key];
                    });
                    this.set(function(value) {
                        return this[key] = value;
                    });
                    this._bindings = [];
                }
                Virtual.prototype.call = function(context, value) {
                    if (arguments.length === 1) {
                        return this._get.call(context);
                    } else {
                        return this._set.call(context, value);
                    }
                    return this;
                };
                Virtual.prototype.setupBindings = function(context) {
                    var binding, self, _i, _len, _ref, _results, _this = this;
                    self = this;
                    _ref = this._bindings;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        binding = _ref[_i];
                        _results.push(function() {
                            return context.bind(binding, function(value) {
                                return context.emit("change:" + self.key, value);
                            });
                        }());
                    }
                    return _results;
                };
                Virtual.prototype.get = function(_get) {
                    this._get = _get;
                    return this;
                };
                Virtual.prototype.set = function(_set) {
                    this._set = _set;
                    return this;
                };
                Virtual.prototype.bind = function() {
                    var _bindings;
                    _bindings = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                    this._bindings = _bindings;
                };
                return Virtual;
            }();
            module.exports = ModelBuilder = function(_super) {
                __extends(ModelBuilder, _super);
                function ModelBuilder(dictionary, name, schema) {
                    this.dictionary = dictionary;
                    this.name = name;
                    this.schema = schema;
                    this._castRefClass = __bind(this._castRefClass, this);
                    this._virtuals = {};
                    this._pre = {};
                    this._post = {};
                    this.properties = this.methods = this.getClass().prototype;
                    this.statics = this.getClass();
                    this._setupMethods();
                }
                ModelBuilder.prototype.pre = function(keys, callback) {
                    return this._registerPrePost(this._pre, keys, callback);
                };
                ModelBuilder.prototype.post = function(keys, callback) {
                    return this._registerPrePost(this._post, keys, callback);
                };
                ModelBuilder.prototype["static"] = function(key, callback) {
                    var k;
                    if (arguments.length === 1) {
                        for (k in key) {
                            this["static"](k, key[k]);
                            return;
                        }
                    }
                    return this.getClass()[key] = callback;
                };
                ModelBuilder.prototype.virtual = function(key) {
                    return this._virtuals[key] || (this._virtuals[key] = new Virtual(key));
                };
                ModelBuilder.prototype.initModel = function(model) {
                    var def, _i, _len, _ref, _results;
                    _ref = this.schema.refs();
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        def = _ref[_i];
                        _results.push(this._initPropertyTransformation(model, def));
                    }
                    return _results;
                };
                ModelBuilder.prototype._initPropertyTransformation = function(model, def) {
                    var transformer;
                    transformer = model.transform(def.key);
                    this.emit("transformModelProperty", model, def);
                    if (def.options.$multi) {
                        this._initCollectionTransformation(model, transformer, def);
                    } else {
                        this._initModelTransformation(model, transformer, def);
                    }
                    return transformer.reset();
                };
                ModelBuilder.prototype._initCollectionTransformation = function(model, transformer, def) {
                    var refClass, _this = this;
                    refClass = this.dictionary.modelBuilder(def.options.$ref).getClass();
                    transformer.map(function(source) {
                        var col;
                        col = _this.createCollection(model, def);
                        col.parent = model;
                        _this._initCollectionItemTransformation(col, def, refClass);
                        col.reset(source);
                        return col;
                    });
                    if (!model.get(def.key)) {
                        return model._set(def.key, []);
                    }
                };
                ModelBuilder.prototype._initCollectionItemTransformation = function(col, def, refClass) {
                    return col.transform().map(this._castRefClass(refClass)).map(function(item) {
                        item.parent = col;
                        item.definition = def;
                        return item;
                    });
                };
                ModelBuilder.prototype._initModelTransformation = function(model, transformer, def) {
                    var refClass, virtual, _results;
                    refClass = this.dictionary.modelBuilder(def.options.$ref).getClass();
                    transformer.map(this._castRefClass(refClass)).map(function(model) {
                        model.definition = def;
                        return model;
                    });
                    _results = [];
                    for (virtual in this._virtuals) {
                        _results.push(this._virtuals[virtual].setupBindings(model));
                    }
                    return _results;
                };
                ModelBuilder.prototype._castRefClass = function(refClass) {
                    return function(item) {
                        if (!item) {
                            return;
                        }
                        if (item.classId === refClass.prototype.classId) {
                            return item;
                        }
                        if (item.classId) {
                            item = item.data;
                        }
                        return new refClass(item);
                    };
                };
                ModelBuilder.prototype.createCollection = function(item) {
                    return new bindable.Collection;
                };
                ModelBuilder.prototype.getClass = function() {
                    var clazz;
                    if (this._class) {
                        return this._class;
                    }
                    clazz = this._class = function() {
                        return clazz.__super__.constructor.apply(this, arguments);
                    };
                    this._class.prototype = _.extend({}, Model.prototype);
                    this._class.prototype.schema = this.schema;
                    this._class.prototype.constructor = clazz;
                    this._class.__super__ = Model.prototype;
                    this._class.prototype.builder = this;
                    this._class.prototype.dictionary = this.dictionary;
                    this._class.prototype._pre = this._pre;
                    this._class.prototype._post = this._post;
                    this._class.prototype.classId = ++_modelClassId;
                    this._class.prototype._virtual = this._virtuals;
                    this._class.builder = this;
                    return this._class;
                };
                ModelBuilder.prototype.setClass = function(_class) {
                    this._class = _class;
                    return this;
                };
                ModelBuilder.prototype._registerPrePost = function(pp, keys, callback) {
                    var key, _i, _len, _ref;
                    _ref = toarray(keys);
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        key = _ref[_i];
                        this._prePost(pp, key).push(callback);
                    }
                    return this;
                };
                ModelBuilder.prototype._setupMethods = function() {
                    var _this = this;
                    return this.methods.model = function(name) {
                        return _this.dictionary.modelBuilder(name).getClass();
                    };
                };
                ModelBuilder.prototype._prePost = function(pp, key) {
                    var original, post, pre;
                    if (pp[key]) {
                        return pp[key];
                    }
                    this._pre[key] = [];
                    this._post[key] = [];
                    original = this._class.prototype[key];
                    pre = this._pre[key];
                    post = this._post[key];
                    this._class.prototype[key] = function(next) {
                        var o, self;
                        o = outcome.e(next);
                        self = this;
                        return step.async(function() {
                            return async.eachSeries(pre, function(fn, next) {
                                return fn.call(self, next);
                            }, this);
                        }, o.s(function() {
                            if (!original) {
                                return this();
                            }
                            return original.call(self, this);
                        }), o.s(function() {
                            return async.eachSeries(post, function(fn, next) {
                                return fn.call(self, next);
                            }, this);
                        }), next);
                    };
                    return this._prePost(pp, key);
                };
                return ModelBuilder;
            }(EventEmitter);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableSetter, Binding, bindableSetter, deepPropertyWatcher, hoist, toarray, utils, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            BindableSetter = require("bindable/lib/object/setters/factory.js");
            bindableSetter = new BindableSetter;
            utils = require("bindable/lib/core/utils.js");
            hoist = require("hoist/lib/index.js");
            toarray = require("toarray/index.js");
            deepPropertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
            module.exports = Binding = function() {
                Binding.prototype.__isBinding = true;
                function Binding(_from, _property) {
                    this._from = _from;
                    this._property = _property;
                    this._trigger = __bind(this._trigger, this);
                    this.dispose = __bind(this.dispose, this);
                    this._limit = -1;
                    this._setters = [];
                    this._triggerCount = 0;
                    this._listen();
                }
                Binding.prototype.watch = function(value) {
                    if (!arguments.length) {
                        return this._watch;
                    }
                    this._watch = value;
                    return this;
                };
                Binding.prototype.collection = function() {
                    if (this._collectionBinding) {
                        return this._collectionBinding;
                    }
                    this._collection = new Binding.Collection;
                    this.to(this._collection.source);
                    return this._collectionBinding = this._collection.bind().copyId(true);
                };
                Binding.prototype.to = function(target, property) {
                    var setter;
                    setter = bindableSetter.createSetter(this, target, property);
                    if (setter) {
                        this._setters.push(setter);
                    }
                    return this;
                };
                Binding.prototype.from = function(from, property) {
                    if (arguments.length === 1) {
                        property = from;
                        from = this._from;
                    }
                    return from.bind(property).to(this._from, this._property);
                };
                Binding.prototype.transform = function(options) {
                    if (!arguments.length) {
                        return this._transform;
                    }
                    this._transform = utils.transformer(options);
                    return this;
                };
                Binding.prototype._transformer = function() {
                    return this._transform || (this._transform = utils.transformer(options));
                };
                Binding.prototype.once = function() {
                    return this.limit(0);
                };
                Binding.prototype.limit = function(count) {
                    this._limit = count;
                    return this;
                };
                Binding.prototype.isBothWays = function() {
                    return !!this._boundBothWays;
                };
                Binding.prototype.bothWays = function() {
                    if (this._boundBothWays) {
                        return this;
                    }
                    this._boundBothWays = true;
                    this._callSetterFns("bothWays");
                    return this;
                };
                Binding.prototype.dispose = function() {
                    this._callSetterFns("dispose");
                    this._setters = [];
                    if (this._collectionBinding) {
                        this._collectionBinding.dispose();
                    }
                    if (this._listener) {
                        this._listener.dispose();
                        this._disposeListener.dispose();
                    }
                    this._listener = void 0;
                    this._disposeListener = void 0;
                    return this;
                };
                Binding.prototype._trigger = function() {
                    this._callSetterFns("change", [ this._from.get(this._property) ]);
                    if (~this._limit && ++this._triggerCount > this._limit) {
                        this.dispose();
                    }
                    return this;
                };
                Binding.prototype._callSetterFns = function(method, args) {
                    var setter, _i, _len, _ref, _results;
                    _ref = this._setters;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        _results.push(setter[method].apply(setter, args || []));
                    }
                    return _results;
                };
                Binding.prototype._listen = function() {
                    this._listener = deepPropertyWatcher.create({
                        target: this._from,
                        property: this._property,
                        callback: this._trigger
                    });
                    return this._disposeListener = this._from.once("dispose", this.dispose);
                };
                return Binding;
            }();
            Binding.fromOptions = function(target, options) {
                var binding, t, to, tops, _i, _len;
                binding = target.bind(options.property || options.from);
                to = toarray(options.to);
                for (_i = 0, _len = to.length; _i < _len; _i++) {
                    t = to[_i];
                    tops = typeof t === "object" ? t.property : {
                        property: t
                    };
                    if (tops.transform) {
                        bindings.transform(tops.transform);
                    }
                    binding.to(tops.property);
                }
                if (options.limit) {
                    binding.limit(options.limit);
                }
                if (options.once) {
                    binding.once();
                }
                if (options.bothWays) {
                    binding.bothWays();
                }
                return binding;
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Bindable, Binding, Builder, EventEmitter, dref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            dref = require("bindable/lib/object/dref.js");
            require("dref/lib/index.js").use(require("bindable/lib/shim/dref.js"));
            EventEmitter = require("bindable/lib/core/eventEmitter.js");
            Binding = require("bindable/lib/object/binding.js");
            Builder = require("bindable/lib/core/builder.js");
            module.exports = Bindable = function(_super) {
                __extends(Bindable, _super);
                Bindable.prototype.__isBindable = true;
                function Bindable(data) {
                    Bindable.__super__.constructor.call(this);
                    this._initData(data);
                    this._bindings = [];
                }
                Bindable.prototype._initData = function(data) {
                    this.data = data != null ? data : {};
                };
                Bindable.prototype.get = function(key, flatten) {
                    var _ref;
                    if (flatten == null) {
                        flatten = false;
                    }
                    return (_ref = dref.get(this.data, key, flatten)) != null ? _ref : dref.get(this[key.split(".").shift()], key.split(".").slice(1).join("."), flatten);
                };
                Bindable.prototype.getFlatten = function(key) {
                    return this.get(key, true);
                };
                Bindable.prototype.has = function(key) {
                    return !!this.get(key);
                };
                Bindable.prototype.set = function(key, value) {
                    var k;
                    if (arguments.length === 1) {
                        for (k in key) {
                            this.set(k, key[k]);
                        }
                        return;
                    }
                    if (value && value.__isBinding) {
                        value.to(this, key);
                        return;
                    }
                    return this._set(key, value);
                };
                Bindable.prototype._set = function(key, value) {
                    if (!dref.set(this, key, value)) {
                        return this;
                    }
                    this.emit("change:" + key, value);
                    this.emit("change", value);
                    return this;
                };
                Bindable.prototype._ref = function(context, key) {
                    if (!key) {
                        return context;
                    }
                    return dref.get(context, key);
                };
                Bindable.prototype.bind = function(property, to) {
                    if (typeof property === "object") {
                        return Binding.fromOptions(this, property);
                    }
                    if (to && to.__isBinding) {
                        this.set(property, to);
                        return;
                    }
                    return (new Binding(this, property)).to(to);
                };
                Bindable.prototype.dispose = function() {
                    return this.emit("dispose");
                };
                Bindable.prototype.toJSON = function() {
                    return this.data;
                };
                return Bindable;
            }(EventEmitter);
            new Builder(Binding, Bindable);
            module.exports.EventEmitter = EventEmitter;
            module.exports.propertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableObject, Binding, EventEmitter, dref, hoist, type, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            dref = require("dref/lib/index.js");
            Binding = require("bindable/lib/collection/binding.js");
            EventEmitter = require("bindable/lib/core/eventEmitter.js");
            type = require("type-component/index.js");
            hoist = require("hoist/lib/index.js");
            BindableObject = require("bindable/lib/object/index.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                _Class.prototype.__isCollection = true;
                function _Class(source, _id) {
                    if (source == null) {
                        source = [];
                    }
                    if (_id == null) {
                        _id = "_id";
                    }
                    this._enforceItemId = __bind(this._enforceItemId, this);
                    this.reset = __bind(this.reset, this);
                    this.source = __bind(this.source, this);
                    _Class.__super__.constructor.call(this);
                    this._source = [];
                    if (type(source) === "string") {
                        _id = source;
                        source = [];
                    }
                    this._length = 0;
                    this._id(_id);
                    this.__enforceId = true;
                    this.transform().postMap(this._enforceItemId);
                    this.reset(source);
                }
                _Class.prototype.empty = function() {
                    return !this._length;
                };
                _Class.prototype.length = function() {
                    return this._length;
                };
                _Class.prototype.source = function(value) {
                    if (!arguments.length) {
                        return this._source;
                    }
                    return this.reset(value);
                };
                _Class.prototype.reset = function(source) {
                    if (!source) {
                        source = [];
                    }
                    this.disposeSourceBinding();
                    this._remove(this._source || []);
                    if (source.__isCollection) {
                        this._source = [];
                        this._id(source._id());
                        this._sourceBinding = source.bind().to(this);
                        return this;
                    }
                    this._insert(this._source = this._transform(source));
                    return this;
                };
                _Class.prototype.disposeSourceBinding = function() {
                    if (this._sourceBinding) {
                        this._sourceBinding.dispose();
                        return this._sourceBinding = void 0;
                    }
                };
                _Class.prototype.bind = function(to) {
                    if (type(to) === "string") {
                        return _Class.__super__.bind.apply(this, arguments);
                    }
                    return (new Binding(this)).to(to);
                };
                _Class.prototype.set = function(key, value) {
                    var k;
                    k = Number(key);
                    if (isNaN(k)) {
                        return _Class.__super__.set.apply(this, arguments);
                    }
                    return this.splice(k, value);
                };
                _Class.prototype.get = function(key) {
                    var k;
                    k = Number(key);
                    if (isNaN(k)) {
                        return _Class.__super__.get.call(this, key);
                    }
                    return this.at(k);
                };
                _Class.prototype.at = function(index) {
                    return this._source[index];
                };
                _Class.prototype.first = function() {
                    return this._source[0];
                };
                _Class.prototype.last = function() {
                    return this._source[this._length - 1];
                };
                _Class.prototype.update = function(item) {};
                _Class.prototype.remove = function(item) {
                    var index;
                    index = this.indexOf(item);
                    if (!~index) {
                        return false;
                    }
                    this.splice(index, 1);
                    return true;
                };
                _Class.prototype.filter = function(cb) {
                    return this._source.filter(cb);
                };
                _Class.prototype.splice = function(index, count) {
                    var args, remove;
                    args = Array.prototype.slice.call(arguments);
                    args.splice(0, 2);
                    args = this._transform(args);
                    remove = this.slice(index, index + count);
                    this._source.splice.apply(this._source, arguments);
                    this._remove(remove, index);
                    return this._insert(args, index);
                };
                _Class.prototype.transform = function() {
                    return this._transformer || (this._transformer = hoist());
                };
                _Class.prototype.slice = function(start, end) {
                    return this._source.slice(start, end);
                };
                _Class.prototype.indexOf = function(searchItem) {
                    var i, item, _i, _len, _ref;
                    _ref = this._source;
                    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                        item = _ref[i];
                        if (dref.get(item, this.__id) === dref.get(searchItem, this.__id)) {
                            return i;
                        }
                    }
                    return -1;
                };
                _Class.prototype._id = function(key) {
                    if (!arguments.length) {
                        return this.__id;
                    }
                    if (this.__id === key) {
                        return this;
                    }
                    this.__id = key;
                    if (this._source) {
                        this._enforceId();
                    }
                    return this;
                };
                _Class.prototype.push = function() {
                    var items;
                    items = this._transform(Array.prototype.slice.call(arguments));
                    this._source.push.apply(this._source, items);
                    return this._insert(items, this._length);
                };
                _Class.prototype.unshift = function() {
                    var items;
                    items = this._transform(Array.prototype.slice.call(arguments));
                    this._source.unshift.apply(this._source, items);
                    return this._insert(items);
                };
                _Class.prototype.toJSON = function() {
                    var item, source, _i, _len, _ref;
                    source = [];
                    _ref = this._source;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        source.push((typeof item.toJSON === "function" ? item.toJSON() : void 0) || item);
                    }
                    return source;
                };
                _Class.prototype.pop = function() {
                    return this._remove([ this._source.pop() ], this._length)[0];
                };
                _Class.prototype.shift = function() {
                    return this._remove([ this._source.shift() ], 0)[0];
                };
                _Class.prototype.enforceId = function(value) {
                    if (!arguments.length) {
                        return this.__enforceId;
                    }
                    return this.__enforceId = value;
                };
                _Class.prototype._enforceId = function() {
                    var item, _i, _len, _ref, _results;
                    _ref = this._source;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        _results.push(this._enforceItemId(item));
                    }
                    return _results;
                };
                _Class.prototype._enforceItemId = function(item) {
                    var _id;
                    if (!this.__enforceId) {
                        return item;
                    }
                    _id = dref.get(item, this.__id);
                    if (_id === void 0 || _id === null) {
                        throw new Error("item '" + item + "' must have a '" + this.__id + "'");
                    }
                    return item;
                };
                _Class.prototype._insert = function(items, start) {
                    var i, item, _i, _len;
                    if (start == null) {
                        start = 0;
                    }
                    if (!items.length) {
                        return;
                    }
                    this._length += items.length;
                    this._resetInfo();
                    for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
                        item = items[i];
                        this.emit("insert", item, start + i);
                    }
                    return items;
                };
                _Class.prototype._remove = function(items, start) {
                    var i, item, _i, _len;
                    if (start == null) {
                        start = 0;
                    }
                    if (!items.length) {
                        return;
                    }
                    this._length -= items.length;
                    this._resetInfo();
                    for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
                        item = items[i];
                        this.emit("remove", item, start + i);
                    }
                    return items;
                };
                _Class.prototype._resetInfo = function() {
                    this.set("length", this._length);
                    return this.set("empty", !this._length);
                };
                _Class.prototype._transform = function(item, index, start) {
                    var i, results, _i, _len;
                    if (!this._transformer) {
                        return item;
                    }
                    if (type(item) === "array") {
                        results = [];
                        for (_i = 0, _len = item.length; _i < _len; _i++) {
                            i = item[_i];
                            results.push(this._transformer(i));
                        }
                        return results;
                    }
                    return this._transformer(item);
                };
                return _Class;
            }(BindableObject);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/core/eventEmitter.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var EventEmitter, disposable, events, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            events = require("events/index.js");
            disposable = require("disposable/lib/index.js");
            module.exports = EventEmitter = function(_super) {
                __extends(EventEmitter, _super);
                function EventEmitter() {
                    _ref = EventEmitter.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                EventEmitter.prototype.on = function(key, listener) {
                    var disposables, k, keys, listeners, _this = this;
                    disposables = disposable.create();
                    if (arguments.length === 1) {
                        listeners = key;
                        for (k in listeners) {
                            disposables.add(this.on(k, listeners[k]));
                        }
                        return disposables;
                    }
                    keys = [];
                    if (typeof key === "string") {
                        keys = key.split(" ");
                    } else {
                        keys = key;
                    }
                    keys.forEach(function(key) {
                        EventEmitter.__super__.on.call(_this, key, listener);
                        return disposables.add(function() {
                            return _this.off(key, listener);
                        });
                    });
                    return disposables;
                };
                EventEmitter.prototype.once = function(key, listener) {
                    var disp, oldListener;
                    oldListener = listener;
                    disp = this.on(key, function() {
                        disp.dispose();
                        return oldListener.apply(this, arguments);
                    });
                    disp.target = this;
                    return disp;
                };
                EventEmitter.prototype.off = function(key, listener) {
                    return this.removeListener(key, listener);
                };
                return EventEmitter;
            }(events.EventEmitter);
        }).call(this);
        return module.exports;
    });
    define("tq/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var EventEmitter = require("events/index.js").EventEmitter, hurryUp = require("hurryup/lib/index.js");
        exports.create = function() {
            var running = false, started = false, currentFn, queue = [], em = new EventEmitter, pargs = [], timeout = 0, next = function(err) {
                if (err) {
                    em.emit("error", err);
                }
                var callback = self.current = queue.pop();
                if (!callback || !started) {
                    pargs = arguments;
                    running = false;
                    currentFn = null;
                    em.emit("complete");
                    return;
                }
                running = true;
                currentFn = callback;
                var next = getNext();
                if (timeout) {
                    callback = hurryUp(callback, timeout);
                }
                try {
                    callback.apply(this, [ next ]);
                } catch (e) {
                    console.error(e.stack);
                    next();
                    em.emit("error", err);
                }
            }, currentQueue, tryRunning = function() {
                if (!running && started) {
                    next.apply(null, pargs);
                }
            }, getNext = function() {
                var called = false;
                return function() {
                    if (called) throw new Error("next already called");
                    called = true;
                    return next.apply(this, arguments);
                };
            };
            var self = {
                stack: queue,
                cq: function() {
                    return currentQueue || self;
                },
                timeout: function(ms) {
                    timeout = ms;
                    return this;
                },
                running: function() {
                    return running;
                },
                currentFn: function() {
                    return currentFn;
                },
                push: function(callback) {
                    self.cq().stack.unshift(callback);
                    tryRunning();
                    return this;
                },
                unshift: function(callback) {
                    self.cq().stack.push(callback);
                    tryRunning();
                    return this;
                },
                now: function(callback) {
                    var tq = exports.create().stop(), oldCurrent = currentQueue;
                    currentQueue = tq;
                    callback(tq);
                    tq.start();
                    currentQueue = oldCurrent;
                    self.unshift(function(next) {
                        if (!tq.running()) return next();
                        tq.once("complete", next);
                    });
                    return this;
                },
                then: function(callback) {
                    self.push(function(next) {
                        callback();
                        next();
                    });
                },
                once: function() {
                    em.once.apply(em, arguments);
                },
                wait: function() {
                    var n;
                    self.push(function(next) {
                        if (n === true) return next();
                        n = next;
                    });
                    return function() {
                        if (n) n();
                        n = true;
                    };
                },
                on: function(type, callback) {
                    em.addListener(type, callback);
                },
                start: function() {
                    if (started) return this;
                    started = running = true;
                    em.emit("start");
                    next();
                    return this;
                },
                fn: function(fn) {
                    return function() {
                        var args = arguments, listeners = [];
                        return self.push(function() {
                            var next = this;
                            fn.apply({
                                next: function() {
                                    args = arguments;
                                    listeners.forEach(function(listener) {
                                        listener.apply(null, args);
                                    });
                                    next();
                                },
                                attach: function(listener) {
                                    listeners.push(listener);
                                }
                            }, args);
                        });
                    };
                },
                stop: function() {
                    started = running = false;
                    return this;
                }
            };
            return self.start();
        };
        return module.exports;
    });
    define("asyngleton/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var EventEmitter = require("events/index.js").EventEmitter;
        var singletonIndex = 0;
        function singleton(resetEachCall, fn) {
            if (arguments.length == 1) {
                fn = resetEachCall;
                resetEachCall = false;
            }
            var _id = singletonIndex++;
            var asyngleton = function() {
                var asyng = asyngleton.info.call(this), self = this;
                var args, cb, callback = arguments[arguments.length - 1];
                if (!(typeof callback == "function")) {
                    callback = function() {};
                }
                if (asyng.result) {
                    callback.apply(this, asyng.result);
                    return this;
                }
                asyng.em.once("singleton", callback);
                if (asyng.loading) {
                    return this;
                }
                asyng.loading = true;
                args = Array.prototype.slice.call(arguments, 0);
                cb = function() {
                    var result = asyng.result = Array.prototype.slice.call(arguments, 0);
                    if (resetEachCall) {
                        asyngleton.reset.call(self);
                    }
                    asyng.em.emit.apply(asyng.em, [ "singleton" ].concat(result));
                };
                args.pop();
                args.push(cb);
                fn.apply(this, args);
                return this;
            };
            asyngleton.reset = function() {
                var asyng = asyngleton.info.call(this);
                asyng.loading = false;
                asyng.result = undefined;
                return asyngleton;
            };
            asyngleton.info = function() {
                if (!this._asyngleton) {
                    this._asyngleton = {};
                }
                var asyng;
                if (!(asyng = this._asyngleton[_id])) {
                    asyng = this._asyngleton[_id] = {
                        result: null,
                        loading: false,
                        em: new EventEmitter
                    };
                }
                return asyng;
            };
            return asyngleton;
        }
        function createDictionary() {
            var _dict = {};
            return {
                get: function(key, fn) {
                    if (_dict[key]) return _dict[key];
                    var asyngleton = _dict[key] = singleton(fn);
                    asyngleton.dispose = function() {
                        delete _dict[key];
                    };
                    return asyngleton;
                }
            };
        }
        function structrFactory(that, property, value) {
            return singleton(value);
        }
        module.exports = singleton;
        module.exports.dictionary = createDictionary;
        module.exports.type = "operator";
        module.exports.factory = structrFactory;
        return module.exports;
    });
    define("beanpoll/lib/push/messenger.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Messenger, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Messenger = require("beanpoll/lib/concrete/messenger.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype._next = function(middleware) {
                    return middleware.listener.call(this, this.request.query, this);
                };
                _Class.prototype._onEnd = function() {
                    return this.response.end();
                };
                return _Class;
            }(Messenger);
        }).call(this);
        return module.exports;
    });
    define("beanpoll/lib/pull/messenger.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Messenger, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Messenger = require("beanpoll/lib/concrete/messenger.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.start = function() {
                    this.response.req = this.request;
                    return _Class.__super__.start.call(this);
                };
                _Class.prototype._next = function(middleware) {
                    return middleware.listener.call(this, this.request, this.response, this);
                };
                _Class.prototype._onError = function(error) {
                    return this.response.error(error);
                };
                return _Class;
            }(Messenger);
        }).call(this);
        return module.exports;
    });
    define("dolce/lib/tree.js", function(require, module, exports, __dirname, __filename) {
        var crema = require("crema/lib/index.js");
        var tree = module.exports = function(ops) {
            if (!ops) ops = {
                name: "",
                param: false,
                parent: null,
                depth: 0,
                deepest: 0
            };
            var _children = {}, _testableChildren = {}, self = {}, _parent = ops.parent, _root = ops.root || self, _hasListeners = false, _path = {
                value: ops.name,
                param: ops.param
            }, _pathStr = _parent ? _parent.path().value + "/" + ops.name : "/", _segments = _parent ? _parent.segments().concat(_path) : [ _path ], _pathStr = crema.stringifySegments(_segments);
            self.collections = {
                greedy: [],
                greedyExtend: [],
                extend: [],
                endpoint: []
            };
            var _addListener = self.addListener = function(type, data) {
                var collections = self.collections[type];
                data.path = _pathStr;
                data.type = type;
                if (type.indexOf("greedy") > -1) data.greedy = true;
                collections.push(data);
                _hasListeners = true;
                return {
                    dispose: function() {
                        var i = collections.indexOf(data);
                        if (i > -1) collections.splice(i, 1);
                    }
                };
            };
            var _greedyListeners = function() {
                if (!_parent) return [];
            };
            self.traverse = function(callback) {
                callback(this);
                for (var name in _children) {
                    _children[name].traverse(callback);
                }
                for (var key in _testableChildren) {
                    _testableChildren[key].traverse(callback);
                }
            };
            self.child = function(path, createIfNotFound) {
                var name = path.param ? "__param" : path.value;
                if (path.test) {
                    if (_testableChildren[path.test.source]) {
                        return _testableChildren[path.test.source];
                    }
                } else if (_children[name]) {
                    return _children[name];
                }
                if (createIfNotFound) {
                    var child = tree({
                        name: name,
                        param: path.param,
                        test: path.test,
                        parent: self,
                        root: _root,
                        depth: ops.depth + 1,
                        deepest: 0
                    });
                    if (path.test) {
                        _testableChildren[path.test.source] = child;
                    } else {
                        _children[name] = child;
                    }
                    return child;
                }
                return null;
            };
            self._test = function(segment) {
                return ops.test.test(segment.value);
            };
            function findTestedChild(path) {
                for (var key in _testableChildren) {
                    var child = _testableChildren[key];
                    if (child._test(path)) return child;
                }
            }
            self.findChild = function(segments) {
                return _findChildren(self, segments, 0);
            };
            var _findChild = self._findChild = function(segments, index, weighTowardsParam) {
                var currentPath, foundChild, childTree;
                if (segments.length - index === 0) {
                    return _hasListeners ? self : null;
                }
                currentPath = segments[index];
                if (!weighTowardsParam || !(childTree = _children.__param)) {
                    childTree = _children[currentPath.value] || findTestedChild(currentPath);
                }
                return childTree ? _findChildren(childTree, segments, index + 1) : null;
            };
            var _findChildren = function(tree, segments, index) {
                if (!tree) return null;
                var found;
                if (found = tree._findChild(segments, index, false)) return found;
                return tree._findChild(segments, index, true);
            };
            self.parent = function() {
                return _parent;
            };
            self.path = function() {
                return _path;
            };
            self.pathStr = function() {
                return _pathStr;
            };
            self.segments = function() {
                return _segments;
            };
            return self;
        };
        return module.exports;
    });
    define("util/index.js", function(require, module, exports, __dirname, __filename) {
        var events = require("events/index.js");
        var formatRegExp = /%[sdj%]/g;
        exports.format = function(f) {
            if (typeof f !== "string") {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                    objects.push(inspect(arguments[i]));
                }
                return objects.join(" ");
            }
            var i = 1;
            var args = arguments;
            var len = args.length;
            var str = String(f).replace(formatRegExp, function(x) {
                if (i >= len) return x;
                switch (x) {
                  case "%s":
                    return String(args[i++]);
                  case "%d":
                    return Number(args[i++]);
                  case "%j":
                    return JSON.stringify(args[i++]);
                  case "%%":
                    return "%";
                  default:
                    return x;
                }
            });
            for (var x = args[i]; i < len; x = args[++i]) {
                if (x === null || typeof x !== "object") {
                    str += " " + x;
                } else {
                    str += " " + inspect(x);
                }
            }
            return str;
        };
        exports.print = function() {
            for (var i = 0, len = arguments.length; i < len; ++i) {
                process.stdout.write(String(arguments[i]));
            }
        };
        exports.puts = function() {
            for (var i = 0, len = arguments.length; i < len; ++i) {
                process.stdout.write(arguments[i] + "\n");
            }
        };
        exports.debug = function(x) {
            process.binding("stdio").writeError("DEBUG: " + x + "\n");
        };
        var error = exports.error = function(x) {
            for (var i = 0, len = arguments.length; i < len; ++i) {
                process.binding("stdio").writeError(arguments[i] + "\n");
            }
        };
        function inspect(obj, showHidden, depth, colors) {
            var ctx = {
                showHidden: showHidden,
                seen: [],
                stylize: colors ? stylizeWithColor : stylizeNoColor
            };
            return formatValue(ctx, obj, typeof depth === "undefined" ? 2 : depth);
        }
        exports.inspect = inspect;
        var colors = {
            bold: [ 1, 22 ],
            italic: [ 3, 23 ],
            underline: [ 4, 24 ],
            inverse: [ 7, 27 ],
            white: [ 37, 39 ],
            grey: [ 90, 39 ],
            black: [ 30, 39 ],
            blue: [ 34, 39 ],
            cyan: [ 36, 39 ],
            green: [ 32, 39 ],
            magenta: [ 35, 39 ],
            red: [ 31, 39 ],
            yellow: [ 33, 39 ]
        };
        var styles = {
            special: "cyan",
            number: "blue",
            "boolean": "yellow",
            "undefined": "grey",
            "null": "bold",
            string: "green",
            date: "magenta",
            regexp: "red"
        };
        function stylizeWithColor(str, styleType) {
            var style = styles[styleType];
            if (style) {
                return "[" + colors[style][0] + "m" + str + "[" + colors[style][1] + "m";
            } else {
                return str;
            }
        }
        function stylizeNoColor(str, styleType) {
            return str;
        }
        function formatPrimitive(ctx, value) {
            switch (typeof value) {
              case "undefined":
                return ctx.stylize("undefined", "undefined");
              case "string":
                var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                return ctx.stylize(simple, "string");
              case "number":
                return ctx.stylize("" + value, "number");
              case "boolean":
                return ctx.stylize("" + value, "boolean");
            }
            if (value === null) {
                return ctx.stylize("null", "null");
            }
        }
        function formatError(value) {
            return "[" + Error.prototype.toString.call(value) + "]";
        }
        function isArray(ar) {
            return ar instanceof Array || Array.isArray(ar) || ar && ar !== Object.prototype && isArray(ar.__proto__);
        }
        function isRegExp(re) {
            return re instanceof RegExp || typeof re === "object" && objectToString(re) === "[object RegExp]";
        }
        function isDate(d) {
            return d instanceof Date || typeof d === "object" && objectToString(d) === "[object Date]";
        }
        function isError(e) {
            return e instanceof Error || typeof e === "object" && objectToString(e) === "[object Error]";
        }
        function objectToString(o) {
            return Object.prototype.toString.call(o);
        }
        var pWarning;
        exports.p = function() {
            if (!pWarning) {
                pWarning = "util.p will be removed in future versions of Node. " + "Use util.puts(util.inspect()) instead.\n";
                exports.error(pWarning);
            }
            for (var i = 0, len = arguments.length; i < len; ++i) {
                error(exports.inspect(arguments[i]));
            }
        };
        function pad(n) {
            return n < 10 ? "0" + n.toString(10) : n.toString(10);
        }
        var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        function timestamp() {
            var d = new Date;
            var time = [ pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()) ].join(":");
            return [ d.getDate(), months[d.getMonth()], time ].join(" ");
        }
        exports.log = function(msg) {
            exports.puts(timestamp() + " - " + msg.toString());
        };
        var execWarning;
        exports.pump = function(readStream, writeStream, callback) {
            var callbackCalled = false;
            function call(a, b, c) {
                if (callback && !callbackCalled) {
                    callback(a, b, c);
                    callbackCalled = true;
                }
            }
            if (!readStream.pause) {
                readStream.pause = function() {
                    readStream.emit("pause");
                };
            }
            if (!readStream.resume) {
                readStream.resume = function() {
                    readStream.emit("resume");
                };
            }
            readStream.addListener("data", function(chunk) {
                if (writeStream.write(chunk) === false) readStream.pause();
            });
            writeStream.addListener("pause", function() {
                readStream.pause();
            });
            writeStream.addListener("drain", function() {
                readStream.resume();
            });
            writeStream.addListener("resume", function() {
                readStream.resume();
            });
            readStream.addListener("end", function() {
                writeStream.end();
            });
            readStream.addListener("close", function() {
                call();
            });
            readStream.addListener("error", function(err) {
                writeStream.end();
                call(err);
            });
            writeStream.addListener("error", function(err) {
                readStream.destroy();
                call(err);
            });
        };
        exports.inherits = function(ctor, superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
        };
        return module.exports;
    });
    define("validator/lib/xss.js", function(require, module, exports, __dirname, __filename) {
        var html_entity_decode = require("validator/lib/entities.js").decode;
        var never_allowed_str = {
            "document.cookie": "",
            "document.write": "",
            ".parentNode": "",
            ".innerHTML": "",
            "window.location": "",
            "-moz-binding": "",
            "<!--": "&lt;!--",
            "-->": "--&gt;",
            "(<!\\[CDATA\\[)": "&lt;![CDATA["
        };
        var never_allowed_regex = {
            "javascript\\s*:": "",
            "expression\\s*(\\(|&\\#40;)": "",
            "vbscript\\s*:": "",
            "Redirect\\s+302": ""
        };
        var non_displayables = [ /%0[0-8bcef]/g, /%1[0-9a-f]/g, /[\x00-\x08]/g, /\x0b/g, /\x0c/g, /[\x0e-\x1f]/g ];
        var compact_words = [ "javascript", "expression", "vbscript", "script", "applet", "alert", "document", "write", "cookie", "window" ];
        exports.clean = function(str, is_image) {
            if (typeof str === "object") {
                for (var i in str) {
                    str[i] = exports.clean(str[i]);
                }
                return str;
            }
            str = remove_invisible_characters(str);
            var hash;
            do {
                hash = xss_hash();
            } while (str.indexOf(hash) >= 0);
            str = str.replace(/\&([a-z\_0-9]+)\=([a-z\_0-9]+)/ig, hash + "$1=$2");
            str = str.replace(/(&\#x?)([0-9A-F]+);?/ig, "$1$2;");
            str = str.replace(new RegExp(hash, "g"), "&");
            try {
                str = decodeURIComponent(str);
            } catch (error) {}
            str = str.replace(/[a-z]+=([\'\"]).*?\1/gi, function(m, match) {
                return m.replace(match, convert_attribute(match));
            });
            str = remove_invisible_characters(str);
            str = str.replace("	", " ");
            var converted_string = str;
            for (var i in never_allowed_str) {
                str = str.replace(new RegExp(i, "gi"), never_allowed_str[i]);
            }
            for (var i in never_allowed_regex) {
                str = str.replace(new RegExp(i, "gi"), never_allowed_regex[i]);
            }
            for (var i = 0, l = compact_words.length; i < l; i++) {
                var spacified = compact_words[i].split("").join("\\s*") + "\\s*";
                str = str.replace(new RegExp("(" + spacified + ")(\\W)", "ig"), function(m, compat, after) {
                    return compat.replace(/\s+/g, "") + after;
                });
            }
            do {
                var original = str;
                if (str.match(/<a/i)) {
                    str = str.replace(/<a\s+([^>]*?)(>|$)/gi, function(m, attributes, end_tag) {
                        attributes = filter_attributes(attributes.replace("<", "").replace(">", ""));
                        if (attributes.match(/href=.*?(alert\(|alert&\#40;|javascript\:|charset\=|window\.|document\.|\.cookie|<script|<xss|base64\s*,)/gi)) {
                            return m.replace(attributes, "");
                        }
                        return m;
                    });
                }
                if (str.match(/<img/i)) {
                    str = str.replace(/<img\s+([^>]*?)(\s?\/?>|$)/gi, function(m, attributes, end_tag) {
                        attributes = filter_attributes(attributes.replace("<", "").replace(">", ""));
                        if (attributes.match(/src=.*?(alert\(|alert&\#40;|javascript\:|charset\=|window\.|document\.|\.cookie|<script|<xss|base64\s*,)/gi)) {
                            return m.replace(attributes, "");
                        }
                        return m;
                    });
                }
                if (str.match(/script/i) || str.match(/xss/i)) {
                    str = str.replace(/<(\/*)(script|xss)(.*?)\>/gi, "");
                }
            } while (original != str);
            var event_handlers = [ "[^a-z_-]on\\w*" ];
            if (!is_image) {
                event_handlers.push("xmlns");
            }
            str = str.replace(new RegExp("<([^><]+?)(" + event_handlers.join("|") + ")(\\s*=\\s*[^><]*)([><]*)", "i"), "<$1$4");
            var naughty = "alert|applet|audio|basefont|base|behavior|bgsound|blink|body|embed|expression|form|frameset|frame|head|html|ilayer|iframe|input|isindex|layer|link|meta|object|plaintext|style|script|textarea|title|video|xml|xss";
            str = str.replace(new RegExp("<(/*\\s*)(" + naughty + ")([^><]*)([><]*)", "gi"), function(m, a, b, c, d) {
                return "&lt;" + a + b + c + d.replace(">", "&gt;").replace("<", "&lt;");
            });
            str = str.replace(/(alert|cmd|passthru|eval|exec|expression|system|fopen|fsockopen|file|file_get_contents|readfile|unlink)(\s*)\((.*?)\)/gi, "$1$2&#40;$3&#41;");
            for (var i in never_allowed_str) {
                str = str.replace(new RegExp(i, "gi"), never_allowed_str[i]);
            }
            for (var i in never_allowed_regex) {
                str = str.replace(new RegExp(i, "gi"), never_allowed_regex[i]);
            }
            if (is_image && str !== converted_string) {
                throw new Error("Image may contain XSS");
            }
            return str;
        };
        function remove_invisible_characters(str) {
            for (var i = 0, l = non_displayables.length; i < l; i++) {
                str = str.replace(non_displayables[i], "");
            }
            return str;
        }
        function xss_hash() {
            var str = "", num = 10;
            while (num--) str += String.fromCharCode(Math.random() * 25 | 97);
            return str;
        }
        function convert_attribute(str) {
            return str.replace(">", "&gt;").replace("<", "&lt;").replace("\\", "\\\\");
        }
        function filter_attributes(str) {
            var comments = /\/\*.*?\*\//g;
            return str.replace(/\s*[a-z-]+\s*=\s*'[^']*'/gi, function(m) {
                return m.replace(comments, "");
            }).replace(/\s*[a-z-]+\s*=\s*"[^"]*"/gi, function(m) {
                return m.replace(comments, "");
            }).replace(/\s*[a-z-]+\s*=\s*[^\s]+/gi, function(m) {
                return m.replace(comments, "");
            });
        }
        return module.exports;
    });
    define("stepc/lib/step.js", function(require, module, exports, __dirname, __filename) {
        var slice = Array.prototype.slice;
        function _Step(steps, context, ignoreReturn) {
            var counter, results, lock;
            function next() {
                if (steps.length === 0) {
                    if (arguments[0]) {
                        throw arguments[0];
                    }
                    return;
                }
                var fn = steps.shift();
                counter = 0;
                results = [];
                try {
                    lock = true;
                    var result;
                    if (context === next) {
                        result = fn.apply(context, arguments);
                    } else {
                        var args = slice.call(arguments);
                        if (args.length === 0) args.push(null);
                        if (fn.length === 0) {
                            args.push(next);
                        } else {
                            if (args.length < fn.length) args[fn.length - 1 || 1] = next; else args.push(next);
                        }
                        result = fn.apply(context, args);
                    }
                } catch (e) {
                    next(e);
                }
                if (result !== undefined && !ignoreReturn) {
                    next(undefined, result);
                }
                lock = false;
            }
            next.parallel = function() {
                var i = counter;
                counter++;
                function check() {
                    counter--;
                    if (counter === 0) {
                        next.apply(null, results);
                    }
                }
                return function() {
                    if (arguments[0]) {
                        results[0] = arguments[0];
                    }
                    results[i + 1] = arguments[1];
                    if (lock) {
                        process.nextTick(check);
                        return;
                    }
                    check();
                };
            };
            next.group = function() {
                var localCallback = next.parallel();
                var counter = 0;
                var result = [];
                var error = undefined;
                return function() {
                    var i = counter;
                    counter++;
                    function check() {
                        counter--;
                        if (counter === 0) {
                            localCallback(error, result);
                        }
                    }
                    return function() {
                        if (arguments[0]) {
                            error = arguments[0];
                        }
                        result[i] = arguments[1];
                        if (lock) {
                            process.nextTick(check);
                            return;
                        }
                        check();
                    };
                };
            };
            if (!context) context = next;
            next();
        }
        function Step() {
            var args = slice.call(arguments), context = args.length > 1 && typeof args[0] !== "function" ? args.shift() : undefined;
            _Step(args, context, false);
        }
        Step.async = function() {
            var args = slice.call(arguments), context = args.length > 1 && typeof args[0] !== "function" ? args.shift() : undefined;
            _Step(args, context, true);
        };
        Step.fn = function StepFn() {
            var steps = Array.prototype.slice.call(arguments);
            return function() {
                var args = Array.prototype.slice.call(arguments);
                var toRun = [ function() {
                    this.apply(null, args);
                } ].concat(steps);
                if (typeof args[args.length - 1] === "function") {
                    toRun.push(args.pop());
                }
                Step.apply(null, toRun);
            };
        };
        if (typeof module !== "undefined" && "exports" in module) {
            module.exports = Step;
        }
        return module.exports;
    });
    define("mannequin/lib/model.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Model, Transformers, bindable, dref, _, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            _ = require("underscore/underscore.js");
            bindable = require("bindable/lib/index.js");
            Transformers = require("mannequin/lib/transformers/index.js");
            dref = require("dref/lib/index.js");
            module.exports = Model = function(_super) {
                __extends(Model, _super);
                function Model(data, options) {
                    if (data == null) {
                        data = {};
                    }
                    if (options == null) {
                        options = {};
                    }
                    Model.__super__.constructor.call(this, {});
                    _.extend(this, options);
                    this.set(data);
                    this.init();
                }
                Model.prototype.init = function() {
                    return this.builder.initModel(this);
                };
                Model.prototype.transform = function(key, transformer) {
                    return transformer = this._transformer().use(key, transformer);
                };
                Model.prototype.validate = function(callback) {
                    if (!this.schema) {
                        return callback();
                    }
                    return this.schema.test(this, callback);
                };
                Model.prototype.get = function(key) {
                    if (arguments.length === 0) {
                        return Model.__super__.get.call(this, key);
                    }
                    if (this._virtual[key]) {
                        return this._virtual[key].call(this);
                    }
                    return Model.__super__.get.call(this, key);
                };
                Model.prototype._set = function(key, value) {
                    if (this._virtual[key]) {
                        return this._virtual[key].call(this, value);
                    }
                    return Model.__super__._set.call(this, key, this._transform(key, value));
                };
                Model.prototype.toJSON = function() {
                    return this._toJSON(this);
                };
                Model.prototype._toJSON = function(data) {
                    var definition, newData, v, _i, _id, _len, _ref;
                    newData = {};
                    _ref = this.schema.definitions;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        definition = _ref[_i];
                        v = data.__isBindable ? data.get(definition.key) : dref.get(data, definition.key);
                        if (v === void 0) {
                            continue;
                        }
                        dref.set(newData, definition.key, v);
                    }
                    _id = data.__isBindable ? data.get("_id") : dref.get(data, "_id");
                    if (_id) {
                        newData._id = _id;
                    }
                    return newData;
                };
                Model.prototype._transform = function(key, value) {
                    if (!this.__transformer) {
                        return value;
                    }
                    return this.__transformer.set(key, value);
                };
                Model.prototype._transformer = function() {
                    return this.__transformer || (this.__transformer = new Transformers(this));
                };
                return Model;
            }(bindable.Object);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/factory.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableSetter, CollectionSetter, FnSetter;
            FnSetter = require("bindable/lib/object/setters/fn.js");
            BindableSetter = require("bindable/lib/object/setters/bindable.js");
            CollectionSetter = require("bindable/lib/object/setters/collection.js");
            module.exports = function() {
                function _Class() {}
                _Class.prototype.createSetter = function(binding, target, property) {
                    var callback, to, toProperty;
                    to = null;
                    toProperty = null;
                    callback = null;
                    if (!target && !property) {
                        return null;
                    }
                    if (typeof property === "string") {
                        to = target;
                        toProperty = property;
                    } else if (typeof target === "string") {
                        to = binding._from;
                        toProperty = target;
                    } else if (typeof target === "function") {
                        callback = target;
                    } else if (typeof target === "object" && target) {
                        if (target.__isBinding) {
                            throw new Error("Cannot bind to a binding.");
                        } else if (target.__isCollection) {
                            return new CollectionSetter(binding, target);
                        }
                    }
                    if (callback) {
                        return new FnSetter(binding, callback);
                    } else if (to && toProperty) {
                        return new BindableSetter(binding, to, toProperty);
                    }
                    return null;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/core/utils.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var hoist;
            hoist = require("hoist/lib/index.js");
            exports.tryTransform = function(transformer, method, value, callback) {
                if (!transformer) {
                    return callback(null, value);
                }
                return transformer[method].call(transformer, value, callback);
            };
            exports.transformer = function(options) {
                if (typeof options === "function") {
                    options = {
                        from: options,
                        to: options
                    };
                }
                if (!options.from) {
                    options.from = function(value) {
                        return value;
                    };
                }
                if (!options.to) {
                    options.to = function(value) {
                        return value;
                    };
                }
                return {
                    from: hoist.map(options.from),
                    to: hoist.map(options.to)
                };
            };
        }).call(this);
        return module.exports;
    });
    define("hoist/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var method, transformer, _fn, _i, _len, _ref, _this = this;
            transformer = require("hoist/lib/transformer.js");
            module.exports = transformer;
            _ref = [ "cast", "map", "preCast", "preMap", "postCast", "postMap" ];
            _fn = function(method) {
                return module.exports[method] = function() {
                    var t;
                    t = transformer();
                    return t[method].apply(t, arguments);
                };
            };
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                method = _ref[_i];
                _fn(method);
            }
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/deepPropertyWatcher.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PropertyWatcher, dref, poolParty, propertyWatcher, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            dref = require("dref/lib/index.js");
            poolParty = require("poolparty/lib/index.js");
            PropertyWatcher = function() {
                function PropertyWatcher(options) {
                    this._changed = __bind(this._changed, this);
                    this.reset(options);
                }
                PropertyWatcher.prototype.reset = function(options) {
                    if (options.property) {
                        options.path = options.property.split(".");
                    }
                    this.index = options.index || 0;
                    this._fullPath = options.path;
                    this._path = this._fullPath.slice(0, this.index);
                    this._property = this._path.join(".");
                    this.target = options.target;
                    this.callback = options.callback;
                    return this._watch();
                };
                PropertyWatcher.prototype._dispose = function() {
                    if (this._listener) {
                        this._listener.dispose();
                        this._listener = void 0;
                    }
                    if (this._binding) {
                        this._binding.dispose();
                        this._binding = void 0;
                    }
                    if (this._child) {
                        this._child.dispose();
                        return this._child = void 0;
                    }
                };
                PropertyWatcher.prototype.dispose = function() {
                    this._dispose();
                    return propertyWatcher.add(this);
                };
                PropertyWatcher.prototype._watch = function() {
                    var value;
                    value = this.target.get(this._property);
                    if (this._property.length) {
                        this._listener = this.target.on("change:" + this._property, this._changed);
                    }
                    if (value && value.__isBindable) {
                        return this._binding = propertyWatcher.create({
                            target: value,
                            path: this._fullPath.slice(this.index),
                            callback: this._changed
                        });
                    } else if (this._path.length < this._fullPath.length) {
                        return this._child = propertyWatcher.create({
                            target: this.target,
                            path: this._fullPath,
                            callback: this.callback,
                            index: this.index + 1
                        });
                    }
                };
                PropertyWatcher.prototype._changed = function(value) {
                    this._dispose();
                    this._watch();
                    return this.callback(value);
                };
                return PropertyWatcher;
            }();
            propertyWatcher = module.exports = poolParty({
                max: 100,
                factory: function(options) {
                    return new PropertyWatcher(options);
                },
                recycle: function(watcher, options) {
                    return watcher.reset(options);
                }
            });
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/dref.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            exports.get = function(target, key, flatten) {
                var ct, i, k, keyParts, _i, _len;
                if (flatten == null) {
                    flatten = true;
                }
                if (!target) {
                    return;
                }
                keyParts = key ? key.split(".") : [];
                ct = target;
                for (i = _i = 0, _len = keyParts.length; _i < _len; i = ++_i) {
                    k = keyParts[i];
                    if (!ct) {
                        return;
                    }
                    if (ct.__isBindable) {
                        return ct.get(keyParts.slice(i).join("."));
                    }
                    ct = ct[k];
                }
                if (flatten && ct && ct.__isBindable) {
                    return ct.get();
                }
                return ct;
            };
            exports.set = function(target, key, value) {
                var ct, i, k, keyParts, n, nv, _i, _len;
                if (!target || !key) {
                    return;
                }
                keyParts = key.split(".");
                ct = target.data;
                n = keyParts.length;
                for (i = _i = 0, _len = keyParts.length; _i < _len; i = ++_i) {
                    k = keyParts[i];
                    if (ct.__isBindable) {
                        return ct.set(keyParts.slice(i).join("."), value);
                    } else {
                        if (i === n - 1) {
                            if (ct[k] === value) {
                                return false;
                            }
                            ct[k] = value;
                            return true;
                        } else {
                            nv = ct[k];
                            if (!nv || typeof nv !== "object") {
                                nv = ct[k] = {};
                            }
                            ct = nv;
                        }
                    }
                }
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/shim/dref.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            module.exports = {
                test: function(item) {
                    return item.get && item.set;
                },
                get: function(item, key) {
                    var result;
                    result = item.data[key];
                    if (result === null || result === void 0) {
                        result = item[key];
                    }
                    return result;
                },
                set: function(item, key, value) {
                    return item.set(key, value);
                }
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/core/builder.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Builder, CallChain;
            CallChain = function() {
                CallChain.prototype.__isCallChain = true;
                function CallChain(_targetClass, methods) {
                    this._targetClass = _targetClass;
                    this._addMethods(methods);
                    this._callChain = [];
                }
                CallChain.prototype.createObject = function() {
                    var C, args, call, clazz, obj, _i, _len, _ref, _results;
                    clazz = this._targetClass;
                    args = arguments;
                    C = function() {
                        return clazz.apply(this, args);
                    };
                    C.prototype = clazz.prototype;
                    obj = new C;
                    _ref = this._callChain;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        call = _ref[_i];
                        _results.push(obj = obj[call.method].apply(obj, call.args));
                    }
                    return _results;
                };
                CallChain.prototype.copyId = function(value) {
                    if (!arguments.length) {
                        return this._copyId;
                    }
                    this._copyId = value;
                    return this;
                };
                CallChain.prototype.callMethod = function(method, args) {
                    this._callChain.push({
                        method: method,
                        args: args
                    });
                    return this;
                };
                CallChain.prototype._addMethods = function(methods) {
                    var method, _i, _len;
                    for (_i = 0, _len = methods.length; _i < _len; _i++) {
                        method = methods[_i];
                        this._addMethod(method);
                    }
                    return this;
                };
                CallChain.prototype._addMethod = function(method) {
                    return this[method] = function() {
                        return this.callMethod(method, arguments);
                    };
                };
                return CallChain;
            }();
            module.exports = Builder = function() {
                function Builder(_class, _attach) {
                    this._class = _class;
                    this._attach = _attach != null ? _attach : this;
                    this._createMethods();
                }
                Builder.prototype._createMethods = function() {
                    var key, _results;
                    this._methods = [];
                    _results = [];
                    for (key in this._class.prototype) {
                        if (key.substr(0, 1) === "_") {
                            continue;
                        }
                        _results.push(this._addMethod(key));
                    }
                    return _results;
                };
                Builder.prototype._addMethod = function(method) {
                    var _this = this;
                    this._methods.push(method);
                    return this._attach[method] = function() {
                        return (new CallChain(_this._class, _this._methods)).callMethod(method, arguments);
                    };
                };
                return Builder;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var SettersFactory, settersFactory, utils;
            SettersFactory = require("bindable/lib/collection/setters/factory.js");
            settersFactory = new SettersFactory;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(_from) {
                    this._from = _from;
                    this._limit = -1;
                    this._setters = [];
                    this._listen();
                }
                _Class.prototype.transform = function(value) {
                    if (!arguments.length) {
                        return this._transformer;
                    }
                    this._transformer = utils.transformer(value);
                    return this;
                };
                _Class.prototype.dispose = function() {
                    this._dispose(this._setters);
                    this._setters = void 0;
                    this._dispose(this._listeners);
                    return this._listeners = void 0;
                };
                _Class.prototype.copyId = function(value) {
                    if (!arguments.length) {
                        return this._copyId;
                    }
                    this._copyId = value;
                    return this;
                };
                _Class.prototype._dispose = function(collection) {
                    var disposable, _i, _len, _results;
                    if (collection) {
                        _results = [];
                        for (_i = 0, _len = collection.length; _i < _len; _i++) {
                            disposable = collection[_i];
                            _results.push(disposable.dispose());
                        }
                        return _results;
                    }
                };
                _Class.prototype.filter = function(search) {
                    if (!arguments.length) {
                        return this._filter;
                    }
                    this._filter = search;
                    return this;
                };
                _Class.prototype.to = function(collection) {
                    var setter;
                    setter = settersFactory.createSetter(this, collection);
                    if (setter) {
                        this._setters.push(setter);
                    }
                    return this;
                };
                _Class.prototype._listen = function() {
                    var event, _i, _len, _ref, _results, _this = this;
                    this._listeners = [];
                    _ref = [ "insert", "remove", "update" ];
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        event = _ref[_i];
                        _results.push(function(event) {
                            return _this._listeners.push(_this._from.on(event, function(item, index) {
                                return _this._callSetters(event, item, index);
                            }));
                        }(event));
                    }
                    return _results;
                };
                _Class.prototype._callSetters = function(method, item) {
                    var setter, _i, _len, _ref, _results;
                    _ref = this._setters;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        _results.push(setter.change(method, item));
                    }
                    return _results;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("hurryup/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var comerr = require("comerr/lib/index.js");
        module.exports = function(timedCallback, timeoutOrOps) {
            var options = {};
            if (timeoutOrOps) {
                if (typeof timeoutOrOps == "object") {
                    options = timeoutOrOps;
                } else {
                    options = {
                        timeout: timeoutOrOps
                    };
                }
            }
            if (!options.timeout) options.timeout = 1e3 * 20;
            if (!options.retry) options.retry = false;
            if (!options.retryTimeout) options.retryTimeout = 3e3;
            return function() {
                var args = Array.prototype.slice.call(arguments, 0), killed = false, oldNext, self = this == global ? {} : this;
                if (typeof args[args.length - 1] == "function") {
                    oldNext = args.pop();
                } else {
                    oldNext = function(err) {
                        if (err) throw err;
                    };
                }
                var retryTimeout, callbackErr, killDate = Date.now() + options.timeout, killTimeout = setTimeout(function() {
                    clearTimeout(retryTimeout);
                    killed = true;
                    oldNext.call(self, callbackErr || new comerr.Timeout);
                }, options.timeout);
                function runCallback() {
                    this._timeLeft = killDate - Date.now();
                    timedCallback.apply(this, args.concat(function(err) {
                        if (err && options.retry) {
                            callbackErr = err;
                            return retryTimeout = setTimeout(runCallback, options.retryTimeout);
                        }
                        if (killed) return;
                        clearTimeout(killTimeout);
                        oldNext.apply(this, arguments);
                    }));
                }
                runCallback.call(self);
            };
        };
        return module.exports;
    });
    define("mannequin/lib/transformers/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Transformer;
            Transformer = require("mannequin/lib/transformers/transformer.js");
            module.exports = function() {
                function _Class(model) {
                    this.model = model;
                    this._transformers = {};
                }
                _Class.prototype.set = function(key, value) {
                    var target, transformer, _i, _len, _ref;
                    target = {
                        key: key,
                        currentValue: value
                    };
                    _ref = this._findTransformers(key, false);
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        transformer = _ref[_i];
                        transformer(target);
                    }
                    return target.currentValue;
                };
                _Class.prototype._findTransformers = function(key, create) {
                    var endKey, keyParts, part, _i, _len;
                    if (create == null) {
                        create = true;
                    }
                    keyParts = key.split(".");
                    endKey = keyParts[keyParts.length - 1];
                    for (_i = 0, _len = keyParts.length; _i < _len; _i++) {
                        part = keyParts[_i];
                        if (!this._transformers[part]) {
                            if (!create) {
                                return [];
                            }
                        }
                        this._transformers[part] = this._transformers[part] || {};
                    }
                    if (!this._transformers[endKey]._items) {
                        this._transformers[endKey]._items = [];
                    }
                    return this._transformers[endKey]._items || [];
                };
                _Class.prototype.use = function(key) {
                    var transformer, _this = this;
                    transformer = new Transformer(this, key);
                    this._findTransformers(key, true).push(function(target) {
                        if (target.key !== key) {
                            return;
                        }
                        if (!key || _this.model.get(key) !== target.currentValue) {
                            return target.currentValue = transformer.set(target.currentValue);
                        }
                    });
                    return transformer;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/fn.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Base = require("bindable/lib/object/setters/base.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(binding, callback) {
                    this.binding = binding;
                    this.callback = callback;
                    _Class.__super__.constructor.call(this, this.binding);
                }
                _Class.prototype._change = function(value) {
                    return this.callback(value);
                };
                _Class.prototype.dispose = function() {
                    return this.callback = null;
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/bindable.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Base = require("bindable/lib/object/setters/base.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(binding, to, property) {
                    this.binding = binding;
                    this.to = to;
                    this.property = property;
                    _Class.__super__.constructor.call(this, this.binding);
                }
                _Class.prototype._change = function(value) {
                    return this.to.set(this.property, value);
                };
                _Class.prototype.dispose = function() {
                    if (!this._disposable) {
                        return;
                    }
                    this._disposable.dispose();
                    return this._disposable = this.binding = this.to = this.property = null;
                };
                _Class.prototype.bothWays = function() {
                    var _this = this;
                    return this._disposable = this.to.bind(this.property).to(function(value) {
                        if (_this.currentValue !== value) {
                            return _this._changeFrom(value);
                        }
                    });
                };
                _Class.prototype._changeFrom = function(value) {
                    var _this = this;
                    return this.__transform("from", value, function(err, transformedValue) {
                        if (err) {
                            throw err;
                        }
                        return _this.binding._from.set(_this.binding._property, _this.currentValue = transformedValue);
                    });
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/collection.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Base = require("bindable/lib/object/setters/base.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(binding, to, property) {
                    this.binding = binding;
                    this.to = to;
                    this.property = property;
                    _Class.__super__.constructor.call(this, this.binding);
                }
                _Class.prototype._change = function(value) {
                    return this.to.reset(value);
                };
                _Class.prototype.dispose = function() {
                    return this.to.disposeSourceBinding();
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("hoist/lib/transformer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async, getArrayTypeCaster, getClassTypeCaster, getSimpleDataTypeCaster, getTypeCaster, type;
            type = require("type-component/index.js");
            async = require("async/lib/async.js");
            getArrayTypeCaster = function() {
                return function(value) {
                    if (type(value) === "array") {
                        return value;
                    }
                    return [ value ];
                };
            };
            getSimpleDataTypeCaster = function(typeClass) {
                return function(value) {
                    return typeClass(value);
                };
            };
            getClassTypeCaster = function(typeClass) {
                return function(value) {
                    if (value && value.constructor === typeClass) {
                        return value;
                    }
                    return new typeClass(value);
                };
            };
            getTypeCaster = function(typeClass) {
                if (typeClass === Array) {
                    return getArrayTypeCaster();
                }
                if (typeClass === String || typeClass === Number) {
                    return getSimpleDataTypeCaster(typeClass);
                }
                return getClassTypeCaster(typeClass);
            };
            module.exports = function(options) {
                var caster, mapper, self, _mid, _post, _pre, _transform;
                if (options == null) {
                    options = {};
                }
                _transform = [];
                _pre = [];
                _post = [];
                _mid = [];
                self = function(value, next) {
                    if (arguments.length > 1 && type(arguments[arguments.length - 1]) === "function") {
                        return self.async(value, next);
                    } else {
                        return self.sync.apply(null, arguments);
                    }
                };
                self.async = function(value, next) {
                    return async.eachSeries(_transform, function(transformer, next) {
                        if (transformer.async) {
                            return transformer.transform(value, function(err, result) {
                                if (err) {
                                    return next(err);
                                }
                                return next(null, value = result);
                            });
                        } else {
                            value = transformer.transform(value);
                            return next();
                        }
                    }, function(err, result) {
                        if (err) {
                            return next(err);
                        }
                        return next(null, value);
                    });
                };
                self.sync = function() {
                    var transformer, _i, _len;
                    for (_i = 0, _len = _transform.length; _i < _len; _i++) {
                        transformer = _transform[_i];
                        arguments[0] = transformer.transform.apply(null, arguments);
                    }
                    return arguments[0];
                };
                self.preCast = function(typeClass) {
                    return self._push(caster(typeClass), _pre);
                };
                self.cast = function(typeClass) {
                    return self._push(caster(typeClass), _mid);
                };
                self.postCast = function(typeClass) {
                    return self._push(caster(typeClass), _post);
                };
                caster = function(typeClass) {
                    return {
                        transform: getTypeCaster(typeClass)
                    };
                };
                self.preMap = function(fn) {
                    return self._push(mapper(fn), _pre);
                };
                self.map = function(fn) {
                    return self._push(mapper(fn), _mid);
                };
                self.postMap = function(fn) {
                    return self._push(mapper(fn), _post);
                };
                mapper = function(fn) {
                    return {
                        async: fn.length > 1,
                        transform: fn
                    };
                };
                self._push = function(obj, stack) {
                    stack.push(obj);
                    _transform = _pre.concat(_mid).concat(_post);
                    return this;
                };
                return self;
            };
        }).call(this);
        return module.exports;
    });
    define("poolparty/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PoolParty, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            PoolParty = function() {
                function PoolParty(options) {
                    if (options == null) {
                        options = {};
                    }
                    this.drip = __bind(this.drip, this);
                    this.max = options.max || 50;
                    this.min = options.min || 0;
                    this.staleTimeout = options.staleTimeout || 1e3;
                    this.factory = options.factory || options.create;
                    this.recycle = options.recycle;
                    this._pool = [];
                    this._size = 0;
                }
                PoolParty.prototype.size = function() {
                    return this._size;
                };
                PoolParty.prototype.drain = function() {
                    var i, _i, _ref, _results;
                    _results = [];
                    for (i = _i = 0, _ref = this._size - this.min; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                        _results.push(this.drip());
                    }
                    return _results;
                };
                PoolParty.prototype.drip = function() {
                    this._dripping = false;
                    if (!this._size) {
                        return;
                    }
                    this._size--;
                    this._pool.shift();
                    return this._timeoutDrip();
                };
                PoolParty.prototype.create = function(options) {
                    var item;
                    if (this._size) {
                        this._size--;
                        item = this._pool.shift();
                        this.recycle(item, options);
                        return item;
                    }
                    item = this.factory(options);
                    item.__pool = this;
                    return item;
                };
                PoolParty.prototype.add = function(object) {
                    if (object.__pool !== this) {
                        return this;
                    }
                    if (!~this._pool.indexOf(object) && this._size < this.max) {
                        this._size++;
                        this._pool.push(object);
                        this._timeoutDrip();
                    }
                    return this;
                };
                PoolParty.prototype._timeoutDrip = function() {
                    if (this._dripping) {
                        return;
                    }
                    this._dripping = true;
                    return setTimeout(this.drip, this.staleTimeout);
                };
                return PoolParty;
            }();
            module.exports = function(options) {
                return new PoolParty(options);
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/factory.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CollectionSetter, FnSetter, ObjSetter;
            FnSetter = require("bindable/lib/collection/setters/fn.js");
            ObjSetter = require("bindable/lib/collection/setters/object.js");
            CollectionSetter = require("bindable/lib/collection/setters/collection.js");
            module.exports = function() {
                function _Class() {}
                _Class.prototype.createSetter = function(binding, target) {
                    if (!target) {
                        return null;
                    }
                    if (typeof target === "function") {
                        return new FnSetter(binding, target);
                    } else if (target.__isCollection) {
                        return new CollectionSetter(binding, target);
                    } else if (target.insert || target.update || target.remove || target.replace) {
                        return new ObjSetter(binding, target);
                    }
                    return null;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("mannequin/lib/transformers/transformer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var hoist;
            hoist = require("hoist/lib/index.js");
            module.exports = function() {
                function _Class(_transformers, key) {
                    this._transformers = _transformers;
                    this.key = key;
                    this.resetHoist();
                }
                _Class.prototype["default"] = function(value) {
                    if (!arguments.length) {
                        return this._defaultValue;
                    }
                    this._defaultValue = value;
                    return this;
                };
                _Class.prototype.cast = function(clazz) {
                    this._hoister = this._hoister.cast(clazz);
                    return this;
                };
                _Class.prototype.resetHoist = function() {
                    return this._hoister = hoist();
                };
                _Class.prototype.map = function(mapper) {
                    this._hoister = this._hoister.map(mapper);
                    return this;
                };
                _Class.prototype.reset = function() {
                    var m;
                    m = this._transformers.model;
                    if (m.get(this.key)) {
                        return m.set(this.key, this.set(m.get(this.key)));
                    }
                };
                _Class.prototype.set = function(value) {
                    return this._hoister(value || this._defaultValue);
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var utils;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(binding) {
                    this.binding = binding;
                    this._transformer = this.binding.transform();
                    this.init();
                }
                _Class.prototype.init = function() {
                    var _this = this;
                    return this._setValue(this.binding._from.get(this.binding._property), function(value) {
                        if (!_this.binding.watch()) {
                            return _this._change(value);
                        }
                    });
                };
                _Class.prototype.change = function(value) {
                    var _this = this;
                    return this._setValue(value, function(value) {
                        return _this._change(value);
                    });
                };
                _Class.prototype._setValue = function(value, callback) {
                    var _this = this;
                    if (this.currentValue === value) {
                        return false;
                    }
                    this.__transform("to", value, function(err, transformedValue) {
                        if (err) {
                            throw err;
                        }
                        return callback(_this.currentValue = transformedValue);
                    });
                    return true;
                };
                _Class.prototype.bothWays = function() {};
                _Class.prototype._change = function(value) {};
                _Class.prototype.__transform = function(method, value, next) {
                    return utils.tryTransform(this._transformer, method, value, next);
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/fn.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.init = function() {
                    var i, item, _i, _len, _ref1, _results;
                    _Class.__super__.init.call(this);
                    _ref1 = this.binding._from.source();
                    _results = [];
                    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
                        item = _ref1[i];
                        _results.push(this.change("insert", item));
                    }
                    return _results;
                };
                _Class.prototype._change = function(method, item) {
                    return this.target(method, item);
                };
                return _Class;
            }(require("bindable/lib/collection/setters/base.js"));
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/object.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var FnSetter, _, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            _ = require("underscore/underscore.js");
            FnSetter = require("bindable/lib/collection/setters/fn.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.init = function() {
                    var _this = this;
                    _.defaults(this.target, {
                        insert: function(item) {},
                        remove: function(item) {},
                        update: function(item) {}
                    });
                    return this._setter = new FnSetter(this.binding, function(method, item, index) {
                        return _this.target[method].call(_this.target, item, index);
                    });
                };
                _Class.prototype._change = function() {
                    return this._setter._change.apply(this._setter, arguments);
                };
                return _Class;
            }(require("bindable/lib/collection/setters/base.js"));
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/collection.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ObjSetter, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            ObjSetter = require("bindable/lib/collection/setters/object.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.init = function() {
                    var methods, _this = this;
                    _Class.__super__.init.call(this);
                    return this._setter = new ObjSetter(this.binding, methods = {
                        insert: function(item) {
                            if (_this.binding._copyId) {
                                _this.target._id(_this.binding._from._id());
                            }
                            if (~_this.target.indexOf(item)) {
                                return methods.update(item);
                            } else {
                                return _this.target.push(item);
                            }
                        },
                        update: function(item, index) {
                            return _this.target.update(item);
                        },
                        remove: function(item) {
                            var index;
                            index = _this.target.indexOf(item);
                            if (~index) {
                                return _this.target.splice(index, 1);
                            }
                        }
                    });
                };
                _Class.prototype._change = function() {
                    return this._setter._change.apply(this._setter, arguments);
                };
                _Class.prototype.bothWays = function() {
                    throw new Error("cannot bind both ways yet");
                };
                return _Class;
            }(require("bindable/lib/collection/setters/base.js"));
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var utils;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(binding, target) {
                    this.binding = binding;
                    this.target = target;
                    this._transformer = binding.transform();
                    this._filter = binding.filter();
                    this.init();
                }
                _Class.prototype.init = function() {};
                _Class.prototype.dispose = function() {};
                _Class.prototype.change = function(event, item) {
                    var _this = this;
                    if (this._filter) {
                        if (!this._filter(item)) {
                            return;
                        }
                    }
                    return this.__transform("to", item, function(err, item) {
                        if (err) {
                            throw err;
                        }
                        return _this._change(event, item);
                    });
                };
                _Class.prototype._change = function(event, item) {};
                _Class.prototype.bothWays = function() {};
                _Class.prototype.__transform = function(method, value, next) {
                    return utils.tryTransform(this._transformer, method, value, next);
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    var entries = [ "linen/test-web/api-test.js" ];
    for (var i = entries.length; i--; ) {
        _require(entries[i]);
    }
})();