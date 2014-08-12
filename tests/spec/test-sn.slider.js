describe("module sn.slider", function () {

    jasmine.getFixtures().fixturesPath = "fixtures";

    it("Initializes Slider and expects some attributes and elements", function () {

        loadFixtures("slider/slider.html");

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        var holder = $("#jasmine-fixtures").find(".holder");
        var dots = $("#jasmine-fixtures").find(".sn-slider-dotcontainer");

        //Initialized Attribute used?
        expect(holder.css("position")).toBe("absolute");
        //Initialized Positions?
        expect(parseInt(holder.css("left"), 10)).toBeLessThan(0);
        //Set dots?
        expect(dots).toBeDefined();

    });

    it("Pressing dots on infinite Slides changes focus on slide elements", function () {

        loadFixtures("slider/slider.html");

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        var dots = $("#jasmine-fixtures").find(".sn-slider-dotcontainer");
        var holder = $("#jasmine-fixtures").find(".holder");

        //There is a extra slider element in front when slider is infinite
        expect(holder.find(".slide-wrapper").eq(2).hasClass("on")).not.toBe(true);

        dots.find("a").eq(1).click();

        //There is a extra slider element in front when slider is infinite
        expect(holder.find(".slide-wrapper").eq(2).hasClass("on")).toBe(true);

    });

    it("Pressing dots on non infinite Slides changes focus on slide elements", function () {

        loadFixtures("slider/slider-noloop.html");

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        var dots = $("#jasmine-fixtures").find(".sn-slider-dotcontainer");
        var holder = $("#jasmine-fixtures").find(".holder");

        //There is a extra slider element in front when slider normal
        expect(holder.find(".slide-wrapper").eq(1).hasClass("on")).not.toBe(true);

        dots.find("a").eq(1).click();

        //There is a extra slider element in front when slider normal
        expect(holder.find(".slide-wrapper").eq(1).hasClass("on")).toBe(true);

    });

});