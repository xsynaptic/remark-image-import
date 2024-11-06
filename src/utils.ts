import type { Node } from 'mdast';
import type {
  MdxFlowExpression,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';

export const isMdxFlowExpression = (node: Node): node is MdxFlowExpression =>
  node.type === 'mdxFlowExpression';

export const isMdxJsxFlowElement = (node: Node): node is MdxJsxFlowElement =>
  node.type === 'mdxJsxFlowElement';

export const isMdxJsxTextElement = (node: Node): node is MdxJsxTextElement =>
  node.type === 'mdxJsxTextElement';

export const shouldUseRawSrc = (string: string): boolean =>
  string.startsWith('.') ||
  string.startsWith('/') ||
  string.startsWith('@') ||
  string.startsWith('http') ||
  string.startsWith('data:');
