describe("sn.core module", function () {
    it("should define the 'sn' namespace", function () {
        expect(window.sn).toBeDefined();
    });
    describe("defineNamespace", function () {
        it("should create a new namespace", function () {
            sn.core.defineNamespace("testStuffOne");
            expect(window.sn.testStuffOne).toBeDefined();
        });
        it("should return the created namespace", function () {
            var testStuffNamespace = sn.core.defineNamespace("testStuff");
            expect(window.sn.testStuff).toBe(testStuffNamespace);
        });
        it("should not touch existing objects and return them", function () {
            var foo = "do not touch this";
            sn.foo = foo;
            expect(window.sn.foo).toBe(foo);
        });
        it("is able to define nested name spaces from dot-separated name space definitions", function () {
            sn.core.defineNamespace("testing.nested.namespaces");
            expect(window.sn.testing.nested.namespaces).toBeDefined();
        });
        it("respects custom name space container objects", function () {
            var ns = window.foo = {};
            sn.core.defineNamespace("testing.nested.namespaces", ns);
            expect(window.foo.testing.nested.namespaces).toBeDefined();
        });
    });
    describe("getObjectAt", function () {
        it("should find objects within the global namespace", function () {
            window.foo = {
                bar: {
                    leaf: "get this"
                }
            };
            expect(sn.core.getObjectAt("foo.bar.leaf")).toEqual("get this");
        });

        it("should throw an error if something cannot be found", function () {
            window.foo = {
                bar: {
                    leaf: "got this"
                }
            };
            expect(function () {
                sn.core.getObjectAt("foo.bars.leaf");
            }).toThrow();
        });

        it("should throw if there is a space within the path", function () {
            window.foo = {
                bar: {
                    leaf: "got this"
                }
            };
            expect(function () {
                sn.core.getObjectAt("foo.bars bars.leaf");
            }).toThrow();
        });

        it("should return the given default value if one is set", function(){
            var result;
            expect(function () {
                result = sn.core.getObjectAt("foo.bars bars.leaf",null);
            }).not.toThrow();
            expect(result).toBeNull();
        });
    });
});