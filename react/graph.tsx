type NODE = ReadableStream | WritableStream | TransformStream;

const _graph: {
  nodes: NODE[];
  edges: { from: NODE; to: NODE }[];
} = {
  nodes: [
    // ...
  ],
  edges: [
    // ...
  ],
};
