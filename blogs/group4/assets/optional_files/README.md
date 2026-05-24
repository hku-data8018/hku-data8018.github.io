# Static HTML survey package

Main entry:
- `index.html`

Local resources:
- `style.css`
- `images/fig1.png`
- `images/fig2.png`
- `images/fig3.png`

For direct insertion into a course website:
- Use `assets/optional_files/body_only.html` if the course website already provides `<html>`, `<head>`, and `<body>` wrappers.
- Keep the `images/` folder at the same relative level as the inserted HTML unless paths are updated.
- If the website does not allow custom CSS, copy the relevant CSS rules from `style.css` into the course page stylesheet.

No external JavaScript or CDN dependency is required.
