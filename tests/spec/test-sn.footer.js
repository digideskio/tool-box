describe("module sn.footer", function () {

    it("Tapping a footer top button scrolls the page to top", function () {

        var fixture = setFixtures('<footer><a data-top="true">foo</a></footer>');

        sn.moduleController.initAllModules($("#jasmine-fixtures"));

        var spyEvent = spyOnEvent('[data-top]', 'click');

        fixture.find("a").click();

        expect(spyEvent).toHaveBeenTriggered();
    });

});