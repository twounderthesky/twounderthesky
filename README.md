# Two Under The Sky

Travel, reflections, and discoveries we make along the way — by **Kesha** and **Akshat**.

🌐 **Live site:** [twounderthesky.github.io/twounderthesky](https://twounderthesky.github.io/twounderthesky/)

## Add a new post

1. **Create the markdown file**  
   In `source/_posts/` add a file named `YYYY-MM-DD-your-title.md`.

   ```yaml
   ---
   layout: post
   title: "Being in the Himalayas"
   author: kesha     # akshat or ka work too
   date: 2025-01-15  # optional, defaults to file name
   cover: assets/images/himalayas-sunrise.jpg
   tags: [travel, reflections]
   excerpt: A quick summary for the home page
   ---

   Write your story in Markdown here.
   ```

   - `cover` shows up on the post card and header.
   - `tags` must exist in `source/_data/tags.yml` (add new ones if needed).

2. **Add images & other assets**  
   - Drop images in `source/assets/images/`.  
   - Reference them inside posts with: `![Alt text]({{ site.baseurl }}assets/images/your-image.jpg)`.
   - Other files (PDFs, GPX, etc.) can go in `source/assets/` as well; link to them the same way.

3. **Preview locally (optional but recommended)**

   ```bash
   cd source
   bundle exec jekyll serve
   ```

   Open `http://localhost:4000/twounderthesky/` and check the post.

4. **Build & deploy**

   ```bash
   cd source
   bundle exec jekyll build   # updates ../docs/
   cd ..
   git add -A
   git commit -m "Add post: your title"
   git push
   ```

   GitHub Pages will publish from the `docs/` folder automatically.

## Helpful files

- `source/_config.yml` — site settings (title, description, socials, GA, etc.)
- `source/_data/authors.yml` — author bios and avatars
- `source/_data/tags.yml` — tag descriptions and cover images
- `source/about/index.md` — “About us” page

That’s it—write in Markdown, keep images in `source/assets/images/`, rebuild before pushing, and the site stays in sync.
