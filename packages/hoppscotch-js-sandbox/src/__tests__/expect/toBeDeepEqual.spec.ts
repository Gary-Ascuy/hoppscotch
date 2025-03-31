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
})
