import { flatMaps, sf } from ".";

it("works", async () => {
  expect(await sf("a,b,c\n1,2,3\nd,s,f").through(splits()).toArray()).toEqual(
    true
  );
});
export const splits: {
  (s: string): TransformStream<string, string>;
} = (arg: any) => {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function") return flatMaps((s) => s.split(arg as string));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  return { writable, readable: fn(readable) };
};
