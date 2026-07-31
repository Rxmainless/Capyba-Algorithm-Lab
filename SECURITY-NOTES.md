# Security Notes

## GHSA-qwww-vcr4-c8h2 (react-router)

`npm audit` may report this advisory even though the project runs
`react-router-dom@7.18.2`, which is the officially patched version
per https://github.com/advisories/GHSA-qwww-vcr4-c8h2.

Additionally, this advisory only affects apps using React Router's
experimental "RSC Mode" API. This project uses standard `BrowserRouter`
and is not exposed to this vulnerability regardless.

If `npm audit` still flags this after npm's advisory database catches
up (usually within a few days of a new patch release), it's safe to
disregard for this specific advisory ID.