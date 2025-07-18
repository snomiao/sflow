import { sf } from ".";
import { sflow } from "./sflow";
import { matchAlls, matchs, replaceAlls, replaces } from "./strings";

describe("strings functions", () => {
    describe("matchs", () => {
        it("should match strings using regexp", async () => {
            const regexp = /(\d+)/;
            const transformStream = matchs(regexp);
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("hello 123 world");
            writer.write("no numbers here");
            writer.write("456 numbers");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toHaveLength(3);
            expect(results[0]?.[0]).toBe("123");
            expect(results[0]?.[1]).toBe("123");
            expect(results[1]).toBe(null);
            expect(results[2]?.[0]).toBe("456");
        });

        it("should work with custom matcher objects", async () => {
            const customMatcher = {
                [Symbol.match]: (str: string) => {
                    const match = str.match(/test/);
                    return match;
                }
            };

            const transformStream = matchs(customMatcher);
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("this is a test");
            writer.write("no match here");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toHaveLength(2);
            expect(results[0]?.[0]).toBe("test");
            expect(results[1]).toBe(null);
        });

        it("should integrate with sflow", async () => {
            const result = await sflow(["hello 123", "world 456", "no match"])
                .through(matchs(/(\d+)/))
                .map(match => match?.[1] || "none")
                .toArray();

            expect(result).toEqual(["123", "456", "none"]);
        });
    });

    describe("matchAlls", () => {
        it("should find all matches in strings", async () => {
            const regexp = /\d+/g;
            const transformStream = matchAlls(regexp);
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("123 and 456 and 789");
            writer.write("no numbers");
            writer.write("999");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push([...value]); // Convert iterator to array
            }

            expect(results).toHaveLength(3);
            expect(results[0]).toHaveLength(3);
            expect(results[0][0][0]).toBe("123");
            expect(results[0][1][0]).toBe("456");
            expect(results[0][2][0]).toBe("789");
            expect(results[1]).toHaveLength(0);
            expect(results[2]).toHaveLength(1);
            expect(results[2][0][0]).toBe("999");
        });

        it("should integrate with sflow", async () => {
            const result = await sflow(["abc 1 def 2", "ghi 3"])
                .through(matchAlls(/\d/g))
                .map(matches => [...matches].map(m => m[0]))
                .toArray();

            expect(result).toEqual([["1", "2"], ["3"]]);
        });
    });

    describe("replaces", () => {
        it("should replace using string searchValue and string replacement", async () => {
            const transformStream = sf.replaces("hello", "hi");
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("hello world");
            writer.write("say hello");
            writer.write("hello hello");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["hi world", "say hi", "hi hello"]);
        });

        it("should replace using regexp and string replacement", async () => {
            const transformStream = replaces(/\d+/, "NUMBER");
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("I have 123 apples");
            writer.write("No numbers here");
            writer.write("456 and 789");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["I have NUMBER apples", "No numbers here", "NUMBER and 789"]);
        });

        it("should replace using regexp and function replacement", async () => {
            const transformStream = replaces(/(\d+)/, (match, p1) => `[${p1}]`);
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("I have 123 apples");
            writer.write("No numbers here");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["I have [123] apples", "No numbers here"]);
        });

        it("should replace using async function replacement", async () => {
            const transformStream = replaces(/(\d+)/, async (match, p1) => {
                await new Promise(resolve => setTimeout(resolve, 1));
                return `[${p1}]`;
            });
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("I have 123 apples");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["I have [123] apples"]);
        });

        it("should work with custom replace objects", async () => {
            const customReplacer = {
                [Symbol.replace]: (str: string, replaceValue: string) => {
                    return str.replace(/test/g, replaceValue);
                }
            };

            const transformStream = sf.replaces(customReplacer, "REPLACED");
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("this is a test string");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["this is a REPLACED string"]);
        });

        it("should integrate with sflow", async () => {
            const result = await sflow(["hello world", "hello universe"])
                .through(replaces("hello", "hi"))
                .toArray();

            expect(result).toEqual(["hi world", "hi universe"]);
        });
    });

    describe("replaceAlls", () => {
        it("should replace all occurrences using string searchValue and string replacement", async () => {
            const transformStream = replaceAlls("hello", "hi");
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("hello world hello");
            writer.write("say hello hello hello");
            writer.write("goodbye");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["hi world hi", "say hi hi hi", "goodbye"]);
        });

        it("should replace all occurrences using regexp and string replacement", async () => {
            const transformStream = replaceAlls(/\d+/g, "NUMBER");
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("I have 123 apples and 456 oranges");
            writer.write("No numbers here");
            writer.write("789");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["I have NUMBER apples and NUMBER oranges", "No numbers here", "NUMBER"]);
        });

        it("should replace all occurrences using function replacement", async () => {
            const transformStream = replaceAlls(/(\d+)/g, (match, p1) => `[${p1}]`);
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("I have 123 apples and 456 oranges");
            writer.write("No numbers here");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["I have [123] apples and [456] oranges", "No numbers here"]);
        });

        it("should replace all occurrences using async function replacement", async () => {
            const transformStream = replaceAlls(/(\d+)/g, async (match, p1) => {
                await new Promise(resolve => setTimeout(resolve, 1));
                return `[${p1}]`;
            });
            const writer = transformStream.writable.getWriter();
            const reader = transformStream.readable.getReader();

            writer.write("I have 123 apples and 456 oranges");
            writer.close();

            const results = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                results.push(value);
            }

            expect(results).toEqual(["I have [123] apples and [456] oranges"]);
        });

        it("should integrate with sflow", async () => {
            const result = await sflow(["hello world hello", "hello universe hello"])
                .through(replaceAlls("hello", "hi"))
                .toArray();

            expect(result).toEqual(["hi world hi", "hi universe hi"]);
        });
    });

    describe("edge cases", () => {
        it("should handle empty strings", async () => {
            const results = await Promise.all([
                sflow(["", "test", ""]).through(matchs(/test/)).toArray(),
                sflow(["", "test", ""]).through(matchAlls(/test/g)).map(matches => [...matches]).toArray(),
                sflow(["", "test", ""]).through(replaces("test", "replaced")).toArray(),
                sflow(["", "test", ""]).through(replaceAlls("test", "replaced")).toArray(),
            ]);

            expect(results[0]).toEqual([null, expect.any(Array), null]);
            expect(results[1]).toEqual([[], expect.any(Array), []]);
            expect(results[2]).toEqual(["", "replaced", ""]);
            expect(results[3]).toEqual(["", "replaced", ""]);
        });

        it("should handle special regex characters in string replacement", async () => {
            const result = await sflow(["test $1 test"])
                .through(replaceAlls("test", "[$1]"))
                .toArray();

            expect(result).toEqual(["[$1] $1 [$1]"]);
        });

        it("should handle multiple transform streams in sequence", async () => {
            const result = await sflow(["hello 123 world 456"])
                .through(replaces(/(\d+)/, "[$1]"))
                .through(replaceAlls("hello", "hi"))
                .toArray();

            expect(result).toEqual(["hi [123] world 456"]);
        });
    });
});
