/* global describe, it, before */

import { Fn } from "../index";

let lib;

describe("Given an instance of SQL View Data", () => {
  describe("When I need the url", () => {
    it("should return the url", () => {
      const lib = new Fn.SQLViewData("dx")
        .setVariable("ou", "ouid")
        .setVariable("ougroup", "ougid")
        .setParameters({
          paging: "false",
        });
      expect(lib.url.indexOf("sqlViews/dx/data.json") > -1).toEqual(true);
      expect(lib.url.indexOf("var=ou:ouid") > -1).toEqual(true);
      expect(lib.url.indexOf("var=ougroup:ougid") > -1).toEqual(true);
      expect(lib.url.indexOf("paging=false") > -1).toEqual(true);
      expect(lib.url.split("&").length).toEqual(3);
    });
  });
});
