import { declareValuePlugin, PluginKind } from '@stryker-mutator/api/plugin';

/**
 * Stryker Tailwind Ignorer - Scrupulously following the official snippet format.
 */
export const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'tailwind', {
    shouldIgnore(path) {
      // Target StringLiterals (Tailwind classes)
      if (path.node.type !== 'StringLiteral') {
        return;
      }

      let current = path.parentPath;
      while (current) {
        // Case: Wrapper functions (tw, style, cn)
        if (
          current.node.type === 'CallExpression' &&
          current.node.callee &&
          current.node.callee.type === 'Identifier' &&
          ['tw', 'style', 'cn'].includes(current.node.callee.name)
        ) {
          return 'Tailwind class within a style wrapper (tw/cn/style)';
        }

        // Case: JSX 'className' attribute
        if (
          current.node.type === 'JSXAttribute' &&
          current.node.name &&
          current.node.name.name === 'className'
        ) {
          return 'Direct Tailwind class in JSX className attribute';
        }

        current = current.parentPath;
      }
    },
  }),
];
