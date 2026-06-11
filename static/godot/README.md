Place Godot Web exports here.

Expected layout:

```text
website/static/godot/
  platformer/
    index.html
    index.wasm
    index.pck
    index.js
  another-demo/
    index.html
    ...
```

Then embed the build from `website/index.html` with:

```html
<iframe src="static/godot/platformer/index.html"></iframe>
```

Godot 4 Web exports may require cross-origin isolation for threaded builds.
For GitHub Pages, export without threads unless the host is configured to send
the required COOP/COEP headers.
