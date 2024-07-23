/* global describe, it, before */

import { Process } from "./process";
import { Dependency } from "./dependency";

describe("Given an instance of Process", () => {
  describe("When I perform a pre-process", () => {
    it("should return vale equal or less than 100", () => {
      let processor1 = new Process();
      let lib = new Process();

      lib.preProcess(
        new Dependency(processor1, (data: any, processor: any) => {
          if (parseFloat(data[0]) > 100) {
            processor._results = ["100"];
          }
          processor._results = data;
        })
      );
      /*processor1.performPreProcess(['100']);
      expect(lib._results[0]).toEqual('100');
      processor1.performPreProcess(['90']);
      expect().toEqual('90');
      processor1.performPreProcess(['100.1']);
      expect().toEqual('100');*/
    });
  });
  describe("When I perform a post-process", () => {
    it("should return vale equal or less than 100", () => {
      let lib = new Process();

      lib.postProcess((data) => {
        if (parseFloat(data[0]) > 100) {
          return ["100"];
        }
        return data;
      });
      expect(lib.performPostProcess(["100"])[0]).toEqual("100");
      expect(lib.performPostProcess(["90"])[0]).toEqual("90");
      expect(lib.performPostProcess(["100.1"])[0]).toEqual("100");
    });
  });
});
