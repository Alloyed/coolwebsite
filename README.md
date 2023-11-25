# Cool Website!

CoolWebsite is a preconfigured build system and template optimized for creating html-based toy websites from scratch.
One way to think of it is as a "minimal" static site generator: instead of providing a lot of systems to make websites without writing HTML/CSS directly, it provides all the systems you need to write the HTML/CSS yourself!

It contains:

- A fully featured bundler (esbuild), so you can freely use even very complicated web technologies and libraries, and import as you like without worrying about "will this actually resolve at runtime?"
- Preconfigured type checkers and linters, so you can learn the syntax and rules of the web directly in your editor, and catch mistakes as soon as you make them
- A live-reloading system, so you can watch your changes in real time as you hit save
- A set of fully commented HTML boilerplate files, to serve as a starting point for brand new sites

It's notable in that it doesn't contain:

- An all-in-one build system like vite or webpack
- A custom configuration format you have to learn
- Any frontend framework support, at all
- Any runtime dependencies, at all! Any external CSS or js you'd like to use, you'll have to pull in yourself.

## Using

starting your own project from CoolWebsite is simple (if you know how git works)

```bash
$ git clone <url>
```

alternately, you can always download the latest release and unzip it on your computer!

Now that you have that, you have a website! CoolWebsite works out of the box with no configuration.

You can use any text editor to make updates to your site, but we can automatically install a number of useful plugins if you use Visual Studio Code. When you first open your website folder, you'll get a pop-up asking you to install recommended extensions: that's what that is about.

The easiest way to test your site is to open your new folder in visual studio code and hit the F5 key. The project is automatically configured to launch a local web server, and then spawn a chrome tab pointing to that new server.

Then, when you're comfortable with how things are, use

```bash
$ npm run build
```

and copy the `public/` folder to your favorite static site host.

The "source" for your website lives in the `src` folder. We start you off with three boilerplate files, but there is nothing special about these: you can delete them or replace them with your existing site, if you have one. The only rule is that files you want to ship with your site should live in `src`. Beyond that, the inner file structure is totally up to you.

So go ahead! get wacky with it. experiment by deleting code, adding, whatever, it's up to you! As much as possible, if something would fail in a browser, we'll try to tell you in advance through a combination of linters and the typescript compiler.

## Environment

### HTML

By default, every HTML file is treated as an "entry point", and copied into your public folder. Any resources you directly use, for example CSS files, js, or images, will be copied over. Anything you don't use won't, so watch out! Resources outside of your local filesystem, (eg. cdn links) won't be bundled.

The bundler will verify that every image you intend to use also exists. If it doesn't, an error will appear at compile time, so you can fix typos as soon as possible.

### CSS

We use esbuild's built-in CSS support. Docs are available here:

https://esbuild.github.io/content-types/#css

CSS modules, `@import` bundling, and media bundling are all provided.

### Javascript

A bare-bones `tsconfig.json` is provided by default, but you don't have to write typescript if you don't want. It's configured to allow both js and ts files within the same project.

The typescript compiler itself runs in parallel with the bundler, and presents its errors in the same format.

### Other files

Other asset types, like images, fonts, and media, will be automatically copied over verbatim.

## Formatting

From within this project, vscode is configured to automatically provide formatting on save by default, using the Prettier extension. To disable this behavior for whatever reason, you can delete `.vscode/settings.json`

## FAQ

> Do you support markdown/embedded templates in HTML?

Nope!

> What about minifying / "production" builds?

Nope!

> So it seems like I can't use this project for my serious webapp/dashboard/whatever else.

Seems that way. To be less glib for a second, the intent of CoolWebsite is not necessarily to build the fastest or most maintainable static site, but to give developers a good sandbox for exploring core features of the web without worrying about their build system or IDE setup. The fact that we don't do serious transformation to the HTML or javascript, except where absolutely necessary, means we can have very good performance, and have bundles that are easy to pull apart, debug, and understand.

That said, 100% of the source code for CoolWebsite is in this repository! If you really need something, the best place to start is by looking at `scripts/esbuild.mjs`.

> What if my project starts as a toy, but becomes serious later?

Nothing in the contents of `src/` should be framework specific! you can easily copy-paste into a different project template. If you're really feeling frisky you can try to extend the existing esbuild scripts: that should be possible to do, though the ecosystem of esbuild-specific plugins is less in-depth than that of other browsers.

> To use X feature, my browser is telling me to use an https connection.

This will require some configuration, but it's possible to do. See [the ESBuild docs](https://esbuild.github.io/api/#https) for more info.

> Can I target older browsers?

Esbuild will try to support any [browserslist](https://browsersl.ist/) configuration you add to `package.json`, but it's not as good as older tools at supporting very old versions of javascript. The full list of what is and isn't supported is here:
https://esbuild.github.io/content-types/#javascript
