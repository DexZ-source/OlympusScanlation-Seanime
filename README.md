# Olympus Scanlation - Seanime Extension

Manga provider extension for [Seanime](https://seanime.app/) that fetches content from Olympus Scanlation (Spanish source).

## Features

- **Search**: Browse 800+ manga titles with instant local search
- **Chapter listing**: Full chapter list with pagination
- **Chapter reading**: Direct JSON API for page images
- **Spanish language**: All content in Spanish (`es`)
- **Scanlator info**: Chapter group/team displayed

## Installation

1. Open Seanime
2. Go to **Extensions** tab
3. Click **Add extensions**
4. Paste this URL:
   ```
   https://raw.githubusercontent.com/DexZ-source/OlympusScanlation-Seanime/main/src/Manga/OlympusScanlation/manifest.json
   ```
5. The extension will be installed automatically

## How It Works

| Method | Source | Description |
|--------|--------|-------------|
| `search()` | REST API + local filter | Fetches all series, filters locally by name |
| `findChapters()` | Dashboard API | Paginated chapter list with `meta.last_page` |
| `findChapterPages()` | REST API | Direct JSON response with page image URLs |

### Architecture

```
┌─────────────────┐     ┌──────────────────────────────┐
│  Seanime App    │────▶│  olympusxyz.com              │  (Series list & Page images)
│  (provider.js)  │────▶│  dashboard.olympusxyz.com    │  (Chapter list)
└─────────────────┘     └──────────────────────────────┘
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/series/list` | All series (846 items) |
| `GET {dashboard}/api/series/{slug}/chapters?page={n}` | Chapter list (40 per page) |
| `GET /api/capitulo/comic-{slug}/{chapterId}` | Chapter pages (JSON array of image URLs) |

## Technical Details

### Chapter ID Format

The extension uses a composite chapter ID format `{chapterId}:{mangaSlug}` to encode both the chapter ID and manga slug needed for API calls.

```
Example: "71658:el-tro5zxzno-del-dragon"
         ├─ chapterId ─┤├──── mangaSlug ────┤
```

### Image URLs

Chapter page images are served from:
```
https://dashboard.olympusxyz.com/storage/comics/{seriesId}/{chapterId}/{page}.webp
```

## Limitations

- **NSFW content**: Not filtered (all content returned)
- **Search latency**: First search takes ~2-3 seconds to load all 846 series
- **Domain changes**: Site may change domains; update `baseUrl` and `dashboardApi` in provider.js if needed


### Project Structure

```
src/Manga/OlympusScanlation/
├── manifest.json          
├── provider.js                        
```

## Credits

- [Seanime](https://github.com/5rahim/seanime) by [5rahim](https://github.com/5rahim)
- [Olympus Scanlation](https://olympusxyz.com/) for the content source

## License

GPL-3.0 license
