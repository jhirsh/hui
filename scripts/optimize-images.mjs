// Build-time image optimization for hui photo galleries.
//
// Reads a source folder of images and emits a responsive ladder of AVIF + WebP
// derivatives into public/<set>/, copies the original through for "download
// original", and writes <set>.manifest.json — the array <PhotoGallery /> takes.
//
// Usage:  node node_modules/hui/scripts/optimize-images.mjs <srcDir> [set]
//   e.g.  node node_modules/hui/scripts/optimize-images.mjs photos-src photos
// Paths resolve against cwd; `set` defaults to the source folder's basename.
//
// Unchanged images are skipped (cache keyed on source size+mtime), so rebuilds
// only reprocess what changed. Requires `sharp` in the consuming project.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

// Responsive widths (px). Grid uses the small end; lightbox the large end.
// We never upscale past the original.
const WIDTHS = [400, 800, 1600, 2400];
const AVIF = { quality: 58, effort: 4 };
const WEBP = { quality: 80 };
// Slight sharpen to counter the softening that any downscale introduces.
const SHARPEN = { sigma: 0.7 };

const exts = /\.(jpe?g|png|webp|tiff?)$/i;
const isImg = (f) => exts.test(f);
// URL/path-safe name (spaces etc. → dashes) so derivative paths never need encoding.
const slug = (file) => file.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-');

async function optimize({ set, srcDir, rotationsPath }) {
  const SRC_DIR = path.join(ROOT, srcDir);
  const OUT_DIR = path.join(ROOT, 'public', set);
  const ORIG_DIR = path.join(OUT_DIR, 'orig');
  const MANIFEST = path.join(ROOT, `${set}.manifest.json`);
  if (!fs.existsSync(SRC_DIR)) {
    fs.writeFileSync(MANIFEST, '[]');
    console.log(`${set}: no ${srcDir}/ — wrote empty manifest.`);
    return;
  }
  fs.mkdirSync(ORIG_DIR, { recursive: true });

  // Optional non-destructive rotation per image (name -> degrees clockwise),
  // chosen in the rotate tool. Applied on top of EXIF auto-orient.
  const rotations =
    rotationsPath && fs.existsSync(path.join(ROOT, rotationsPath))
      ? JSON.parse(fs.readFileSync(path.join(ROOT, rotationsPath), 'utf8'))
      : {};

  let prev = [];
  try {
    prev = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {}
  const prevByName = new Map(prev.map((p) => [p.name, p]));

  const files = fs.readdirSync(SRC_DIR).filter(isImg).sort();
  const manifest = [];
  let built = 0;
  let skipped = 0;

  for (const file of files) {
    const name = slug(file);
    const origName = `${name}${path.extname(file)}`;
    const srcPath = path.join(SRC_DIR, file);
    const st = fs.statSync(srcPath);
    const rot = (((rotations[name] || 0) % 360) + 360) % 360; // 0/90/180/270 CW
    const cacheKey = `${st.size}:${Math.round(st.mtimeMs)}:r${rot}`;
    // EXIF auto-orient (no-arg rotate) for photos; explicit rotate for the
    // derived sketches (which carry no EXIF). rot is only ever set for sketches.
    const mk = () => (rot ? sharp(srcPath).rotate(rot) : sharp(srcPath).rotate());

    const cached = prevByName.get(name);
    const outputsExist =
      cached &&
      cached.cacheKey === cacheKey &&
      WIDTHS.every(
        (w) =>
          fs.existsSync(path.join(OUT_DIR, `${name}-${w}.avif`)) &&
          fs.existsSync(path.join(OUT_DIR, `${name}-${w}.webp`))
      ) &&
      fs.existsSync(path.join(ORIG_DIR, origName));

    if (outputsExist) {
      manifest.push(cached);
      skipped++;
      continue;
    }

    const meta = await sharp(srcPath).rotate().metadata();
    // metadata() is pre-rotation; swap dims for EXIF-rotated orientations…
    const exifRot = meta.orientation && meta.orientation >= 5;
    let width = exifRot ? meta.height : meta.width;
    let height = exifRot ? meta.width : meta.height;
    // …and again for the chosen 90°/270° rotation.
    if (rot === 90 || rot === 270) [width, height] = [height, width];

    const widths = WIDTHS.filter((w) => w <= width);
    if (widths.length === 0) widths.push(width);

    for (const w of widths) {
      const pipeline = mk().resize({ width: w }).sharpen(SHARPEN);
      await pipeline.clone().avif(AVIF).toFile(path.join(OUT_DIR, `${name}-${w}.avif`));
      await pipeline.clone().webp(WEBP).toFile(path.join(OUT_DIR, `${name}-${w}.webp`));
    }

    // Tiny blurred placeholder as an inline data URL.
    const blurBuf = await mk().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    const blurDataURL = `data:image/webp;base64,${blurBuf.toString('base64')}`;

    // Copy the untouched original through for the download link (slugged name).
    fs.copyFileSync(srcPath, path.join(ORIG_DIR, origName));

    const srcset = (ext) => widths.map((w) => `/${set}/${name}-${w}.${ext} ${w}w`).join(', ');
    const fallbackW = widths.includes(800) ? 800 : widths[widths.length - 1];

    manifest.push({
      name,
      cacheKey,
      width,
      height,
      blurDataURL,
      avif: srcset('avif'),
      webp: srcset('webp'),
      fallback: `/${set}/${name}-${fallbackW}.webp`,
      original: `/${set}/orig/${origName}`,
    });
    built++;
    process.stdout.write(`  ✓ ${name} (${widths.length} widths)\n`);
  }

  // Prune derivatives + originals for sources that no longer exist.
  const liveNames = new Set(files.map(slug));
  for (const f of fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR) : []) {
    const m = f.match(/^(.*)-\d+\.(avif|webp)$/);
    if (m && !liveNames.has(m[1])) fs.rmSync(path.join(OUT_DIR, f));
  }

  manifest.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`${set}: ${built} built, ${skipped} cached, ${manifest.length} total`);
}

const [srcDir, set, rotationsPath] = process.argv.slice(2);
if (!srcDir) {
  console.error('usage: optimize-images.mjs <srcDir> [set] [rotations.json]');
  process.exit(1);
}
await optimize({ srcDir, set: set || path.basename(srcDir), rotationsPath });
