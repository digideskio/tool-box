describe("module sn.featureDetection", function () {

    it("Remove no-js selector on class Attribute", function () {

        var classNames = document.documentElement.className;

        expect(classNames).not.toContain('no-js');

    });

});