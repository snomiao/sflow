// import { sleep } from "bun";
// import sflow from ".";
// it("works number", async () => {
//   const { value, readable } = await sflow([1, 2, 3])
//     .forEach(async (e) => {
//       await sleep(10);
//     })
//     .toLatest();
//   readable.done();
//   // wait for first emit

//   await sleep(5);
//   expect(await value).toEqual(1);
//   // expect(await obj).toEqual(false);

//   await sleep(10);
//   expect(await value).toEqual(2);
//   // expect(await obj).toEqual(false);

//   await sleep(10);
//   expect(await value).toEqual(3);
//   // expect(await obj).toEqual(true);
// });

// it("works obj", async () => {
//   const { value, readable } = await sflow([
//     { a: 1 },
//     { a: { b: { c: 2 } } },
//     { a: 3 },
//   ])
//     .forEach(async () => {
//       await sleep(10);
//     })
//     .toLatest();
//   readable.done();
//   // wait for first emit

//   await sleep(5);
//   expect(value).toEqual({ a: 1 });

//   await sleep(10);
//   // @ts-ignore
//   expect(value.a.b.c).toEqual(2);
//   expect(value).toEqual({ a: { b: { c: 2 } } });

//   await sleep(10);
//   expect(value).toEqual({ a: 3 });
// });
