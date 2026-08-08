import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}


// Polyfill Fetch API and Streams for Next.js 13+ app router tests
if (typeof global.Request === 'undefined') {
  const { ReadableStream, WritableStream, TransformStream } = require('web-streams-polyfill');
  global.ReadableStream = ReadableStream;
  global.WritableStream = WritableStream;
  global.TransformStream = TransformStream;

  class TextEncoderStreamPolyfill {
    encoder = new TextEncoder();
    readable = new ReadableStream({
      start(controller: any) {}
    });
    writable = new WritableStream({
      write(chunk: any, controller: any) {}
    });
  }

  class TextDecoderStreamPolyfill {
    decoder = new TextDecoder();
    readable = new ReadableStream({
      start(controller: any) {}
    });
    writable = new WritableStream({
      write(chunk: any, controller: any) {}
    });
  }

  global.TextEncoderStream = TextEncoderStreamPolyfill as any;
  global.TextDecoderStream = TextDecoderStreamPolyfill as any;

  const primitives = require('next/dist/compiled/@edge-runtime/primitives');
  global.Request = primitives.Request;
  global.Response = primitives.Response;
  global.Headers = primitives.Headers;
  global.fetch = primitives.fetch;
}

