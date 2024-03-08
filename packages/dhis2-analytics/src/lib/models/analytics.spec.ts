import { Fn } from "../index";

let lib: any;

describe("Given an instance of Analytics library", () => {
  lib = new Fn.Analytics();
  lib.setData("dx1").setPeriod("pe1").setOrgUnit("ou1").setParameters({
    displayProperty: "SHORTNAME",
  });
  it("should return the url", () => {
    const url = lib.url;

    expect(url.indexOf("dimension=ou:ou1") > -1).toEqual(true);
    expect(url.indexOf("dimension=pe:pe1") > -1).toEqual(true);
    expect(url.indexOf("dimension=dx:dx1") > -1).toEqual(true);
    expect(url.indexOf("displayProperty=SHORTNAME") > -1).toEqual(true);
    expect(url.indexOf("&") > -1).toEqual(true);
  });
});

let analyticsObject: any;

describe("When I get the analytics object", () => {
  analyticsObject = new Fn.AnalyticsResult({
    headers: [
      {
        name: "dx",
        column: "Data",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "pe",
        column: "Period",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "ou",
        column: "Organisation unit",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "value",
        column: "Value",
        valueType: "NUMBER",
        type: "java.lang.Double",
        hidden: false,
        meta: false,
      },
    ],
    metaData: {
      ouHierarchy: { m0frOspS7JY: "" },
      items: {
        "201808": { name: "August 2018" },
        "201807": { name: "July 2018" },
        "BJpjOFTE4By.lxM1zKPHql2": {
          name: "Artemether / Lumefantrine Oral (ALU) - Stockout < 1 week",
        },
        "201809": { name: "September 2018" },
        "201804": { name: "April 2018" },
        "201803": { name: "March 2018" },
        "201902": { name: "February 2019" },
        "201806": { name: "June 2018" },
        ou: { name: "Organisation unit" },
        "201805": { name: "May 2018" },
        "201811": { name: "November 2018" },
        "201810": { name: "October 2018" },
        "201901": { name: "January 2019" },
        "201812": { name: "December 2018" },
        dx: { name: "Data" },
        pe: { name: "Period" },
        m0frOspS7JY: { name: "MOH - Tanzania" },
        "BJpjOFTE4By.TrmsDE6SUZI": {
          name: "Artemether / Lumefantrine Oral (ALU) - Stockout > 4 weeks",
        },
        "BJpjOFTE4By.BQrHxULahIt": {
          name: "Artemether / Lumefantrine Oral (ALU) - Stockout 1-4 weeks",
        },
      },
      dimensions: {
        dx: [
          "BJpjOFTE4By.lxM1zKPHql2",
          "BJpjOFTE4By.BQrHxULahIt",
          "BJpjOFTE4By.TrmsDE6SUZI",
        ],
        pe: [
          "201803",
          "201804",
          "201805",
          "201806",
          "201807",
          "201808",
          "201809",
          "201810",
          "201811",
          "201812",
          "201901",
          "201902",
        ],
        ou: ["m0frOspS7JY"],
        co: [],
      },
    },
    rows: [
      ["BJpjOFTE4By.BQrHxULahIt", "201803", "m0frOspS7JY", "64.0"],
      ["BJpjOFTE4By.BQrHxULahIt", "201808", "m0frOspS7JY", "86.0"],
      ["BJpjOFTE4By.TrmsDE6SUZI", "201803", "m0frOspS7JY", "64.0"],
      ["BJpjOFTE4By.TrmsDE6SUZI", "201805", "m0frOspS7JY", "74.0"],
      ["BJpjOFTE4By.lxM1zKPHql2", "201806", "m0frOspS7JY", "68.0"],
      ["BJpjOFTE4By.lxM1zKPHql2", "201808", "m0frOspS7JY", "76.0"],
      ["BJpjOFTE4By.BQrHxULahIt", "201807", "m0frOspS7JY", "52.0"],
      ["BJpjOFTE4By.lxM1zKPHql2", "201803", "m0frOspS7JY", "61.0"],
      ["BJpjOFTE4By.TrmsDE6SUZI", "201804", "m0frOspS7JY", "67.0"],
      ["BJpjOFTE4By.TrmsDE6SUZI", "201808", "m0frOspS7JY", "94.0"],
      ["BJpjOFTE4By.lxM1zKPHql2", "201807", "m0frOspS7JY", "61.0"],
      ["BJpjOFTE4By.BQrHxULahIt", "201805", "m0frOspS7JY", "75.0"],
      ["BJpjOFTE4By.BQrHxULahIt", "201806", "m0frOspS7JY", "65.0"],
      ["BJpjOFTE4By.BQrHxULahIt", "201804", "m0frOspS7JY", "69.0"],
      ["BJpjOFTE4By.lxM1zKPHql2", "201804", "m0frOspS7JY", "49.0"],
      ["BJpjOFTE4By.TrmsDE6SUZI", "201807", "m0frOspS7JY", "68.0"],
      ["BJpjOFTE4By.lxM1zKPHql2", "201805", "m0frOspS7JY", "72.0"],
      ["BJpjOFTE4By.TrmsDE6SUZI", "201806", "m0frOspS7JY", "118.0"],
    ],
    height: 18,
    width: 4,
  });
  it("should return standardized analytics from new analytics", () => {
    let analytics = new Fn.Analytics();

    let results = analytics.standardizeAnalytics(analyticsObject);
    expect(results.headers !== undefined).toEqual(true);
    expect(results.rows !== undefined).toEqual(true);
    expect(results.metaData.ouHierarchy !== undefined).toEqual(true);
    expect(results.metaData.dimensions === undefined).toEqual(true);
    expect(results.metaData !== undefined).toEqual(true);
    expect(results.height !== undefined).toEqual(true);
    expect(results.width !== undefined).toEqual(true);
  });
  it("should return valid analytics object", () => {
    expect(analyticsObject.headers !== undefined).toEqual(true);
    expect(analyticsObject.rows !== undefined).toEqual(true);
    expect(analyticsObject.metaData.ouHierarchy !== undefined).toEqual(true);
    expect(analyticsObject.metaData !== undefined).toEqual(true);
    expect(analyticsObject.height !== undefined).toEqual(true);
    expect(analyticsObject.width !== undefined).toEqual(true);
  });
  /*it('should return valid header data objects', () => {
    expect(analyticsObject.headers.dx !== undefined).toEqual(true);
    expect(analyticsObject.headers.dx.name).toEqual('dx');
    expect(analyticsObject.headers.dx.column).toEqual('Data');
    expect(analyticsObject.headers.dx.valueType).toEqual('TEXT');
    expect(analyticsObject.headers.dx.type).toEqual('java.lang.String');
    expect(analyticsObject.headers.dx.index).toEqual(0);
  });
  it('should return valid header period objects', () => {
    expect(analyticsObject.headers.pe !== undefined).toEqual(true);
    expect(analyticsObject.headers.pe.name).toEqual('pe');
    expect(analyticsObject.headers.pe.column).toEqual('Period');
    expect(analyticsObject.headers.pe.index).toEqual(1);
  });
  it('should return valid header organisation unit objects', () => {
    expect(analyticsObject.headers.ou !== undefined).toEqual(true);
    expect(analyticsObject.headers.ou.name).toEqual('ou');
    expect(analyticsObject.headers.ou.column).toEqual('Organisation unit');
    expect(analyticsObject.headers.ou.index).toEqual(2);
  });
  it('should return valid header value objects', () => {
    expect(analyticsObject.headers.value !== undefined).toEqual(true);
    expect(analyticsObject.headers.value.name).toEqual('value');
    expect(analyticsObject.headers.value.column).toEqual('Value');
    expect(analyticsObject.headers.value.index).toEqual(3);
  });*/

  it("should return valid new metadata with new structure", () => {
    var analyticsData: any = {
      metaData: {
        items: {
          "201808": { name: "August 2018" },
          "201807": { name: "July 2018" },
          "201809": { name: "September 2018" },
          "201804": { name: "April 2018" },
          "201903": { name: "March 2019" },
          "201902": { name: "February 2019" },
          "201806": { name: "June 2018" },
          lgZ6HfZaj3f: { name: "Arusha City Council" },
          ou: { name: "Organisation unit" },
          "201805": { name: "May 2018" },
          "201811": { name: "November 2018" },
          "201810": { name: "October 2018" },
          "201901": { name: "January 2019" },
          "201812": { name: "December 2018" },
          pe: { name: "Period" },
        },
        dimensions: {
          pe: [
            "201804",
            "201805",
            "201806",
            "201807",
            "201808",
            "201809",
            "201810",
            "201811",
            "201812",
            "201901",
            "201902",
            "201903",
          ],
          ou: ["lgZ6HfZaj3f"],
          co: [],
        },
      },
      rows: [],
      height: 0,
      width: 0,
    };
    var analytics = new Fn.Analytics();
    var standardizedAnalytics = analytics.standardizeAnalytics(analyticsData);
    expect(standardizedAnalytics.headers.length).toEqual(0);
    expect(standardizedAnalytics.metaData.pe.length).toEqual(12);
    expect(standardizedAnalytics.metaData.ou.length).toEqual(1);
    expect(standardizedAnalytics.metaData.names.ou).toEqual(
      "Organisation unit"
    );
    expect(standardizedAnalytics.metaData.names.pe).toEqual("Period");

    var ouIdDetails = standardizedAnalytics.getDimensionDetails("lgZ6HfZaj3f");
    expect(ouIdDetails.id).toEqual("lgZ6HfZaj3f");
    expect(ouIdDetails.name).toEqual("Arusha City Council");

    var resultDetails = standardizedAnalytics.getDimensionDetailsByName("ou");
    // expect(resultDetails.length).toEqual(1);

    resultDetails = standardizedAnalytics.getDimensionDetailsByName("pe");
    expect(resultDetails.length).toEqual(12);
  });
});

