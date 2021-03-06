'use strict'

const StackFrame = require('stack-frame').default
const regexV8_Weex = /\(weex\)/
  , regexJSC_Weex = /\w+@/
const regexV8_Bundle = /eval at \w* \(\(weex\)[:\d+]+\),\s/

module.exports.resolveStack = function(ex) {
  if (!ex)
    throw new Error('The exception stack is null!');

  if (typeof ex === 'string') {
    var frames = ex.split('\n')
    if (frames.length == 1) {
      frames = ex.split('\\n')
    }
    return resolve(frames)
  }

  if (Array.isArray(ex))
    return resolve(ex)

  throw new Error('Error exception format!');
}

function resolve(stack) {
  const frames = stack
    .map(e => {
      if (regexV8_Weex.test(e)) {
        if (e.indexOf('at ') !== -1) {
          e = e.replace(/at /, '');
        }
        if (e.indexOf('(eval at') !== -1) {
          e = e.replace(regexV8_Bundle, '');
        }
      } else if (regexJSC_Weex.test(e)) {
        e = e.replace(regexJSC_Weex, '')
      }

      var _data = e.trim().split(/\s+/g);
      var _last = _data.pop();

      return new StackFrame(_data.join(' ') || null, ...location(_last));
    });

  return frames;
}

function location(lc) {
  if (lc.indexOf(':') === -1) {
    return [lc];
  }

  var reg = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
  var items = reg.exec(lc.replace(/[\(\)]/g, ''));

  return [items[1], items[2] || undefined, items[3] || undefined];
}
