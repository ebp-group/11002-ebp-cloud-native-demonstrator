# Cloud-Native Geospatial Demonstrator

## Local Setup Instructions

1. Copy the data files into the `public/data/` directory.
2. `pnpm install`
3. `pnpm run dev`

If you also want to run the geoparquet services locally, you need to run `http-server` inside the `public/data/` directory; somehow, the Vite Dev Server cannot properly handle these.

```bash
npx http-server -o ./ -g --cors=Accept-Ranges,Content-Length,ETag,Last-Modified,Content-Range
```