let analyticsResult: any;
describe("Given an instance of Analytics library", () => {
  analyticsResult = new Fn.AnalyticsResult({
    headers: [
      {
        name: "dx",
        column: "Data",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "pe",
        column: "Period",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "ou",
        column: "Organisation unit",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "value",
        column: "Value",
        valueType: "NUMBER",
        type: "java.lang.Double",
        hidden: false,
        meta: false,
      },
    ],
    metaData: {
      ouHierarchy: { m0frOspS7JY: "" },
      items: {
        "201808": { name: "August 2018" },
        "201807": { name: "July 2018" },
        "BJpjOFTE4By.lxM1zKPHql2": {
          name: "Artemether / Lumefantrine Oral (ALU) - Stockout < 1 week",
        },
        "201809": { name: "September 2018" },
        "201804": { name: "April 2018" },
        "201803": { name: "March 2018" },
        "201902": { name: "February 2019" },
        "201806": { name: "June 2018" },
        ou: { name: "Organisation unit" },
        "201805": { name: "May 2018" },
        "201811": { name: "November 2018" },
        "201810": { name: "October 2018" },
        "201901": { name: "January 2019" },
        "201812": { name: "December 2018" },
        dx: { name: "Data" },
        pe: { name: "Period" },
        m0frOspS7JY: { name: "MOH - Tanzania" },
        "BJpjOFTE4By.TrmsDE6SUZI": {
          name: "Artemether / Lumefantrine Oral (ALU) - Stockout > 4 weeks",
        },
        "BJpjOFTE4By.BQrHxULahIt": {
          name: "Artemether / Lumefantrine Oral (ALU) - Stockout 1-4 weeks",
        },
      },
      dimensions: {
        dx: [
          "BJpjOFTE4By.lxM1zKPHql2",
          "BJpjOFTE4By.BQrHxULahIt",
          "BJpjOFTE4By.TrmsDE6SUZI",
        ],
        pe: [
          "201803",
          "201804",
          "201805",
          "201806",
          "201807",
          "201808",
          "201809",
          "201810",
          "201811",
          "201812",
          "201901",
          "201902",
        ],
        ou: ["m0frOspS7JY"],
        co: [],
      },
    },
    rows: [["BJpjOFTE4By.BQrHxULahIt", "201803", "m0frOspS7JY", "64.0"]],
    height: 18,
    width: 4,
  });
  it("should return row", () => {
    const url = lib.url;
    expect(analyticsResult.rows[0].pe !== undefined).toEqual(true);
    expect(analyticsResult.rows[0].pe.id).toEqual("201803");
    expect(analyticsResult.rows[0].pe.name).toEqual("March 2018");
    expect(analyticsResult.rows[0].dx !== undefined).toEqual(true);
    expect(analyticsResult.rows[0].dx.id).toEqual("BJpjOFTE4By.BQrHxULahIt");
    expect(analyticsResult.rows[0].dx.name).toEqual(
      "Artemether / Lumefantrine Oral (ALU) - Stockout 1-4 weeks"
    );
    expect(analyticsResult.rows[0].ou !== undefined).toEqual(true);
    expect(analyticsResult.rows[0].ou.id).toEqual("m0frOspS7JY");
    expect(analyticsResult.rows[0].ou.name).toEqual("MOH - Tanzania");
    expect(analyticsResult.rows[0].ou.path).toEqual("");

    expect(analyticsResult.rows[0].value).toEqual("64.0");
  });
});

