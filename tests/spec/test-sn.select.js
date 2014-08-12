describe("module sn.select", function () {

    jasmine.getFixtures().fixturesPath = "fixtures";

    it("creates an output element if it is missing from original DOM", function () {
        loadFixtures("select/select.html");

        expect($("#jasmine-fixtures").find("output")).toHaveLength(0);

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        expect($("#jasmine-fixtures").find("output")).toHaveLength(1);
    });


    it("fills an output element with content of selected option", function () {

        loadFixtures("select/select.html");

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        var outputElement = $("#jasmine-fixtures").find("output");

        expect(outputElement.text()).toEqual("option 2-4");
    });

    it("updates the output element if the selection in changed", function () {

        loadFixtures("select/select.html");

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        var outputElement = $("#jasmine-fixtures").find("output");

        expect(outputElement.text()).toEqual("option 2-4");

        $("#jasmine-fixtures").find("select").val("2-2").trigger("change");

        expect(outputElement.text()).toEqual("option 2-2");
    });

});