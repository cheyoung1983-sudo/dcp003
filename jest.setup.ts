import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Polyfill Fetch API and Streams for Next.js 13+ app router tests
if (typeof global.Request === 'undefined') {
  const primitives = require('next/dist/compiled/@edge-runtime/primitives');
  global.Request = primitives.Request;
  global.Response = primitives.Response;
  global.Headers = primitives.Headers;
  global.fetch = primitives.fetch;
  global.TextEncoderStream = primitives.TextEncoderStream;
  global.TextDecoderStream = primitives.TextDecoderStream;
  global.TransformStream = primitives.TransformStream;
  global.ReadableStream = primitives.ReadableStream;
  global.WritableStream = primitives.WritableStream;
}
