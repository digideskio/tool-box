describe("sn.ajax", function () {
    it("should define the 'sn' namespace", function () {
        expect(window.sn).toBeDefined();
    });
    it("should provide a public function 'loadData'", function () {
        expect(sn.ajax.loadData).toBeDefined();
    });

    describe("loadData", function () {
        it("should return an jQuery AJAX call object", function () {
            var fooCallOptions = {
                service: "fixtures/ajax/service.json",
                data: "{data}",
                showLoader: true,
                type: "GET",
                dataType: "HTML"
            };
            expect(typeof sn.ajax.loadData(fooCallOptions) === 'object').toBe(true);
            expect(sn.ajax.loadData(fooCallOptions).done).toBeDefined();
        });
    });
    describe("showLoader", function () {
        it("should set a class 'ajax-loading' to the body", function () {
            sn.ajax.showLoader();
            expect($("body").hasClass("ajax-loading")).toBe(true);
        });
    });
    describe("hideLoader", function () {
        it("should remove the class 'ajax-loading' from the body", function () {
            sn.ajax.hideLoader();
            expect($("body").hasClass("ajax-loading")).toBe(false);
        });
    });
});