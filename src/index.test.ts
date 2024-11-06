import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { describe, expect, test } from 'vitest';

import type { VFileCompatible } from 'vfile';

import plugin from './index.js';

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(plugin)
  .use(remarkStringify);

const process = async (contents: VFileCompatible): Promise<VFileCompatible> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Unsure how to fix this one
  processor.process(contents).then(({ value }) => value);

const markdownText = [
  [`No change to plain text`, `No change to plain text\n`],
  [
    `Testing... <Img src="./test1.jpg" />`,
    `import Img1 from './test1.jpg';\n\nTesting... <Img src={Img1} />\n`,
  ],
  [
    `<Img src="./test1.jpg" /><Img src="./test2.jpg" /><Img src="./test1.jpg" />`,
    `import Img1 from './test1.jpg';\n\nimport Img2 from './test2.jpg';\n\n<Img src={Img1} />\n\n<Img src={Img2} />\n\n<Img src={Img1} />\n`,
  ],
  [
    `Some text with a figure below.
		
<Img src="./test1.jpg" />

<Img src="./test2.jpg">Caption goes here...</Img>`,
    `import Img1 from './test1.jpg';

import Img2 from './test2.jpg';

Some text with a figure below.

<Img src={Img1} />

<Img src={Img2}>Caption goes here...</Img>
`,
  ],
  [
    `<ImgGroup layout="wide" columns="3"><Img src="./test1.jpg">Caption 1.</Img><Img src="./test2.jpg">Caption 2.</Img></ImgGroup>`,
    `import Img1 from './test1.jpg';\n\nimport Img2 from './test2.jpg';\n\n<ImgGroup layout="wide" columns="3"><Img src={Img1}>Caption 1.</Img><Img src={Img2}>Caption 2.</Img></ImgGroup>\n`,
  ],
  [
    `<ImgGroup layout="wide" columns="3"><Img src="./2023/test1.jpg">Caption 1.</Img><Img src="./2024/test2.jpg">Caption 2.</Img></ImgGroup>`,
    `import Img1 from './2023/test1.jpg';\n\nimport Img2 from './2024/test2.jpg';\n\n<ImgGroup layout="wide" columns="3"><Img src={Img1}>Caption 1.</Img><Img src={Img2}>Caption 2.</Img></ImgGroup>\n`,
  ],
] as const;

describe('remark figure plugin input matches expected output', () => {
  for (const [input, output] of markdownText) {
    test(input, async () => {
      await expect(process(input)).resolves.toEqual(output);
    });
  }
});
