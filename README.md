# remark-image-import

This package is a [unified][]/[remark][] plugin to automatically import images referenced in MDX files. It was designed for use with Astro and a custom MDX component for displaying images in content. The objective was to avoid having to write out import statements in every file.

Note 1: I no longer use this in my own projects so it appears here purely as example code. I won't be maintaining it.

Note 2: this plugin is distributed in ESM only.

## Install

Clone the repo.

## Example

Transform this:

```
<Img src="./test1.jpg" /><Img src="./test2.jpg" /><Img src="./test1.jpg" />
```

...into this:

```
import Img1 from './test1.jpg';
import Img2 from './test2.jpg';

<Img src={Img1} />

<Img src={Img2} />

<Img src={Img1} />
```

## License

[MIT][mit-license]

[mit-license]: https://opensource.org/licenses/MIT

[remark]: https://github.com/remarkjs/remark

[unified]: https://github.com/unifiedjs/unified
