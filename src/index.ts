import { visit } from 'unist-util-visit';

import type { Root } from 'mdast';
import type { MdxjsEsm, MdxJsxAttribute } from 'mdast-util-mdx';
import type { Plugin, Transformer } from 'unified';

import {
  isMdxJsxFlowElement,
  isMdxJsxTextElement,
  shouldUseRawSrc,
} from './utils.js';

interface RemarkShortcodeImportOptions {
  componentId?: string;
  defaultPath?: string;
  importPrefix?: string;
}

const DEFAULT_SETTINGS = {
  componentId: 'Img',
  defaultPath: './',
  importPrefix: 'Img',
} satisfies RemarkShortcodeImportOptions;

const plugin = ((options?) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options);

  return ((tree) => {
    const importStatements: Record<string, MdxjsEsm> = {};
    const srcList: Record<string, number> = {};
    let srcCounter = 1;

    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
      if (!isMdxJsxFlowElement(node) && !isMdxJsxTextElement(node)) return;
      if (node.name !== settings.componentId) return;

      const srcAttribute = node.attributes.find(
        (attribute): attribute is MdxJsxAttribute =>
          attribute.type === 'mdxJsxAttribute' &&
          attribute.name === 'src' &&
          typeof attribute.value ===
            'string' /** Don't process anything we've already modified */
      );
      const srcRaw =
        typeof srcAttribute?.value === 'string'
          ? srcAttribute.value
          : undefined;

      if (!srcRaw || !srcAttribute) return;

      /** This allows for `src="file.jpg"` or `src="./file.jpg"` to be used */
      const src = shouldUseRawSrc(srcRaw)
        ? srcRaw
        : `${settings.defaultPath}${srcRaw}`;

      /** Dedupe src attributes; only increment the counter when it's a new string */
      if (!srcList[src]) {
        srcList[src] = srcCounter;
        srcCounter++;
      }

      const importName = `${settings.importPrefix}${String(srcList[src])}`;

      /** Transform the attribute into an expression with the import name */
      const index = node.attributes.indexOf(srcAttribute);

      node.attributes[index] = {
        type: 'mdxJsxAttribute',
        name: 'src',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: importName,
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    value: importName,
                    raw: importName,
                  },
                },
              ],
            },
          },
        },
      };

      /** Add imports to the stack */
      if (!importStatements[src]) {
        importStatements[src] = {
          type: 'mdxjsEsm',
          value: `import ${importName} from '${src}';`,
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [
                {
                  type: 'ImportDeclaration',
                  source: {
                    type: 'Literal',
                    value: src,
                    raw: `'${src}'`,
                  },
                  specifiers: [
                    {
                      type: 'ImportDefaultSpecifier',
                      local: {
                        type: 'Identifier',
                        name: importName,
                      },
                    },
                  ],
                },
              ],
            },
          },
        };
      }
    });

    const importValues = Object.values(importStatements);

    if (importValues.length > 0) {
      tree.children.unshift(...importValues);
    }
    return tree;
  }) satisfies Transformer<Root>;
}) satisfies Plugin<
  [(Readonly<RemarkShortcodeImportOptions> | null | undefined)?],
  Root
>;

export default plugin;
