# Notae Labs

The identity, as a site you run on your own machine. Nothing is hosted.

Notae Labs turns a founder’s brief into a living brand site the team can use without us in the room.

## Run

```bash
pnpm install
pnpm dev
```

Open the local address Next prints.

`pnpm build` writes the static pages. `pnpm lint` runs ESLint.

## The site

Six routes, in this order:

1. **Story.** Who it is for, the personality, and what the brand refuses.
2. **Voice.** Direct, specific, brief, with the lines we use.
3. **Marks.** Wordmark, short wordmark, logomark, lockup, clear space, and misuse.
4. **Color and type.** OKLCH for CSS, hex for files, process recipes for print.
5. **Applications.** Engagement letter, this site, avatar and favicon, co-brand, method cover, email.
6. **Rules and files.** The instructions, and the downloads.

The signal color marks the route you are on.

## Files

Marks live in `public/marks/`. The color table is `public/notae-colors.txt`.

Each mark has an SVG, a PDF, and PNGs at 16, 32, 180, and 512. The PNG number is the height of the art in pixels. `*-on-ink` files are the paper reversal.

The logomark is for 16 pixels and above. The wordmark is for 32 pixels of height and above.

## Rebuild the marks

The wordmark is a drawn path. Source Serif 4 is the text face on the site, and it is not the logo.

Outlines start from a Literata instance (opsz 72, wght 560), then the spacing is redrawn. The font file is not in this repo. Pass a `.ttf`, or place one at `/tmp/Literata-wordmark.ttf`.

```bash
pnpm marks /path/to/Literata-wordmark.ttf
```

The script writes the SVG, PNG, and PDF files in `public/marks/`.

## License

All rights reserved. The repository is public to read. It is not licensed for reuse.