describe("Given an instance of Analytics library", () => {
  it("should return analytics object", () => {
    new Fn.Analytics()
      .setData("fbfJHSPpUQD")
      .setPeriod("201901")
      .setOrgUnit("ImspTQPwCqd")
      .setParameters({
        displayProperty: "SHORTNAME",
      })
      .get()
      .then(
        (res) => {
          expect(res).toBe("Object");
        },
        (err) => {
          expect(err.status).toEqual(404);
        }
      );
  });
});

// describe('Given an instance of Analytics library', () => {
//   it('should return merged analytics', () => {
//     let analytics1 = new Fn.Analytics();
//     lib.setData('dx1')
//       .setPeriod('201901')
//       .setOrgUnit('ou1')
//       .setParameters({
//         displayProperty: 'SHORTNAME'
//       });
//     let analytics2 = new Fn.Analytics();
//     lib.setData('dx2')
//       .setPeriod('201901')
//       .setOrgUnit('ou2')
//       .setParameters({
//         displayProperty: 'SHORTNAME'
//       });
//     let results = analytics2.merge([analytics1]);
//     expect(results.length).toEqual(1);
//     expect(results[0].url.indexOf('dimension=pe:201901') > -1).toEqual(true);
//     expect(results[0].url.indexOf('dimension=dx:dx1;dx2') > -1).toEqual(true);
//     expect(results[0].url.indexOf('dimension=dx:ou1;ou2') > -1).toEqual(true);
//   });

//   it('should return unmerged analytics consideration', () => {
//     let analytics1 = new Fn.Analytics();
//     lib.setData('dx1')
//       .setPeriod('201901')
//       .setOrgUnit('ou1')
//       .setParameters({
//         displayProperty: 'SHORTNAME'
//       });
//     let analytics2 = new Fn.Analytics();
//     lib.setData('dx2')
//       .setPeriod('201901')
//       .setOrgUnit('LEVEL-4;ou2')
//       .setParameters({
//         displayProperty: 'SHORTNAME'
//       });
//     let results = analytics2.merge([analytics1]);
//     expect(results.length).toEqual(2);
//     expect(results[0].url.indexOf('dimension=pe:201901') > -1).toEqual(true);
//     expect(results[0].url.indexOf('dimension=dx:dx1;dx2') > -1).toEqual(true);
//     expect(results[0].url.indexOf('dimension=dx:ou1;ou2') > -1).toEqual(true);
//   });

// });
