describe("sn.moduleController", function () {
    it("should define the 'sn' namespace", function () {
        expect(window.sn).toBeDefined();
    });


    describe("register()", function () {

        it("should throw an error if no name is defined for the module registration", function () {
            expect(function () {
                sn.moduleController.register();
            }).toThrow();
        });


        it("should throw an error if no JS object is defined as second parameter for the module registration", function () {
            expect(function () {
                sn.moduleController.register("foo", "bar");
            }).toThrow();
        });

        it("should throw an error if no cssSelector / ArrayOfFunctions is defined for module registration, example call: register(modulenName, jsObject, cssSelector[,options])", function () {
            window.foo = {
                construct: function () {
                    return this;
                }
            };
            expect(function () {
                sn.moduleController.register("foo", window.foo);
            }).toThrow();
        });

        it("should throw no error if an array of functions is passed (instead of a cssSelector) for simple module registration, example call: register(moduleName, jsObject, ArrayOfFunctions)", function () {
            window.foo = {
                fooBar: function () {
                }
            };
            window.bar = ["fooBar"];
            expect(function () {
                sn.moduleController.register("foo", window.foo, window.bar);
            }).not.toThrow();
        });


        it("should add a module to the modules list during registration", function () {
            window.moduleCount = sn.moduleController.getRegisteredModules().length;
            window.foo = {
                construct: function () {
                    return this;
                }
            };
            sn.moduleController.register("foo", window.foo, "bar");

            expect(sn.moduleController.getRegisteredModules().length).toEqual(window.moduleCount + 1);
        });

        it("should create a jQuery plugin from the given object", function () {
            window.foo = {
                construct: function () {
                    return this;
                }
            };
            sn.moduleController.register("foo", window.foo, "bar");
            expect($.fn.foo).toBeDefined();
        });
    });

    describe("initAllModules()", function () {
        it("should initialize a plugin and bind it to the DOM node's data-object", function () {
            window.foo = {
                construct: function () {
                    return this;
                }
            };
            setFixtures("<div id='bar'></div>");
            sn.moduleController.register("foo", window.foo, "#bar");
            sn.moduleController.initAllModules($("#jasmine-fixtures"));
            expect($("#bar").data("foo")).toBeDefined();
        });
    });

    describe("initPlugins()", function () {
        it("should initialize all registered plugins only for a given context - sn.moduleController.initPlugins(context)", function () {
            window.foo = {
                construct: function () {
                    return this;
                }
            };
            window.myHtml = "<div id='container'><div class='foobar'></div></div>";
            window.myHtml += "<div id='container2'><div class='foobar'></div></div>";

            setFixtures(myHtml);
            sn.moduleController.register("foo", window.foo, ".foobar");
            sn.moduleController.initPlugins("#container");
            expect($("#container .foobar").eq(0).data("foo")).toBeDefined();
            expect($("#container2 .foobar").eq(0).data("foo")).not.toBeDefined();
        });
    });

    describe("getRegisteredModules()", function () {
        it("should return an array", function () {
            sn.moduleController.getRegisteredModules();
            expect($.isArray(sn.moduleController.getRegisteredModules())).toBe(true);
        });
    });
});