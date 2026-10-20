# Agile Enablement · TV Sales Onboarding

An interactive, scrolling onboarding lesson for new TV sales associates, built in plain HTML, CSS and JavaScript. It is modeled on an Articulate Rise 360 lesson and designed with Universal Design for Learning principles.

**Live site:** https://tshwjxeebv.github.io/AgileEnablementTVSales/

## What's in the lesson

1. **Introduction** — what makes a great TV picture
2. **Pre-check** — 4 ungraded questions, one per TV, shown one at a time with Continue, ending in a results screen (score out of 4 + caption)
3. **The 5 specs** — accordion: contrast, brightness, viewing angle, refresh rate, burn-in
4. **Floor preview** — 4 reveal cards: OLED, Mini-LED, QLED, Crystal LED
5. **Deep dive** — tabs with each technology's profile, bedroom fit and watch-outs
6. **Quick scenario guide** — guess-then-reveal cards
7. **The sale** — Before / During / After tabs
8. **Practice simulation** — 5 customer scenarios with feedback and a Take Again loop
9. **Final check** — the Jordan scenario
10. **Lesson complete** — results summary and Restart

Every question has three answer choices.

## Accessibility

- Keyboard friendly: tabs use arrow keys, and every control shows a visible amber focus ring
- Click targets are at least 44×44 px
- Feedback never relies on color alone; every result has an icon and a word
- Respects `prefers-reduced-motion`
- Works on phones, laptops and large screens

## Project structure

```
index.html          Page structure
css/styles.css      Design tokens and styles (match the Figma file)
js/content.js       All lesson copy: edit text here
js/app.js           Interactions: accordion, reveal cards, tabs, quizzes, progress tracker
assets/img/         Scene images (see below)
```

## Adding the images

The site looks for these files in `assets/img/`. Until they're added, each spot shows a navy gradient placeholder, so the page still works.

| File name | Where it appears |
|---|---|
| `hero-showroom.jpg` | Hero background |
| `scenario-1-basement-theater.jpg` | Scenario 1 |
| `scenario-2-sunlit-bedroom.jpg` | Scenario 2 |
| `scenario-3-home-office.jpg` | Scenario 3 |
| `scenario-4-dorm-room.jpg` | Scenario 4 |
| `scenario-5-community-gym.jpg` | Scenario 5 |
| `sale-1-before-greeting.jpg` | The sale · Before |
| `sale-2-during-demo.jpg` | The sale · During |
| `sale-3-after-leaving.jpg` | The sale · After |

Export each image from the **06 · Art Assets** page in the Figma file as PNG or JPG, rename it to match the table, and upload it to `assets/img/` on GitHub (**Add file → Upload files**).

## Editing content

All text lives in `js/content.js`. To change a question, its answer choices, the correct answer (`correct`, counting from 0) or its feedback, edit that file and commit.
