import { declareValuePlugin, PluginKind } from '@stryker-mutator/api/plugin';

const STYLE_WRAPPERS = new Set(['tw', 'style', 'cn']);

function isStyleWrapper(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    STYLE_WRAPPERS.has(node.callee.name)
  );
}

function isClassNameAttribute(node) {
  return node.type === 'JSXAttribute' && node.name?.name === 'className';
}

function matchParentContext(path, isString) {
  let current = path.parentPath;
  while (current) {
    if (isStyleWrapper(current.node)) {
      return isString
        ? 'Tailwind class within a style wrapper (tw/cn/style)'
        : 'Tailwind class object within a style wrapper (tw/cn/style)';
    }

    if (isString && isClassNameAttribute(current.node)) {
      return 'Direct Tailwind class in JSX className attribute';
    }

    current = current.parentPath;
  }
}

/**
 * Stryker Tailwind Ignorer - Scrupulously following the official snippet format.
 */
export const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'tailwind', {
    shouldIgnore(path) {
      if (path.node.type === 'StringLiteral') {
        return matchParentContext(path, true);
      }

      if (path.node.type === 'ObjectExpression') {
        return matchParentContext(path, false);
      }
    },
  }),
];
