# Portfolio Website Template

A single-page, dependency-free portfolio site. Open `index.html` in a browser to preview — no build step, no install.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and all placeholder content |
| `styles.css` | Layout, colours, responsive rules |
| `script.js` | Mobile menu, footer year, scroll reveal |

## How placeholders work

Every field you need to fill is written as `{{UPPER_SNAKE_CASE}}` so it is easy to find. Search for `{{` in your editor to jump through them one by one.

## Full placeholder list

### Site & hero
- `{{FULL_NAME}}`, `{{FIRST_NAME}}`, `{{ROLE}}`, `{{LOGO_TEXT}}`
- `{{ONE_LINE_DESCRIPTION}}` — meta description (SEO)
- `{{AVAILABILITY_STATUS}}` — e.g. "Open to freelance"
- `{{LOCATION}}`
- `{{TWO_SENTENCE_INTRO}}`
- `{{YOUR_PHOTO}}` — replace the whole `.photo-frame` block with `<img>`
- `{{GITHUB_URL}}`, `{{LINKEDIN_URL}}`, `{{X_URL}}`, `{{EMAIL}}`

### About
- `{{ABOUT_PARAGRAPH_1}}` … `{{ABOUT_PARAGRAPH_3}}`
- `{{PRIMARY_FOCUS}}`, `{{YEARS_OF_EXPERIENCE}}`, `{{CURRENT_ROLE_OR_STATUS}}`
- `{{RESUME_FILE_URL}}` — e.g. `resume.pdf` placed next to `index.html`

### Skills
- `{{SKILL_1}}` … `{{SKILL_12}}` — grouped under Languages, Frameworks, Tools

### Projects (3 cards — duplicate one to add more)
- `{{PROJECT_1_IMAGE}}`, `{{PROJECT_1_YEAR}}`, `{{PROJECT_1_TITLE}}`, `{{PROJECT_1_DESCRIPTION}}`
- `{{PROJECT_1_TECH_1}}` … `{{PROJECT_1_TECH_3}}`
- `{{PROJECT_1_LIVE_URL}}`, `{{PROJECT_1_REPO_URL}}`
- Same pattern for `PROJECT_2_*` and `PROJECT_3_*`

### Experience (3 entries — duplicate one to add more)
- `{{JOB_1_START}}` / `{{JOB_1_END}}` — use "Present" for the current role
- `{{JOB_1_TITLE}}`, `{{JOB_1_COMPANY}}`, `{{JOB_1_LOCATION}}`, `{{JOB_1_DESCRIPTION}}`
- Same pattern for `JOB_2_*` and `JOB_3_*`

### Contact
- `{{CONTACT_INVITATION}}` — one inviting sentence
- `{{FORM_NAME_PLACEHOLDER}}`, `{{FORM_EMAIL_PLACEHOLDER}}`, `{{FORM_MESSAGE_PLACEHOLDER}}` — the greyed-out text inside the form fields

## Adding images

Create an `images/` folder next to `index.html` and drop in your files. Then replace a placeholder block with an `<img>`:

```html
<div class="photo-frame">
  <img src="images/you.jpg" alt="Portrait of Your Name" />
</div>
```

Recommended sizes: portrait 800×1000, project thumbnails 1600×1000 (JPEG/WebP).

## Contact form

The form works out of the box: with no endpoint configured it opens the visitor's email app with the message pre-filled.

To receive messages directly from the page instead, set one constant at the top of `script.js`:

```js
const FORM_ENDPOINT = "https://your-form-service.example/your-form-id";
```

Any endpoint that accepts a JSON `POST` will do (Formspree, Web3Forms, a Netlify/Vercel/Cloudflare function, a Knock workflow behind a function). It receives:

```json
{ "name": "…", "email": "…", "message": "…", "sentAt": 1735689600000 }
```

Built in already:
- **Honeypot** field (`company`) — silently drops bot submissions. Leave it in place.
- **`sentAt` timestamp** — lets a backend reject submissions faster than ~3 seconds.
- **Inline validation** — email format and required fields, with `aria-invalid` and a live status message.
- **States** — the button disables while sending and restores on failure.

If you use a service that expects form-encoded data rather than JSON, change the `Content-Type` and body in the submit handler.

### Hosting note

On **Netlify** you can skip the endpoint entirely and add `netlify` + `name="contact"` to the `<form>` tag. On GitHub Pages there is no server, so use a hosted form endpoint.

## Re-theming

The site ships in a light theme. Change the CSS variables at the top of `styles.css`:

```css
:root {
  --bg: #f6f7fa;        /* page background */
  --surface: #ffffff;   /* cards, inputs */
  --border: #e2e5ec;
  --text: #14161c;
  --muted: #5a6172;
  --accent: #2f5cff;    /* buttons, links, highlights */
}
```

For a dark theme, set `--bg: #0b0c10`, `--bg-alt: #11131a`, `--surface: #161922`, `--border: #232733`, `--text: #e9ecf1`, `--muted: #949bab`, `--accent: #6c8cff`, `--accent-hover: #8ba6ff`, `--header-bg: rgba(11, 12, 16, 0.82)`, `--thumb-from: #1b1f2b`, `--thumb-to: #12151d`.

## Deploying

Upload the folder as-is to GitHub Pages, Netlify, Vercel, or Cloudflare Pages — it is static HTML.
