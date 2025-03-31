import * as TE from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"

import { describe, expect, test } from "vitest"

import { runTestScript } from "~/node"
import { TestResponse } from "~/types"

const fakeResponse: TestResponse = {
  status: 200,
  body: "hoi",
  headers: [],
}

const func = (script: string, res: TestResponse) =>
  pipe(
    runTestScript(script, { global: [], selected: [] }, res),
    TE.map((x) => x.tests)
  )

describe("toBeDeepEqual", () => {
  describe("general assertion (no negation)", () => {
    test("expect equals expected passes assertion", () => {
      return expect(
        func(`pw.expect({}).toBeDeepEqual({})`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "pass",
              message: "Expected '{}' to be '{}'",
            },
          ],
        }),
      ])
    })

    test("expect equals expected passes assertion with many values in different order", () => {
      return expect(
        func(`
          const expectedValue = {name: "gary", age: 666, nick: "gory"};
          const actualValue = {age: 666, name: "gary", nick: "gory"};
          pw.expect(expectedValue).toBeDeepEqual(actualValue)
        `, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "pass",
              message: "Expected '{\"name\":\"gary\",\"age\":666,\"nick\":\"gory\"}' to be '{\"age\":666,\"name\":\"gary\",\"nick\":\"gory\"}'",
            },
          ],
        }),
      ])
    })

    test("expect not equals expected fails assertion", () => {
      return expect(
        func(`pw.expect({name: "gary"}).toBeDeepEqual({})`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "fail",
              message: "Expected '{\"name\":\"gary\"}' to be '{}'",
            },
          ],
        }),
      ])
    })
  })

  describe("general assertion (with negation)", () => {
    test("expect equals expected fails assertion", () => {
      return expect(
        func(`pw.expect({}).not.toBeDeepEqual({})`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "fail",
              message: "Expected '{}' to not be '{}'",
            },
          ],
        }),
      ])
    })

    test("expect not equals expected passes assertion", () => {
      return expect(
        func(`pw.expect({}).not.toBeDeepEqual({name: "gory"})`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "pass",
              message: "Expected '{}' to not be '{\"name\":\"gory\"}'",
            },
          ],
        }),
      ])
    })
  })

  describe("general nested objects assertion (no negation)", () => {
    test("expect equals expected passes assertion", () => {
      return expect(
        func(`
          const expected = {name: "gary", info: { age: 666, tesed: true }};
          const actual = {info: { tesed: true, age: 666 }, name: "gary"}
          pw.expect(expected).toBeDeepEqual(actual)`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "pass",
              message: "Expected '{\"name\":\"gary\",\"info\":{\"age\":666,\"tesed\":true}}' to be '{\"info\":{\"tesed\":true,\"age\":666},\"name\":\"gary\"}'",
            },
          ],
        }),
      ])
    })

    test("expect not equals expected fails assertion", () => {
      return expect(
        func(`
          const expected = {name: "gory", info: { age: 666, tesed: true }};
          const actual = {info: { tesed: true, age: 666 }, name: "gary"}
          pw.expect(expected).toBeDeepEqual(actual)`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "fail",
              message: "Expected '{\"name\":\"gory\",\"info\":{\"age\":666,\"tesed\":true}}' to be '{\"info\":{\"tesed\":true,\"age\":666},\"name\":\"gary\"}'",
            },
          ],
        }),
      ])
    })
  })

  describe("general nested objects assertion (with negation)", () => {
    test("expect equals expected passes assertion", () => {
      return expect(
        func(`
          const expected = {name: "gary", info: { age: 666, tesed: true }};
          const actual = {info: { tesed: true, age: 666 }, name: "gory"}
          pw.expect(expected).not.toBeDeepEqual(actual)`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "pass",
              message: "Expected '{\"name\":\"gary\",\"info\":{\"age\":666,\"tesed\":true}}' to not be '{\"info\":{\"tesed\":true,\"age\":666},\"name\":\"gory\"}'",
            },
          ],
        }),
      ])
    })

    test("expect not equals expected fails assertion", () => {
      return expect(
        func(`
          const expected = {name: "gary", info: { age: 666, tesed: true }};
          const actual = {info: { tesed: true, age: 666 }, name: "gary"}
          pw.expect(expected).not.toBeDeepEqual(actual)`, fakeResponse)()
      ).resolves.toEqualRight([
        expect.objectContaining({
          expectResults: [
            {
              status: "fail",
              message: "Expected '{\"name\":\"gary\",\"info\":{\"age\":666,\"tesed\":true}}' to not be '{\"info\":{\"tesed\":true,\"age\":666},\"name\":\"gary\"}'",
            },
          ],
        }),
      ])
    })
  })
})
