type NODE = ReadableStream | WritableStream | TransformStream

const graph: {
    nodes: NODE[],
    edges: { from: NODE, to: NODE }[]
} = {
    nodes: [
        // ...
    ],
    edges: [
        // ...
    ]
}

