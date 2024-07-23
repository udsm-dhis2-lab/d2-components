/* global describe, it, before */

import { Fn } from "../index";

let lib;

describe("Given an instance of Organisation Unit in the library", () => {
  describe("When I need the url", () => {
    it("should return the url with Equality", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "==", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:eq:Rp268JB6Ne4"
      );
    });

    it("should return the url with Inequality", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "<>", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!eq:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case sensitive string,match anywhere", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "like", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:like:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case sensitive string, not match anywhere", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!like", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!like:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case sensitive string, match start", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "$like", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:$like:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case sensitive string, match end", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!$like", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!$like:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case sensitive string, not match end", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!like$", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!like$:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case insensitive string, match anywhere", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "ilike", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:ilike:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case insensitive string, not match anywhere", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!ilike", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!ilike:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case insensitive string, match start", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "$ilike", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:$ilike:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case insensitive string, not match start", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!$ilike", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!$ilike:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case insensitive string, match end", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "ilike$", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:ilike$:Rp268JB6Ne4"
      );
    });

    it("should return the url with Case insensitive string, not match end", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!ilike$", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!ilike$:Rp268JB6Ne4"
      );
    });

    it("should return the url with Greater than", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", ">", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:gt:Rp268JB6Ne4"
      );
    });

    it("should return the url with Greater than or equal", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", ">=", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:ge:Rp268JB6Ne4"
      );
    });

    it("should return the url with Less than", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "<", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:lt:Rp268JB6Ne4"
      );
    });

    it("should return the url with Less than or equal", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "<=", "Rp268JB6Ne4");
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:le:Rp268JB6Ne4"
      );
    });

    it("should return the url with Property is null", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "null");
      expect(lib.url).toEqual("organisationUnits.json?filter=id:null");
    });

    it("should return the url with Property is not null", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!null");
      expect(lib.url).toEqual("organisationUnits.json?filter=id:!null");
    });

    it("should return the url with Collection is empty", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "empty");
      expect(lib.url).toEqual("organisationUnits.json?filter=id:empty");
    });

    it("should return the url with match on multiple tokens in search property", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "token");
      expect(lib.url).toEqual("organisationUnits.json?filter=id:token");
    });

    it("should return the url with Not match on multiple tokens in search property", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!token");
      expect(lib.url).toEqual("organisationUnits.json?filter=id:!token");
    });

    it("should return the url with Find objects matching 1 or more values", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "in", ["Rp268JB6Ne4", "Rp268JB6Ne2"]);
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:in:[Rp268JB6Ne4,Rp268JB6Ne2]"
      );
    });

    it("should return the url with Find objects not matching 1 or more values", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib.where("id", "!in", ["Rp268JB6Ne4", "Rp268JB6Ne2"]);
      expect(lib.url).toEqual(
        "organisationUnits.json?filter=id:!in:[Rp268JB6Ne4,Rp268JB6Ne2]"
      );
    });
    it("should return the url with Equality and Parameters", () => {
      lib = new Fn.IdentifiableObject("organisationUnits");
      lib
        .where("level", "==", "4")
        .where("path", "like", "Rp268JB6Ne4")
        .setParameters({
          paging: "false",
          fields: "id,organisationUnitGroups[id]",
        });
      expect(lib.url.indexOf("filter=path:like:Rp268JB6Ne4") > -1).toEqual(
        true
      );
      expect(lib.url.indexOf("filter=level:eq:4") > -1).toEqual(true);
      expect(lib.url.indexOf("paging=false") > -1).toEqual(true);
      expect(
        lib.url.indexOf("fields=id,organisationUnitGroups[id]") > -1
      ).toEqual(true);
      expect(lib.url.split("&").length).toEqual(4);
    });
  });
});
