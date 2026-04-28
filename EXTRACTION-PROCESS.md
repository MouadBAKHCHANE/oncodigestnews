# Website Behavior Extraction Process

A reusable methodology for extracting and replicating TRUE behavior from any website.

Born from a painful lesson: our handoff document said the header was `rgba(255,255,255,0.6) + blur(5px)` **at the top** and transparent when scrolled. The real site was the **exact opposite**. Screenshots and Playwright data proved it. Assumptions lie. Computed styles don't.

---

## The Core Principle

> **Never trust what you THINK you see. Extract what the browser COMPUTES.**

Human observation fails because:
- We see the end state, not the transition
- We confuse "looks white" with actual rgba values
- We miss progressive transitions (e.g., scroll 200-500 is a gradient, not a toggle)
- We can't perceive 0.6 opacity vs 0.95 opacity reliably
- We don't notice subtle backdrop-filter differences

---

## Phase 1: Identify All States

Before writing any extraction code, list every state the component can be in.

### Common State Triggers

| Trigger | Examples | What Changes |
|---------|----------|--------------|
| **Scroll position** | Header bg, sticky nav, parallax | background, position, opacity, transform |
| **Scroll direction** | Show/hide header on scroll up/down | transform, visibility, variant swap |
| **Hover** | Buttons, links, cards | background, color, border, shadow, scale |
| **Click/Active** | Dropdowns, accordions, modals | display, height, opacity, transform |
| **Viewport width** | Responsive breakpoints | layout, font-size, visibility, padding |
| **Time/Animation** | Carousels, marquees, loading | transform, opacity, keyframe state |
| **Intersection** | Scroll-reveal, lazy load | opacity, transform, visibility |
| **Scroll rate** | Parallax images, sticky headers, fixed backgrounds | transform (translateY), position, backgroundPosition |
| **Focus** | Form inputs, accessibility | outline, border, shadow |

### Header Example (What We Discovered)

```
States identified:
1. scroll = 0        → "Laptop" variant (transparent, no blur)
2. scroll = 200-500  → TRANSITIONING (progressive bg + blur)
3. scroll = 500+     → "Laptop White" variant (frosted glass)
4. scroll UP         → Reverts based on position, not direction
```

The handoff document missed states 2 and 4 entirely, and had states 1 and 3 swapped.

---

## Phase 2: Write the Extraction Script

### Template: Multi-State Extractor

```javascript
const { chromium } = require('playwright')
const fs = require('fs')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  await page.goto('TARGET_URL', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000) // Let animations/lazy loads settle

  const results = {}

  // ============================================
  // STEP 1: Capture the RESTING state
  // ============================================
  // Capture everything in the component's region before any interaction
  results.restingState = await page.evaluate(() => {
    const els = []
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect()
      // Adjust Y range for your target component
      if (rect.y >= -5 && rect.y < 100 && rect.height > 5) {
        const cs = getComputedStyle(el)
        els.push({
          tag: el.tagName.toLowerCase(),
          // Framer uses data-framer-name — other frameworks have their own
          dataName: el.getAttribute('data-framer-name')
                 || el.getAttribute('data-testid')
                 || el.getAttribute('aria-label')
                 || '',
          text: el.textContent?.trim()?.substring(0, 60) || '',
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height)
          },
          // THE CRITICAL PROPERTIES — always capture these
          position: cs.position,
          zIndex: cs.zIndex,
          background: cs.backgroundColor,
          backdropFilter: cs.backdropFilter,
          opacity: cs.opacity,
          transform: cs.transform,
          transition: cs.transition?.substring(0, 200),
          boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : '',
          padding: cs.padding,
          margin: cs.margin,
          border: cs.border,
          borderRadius: cs.borderRadius,
          display: cs.display,
          gap: cs.gap,
          fontFamily: cs.fontFamily?.substring(0, 100),
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          color: cs.color,
          // HIDDEN VISUAL PROPERTIES — miss these and your replica looks wrong
          WebkitTextStroke: cs.webkitTextStroke || cs['-webkit-text-stroke'] || '',
          WebkitTextStrokeWidth: cs.webkitTextStrokeWidth || '',
          WebkitTextStrokeColor: cs.webkitTextStrokeColor || '',
          WebkitBackgroundClip: cs.webkitBackgroundClip || '',
          mixBlendMode: cs.mixBlendMode,
          filter: cs.filter,
          clipPath: cs.clipPath,
          // ANIMATION PROPERTIES — detect CSS vs JS animation
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          animationTimingFunction: cs.animationTimingFunction,
          animationDirection: cs.animationDirection,
          animationIterationCount: cs.animationIterationCount,
        })
      }
    })
    return els
  })

  // ============================================
  // STEP 2: Capture at multiple scroll positions
  // ============================================
  // Use MANY positions — not just "top" and "scrolled"
  // This reveals progressive transitions
  const scrollPositions = [0, 50, 100, 150, 200, 300, 400, 500, 700, 1000]
  results.scrollCaptures = []

  for (const scrollY of scrollPositions) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scrollY)
    await page.waitForTimeout(800) // Wait for transitions to complete

    const capture = await page.evaluate((sy) => {
      const els = []
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect()
        // Wide elements near viewport top = likely header/nav
        if (rect.y >= -20 && rect.y < 120 && rect.width > 400 && rect.height > 10) {
          const cs = getComputedStyle(el)
          els.push({
            tag: el.tagName.toLowerCase(),
            dataName: el.getAttribute('data-framer-name') || '',
            rect: { y: Math.round(rect.y), h: Math.round(rect.height), w: Math.round(rect.width) },
            position: cs.position,
            zIndex: cs.zIndex,
            background: cs.backgroundColor,
            backdropFilter: cs.backdropFilter,
            opacity: cs.opacity,
            transform: cs.transform,
            boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : '',
            padding: cs.padding,
            border: cs.border,
          })
        }
      })
      return { scrollY: sy, actualY: window.scrollY, elements: els }
    }, scrollY)

    results.scrollCaptures.push(capture)
  }

  // ============================================
  // STEP 3: Test scroll DIRECTION behavior
  // ============================================
  // Some sites show/hide header based on scroll direction
  await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }))
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
  await page.waitForTimeout(1500) // Extra wait for direction-based transitions

  results.scrollDirectionTest = await page.evaluate(() => {
    // Same extraction as above
    const els = []
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.y >= -20 && rect.y < 120 && rect.width > 400 && rect.height > 10) {
        const cs = getComputedStyle(el)
        els.push({
          tag: el.tagName.toLowerCase(),
          dataName: el.getAttribute('data-framer-name') || '',
          rect: { y: Math.round(rect.y), h: Math.round(rect.height) },
          position: cs.position,
          background: cs.backgroundColor,
          backdropFilter: cs.backdropFilter,
          transform: cs.transform,
          opacity: cs.opacity,
        })
      }
    })
    return { scenario: 'scrolled-down-to-1000-then-up-to-300', elements: els }
  })

  // ============================================
  // STEP 4: Screenshots at each state
  // ============================================
  const outDir = './deep-audit'  // Adjust path
  fs.mkdirSync(outDir, { recursive: true })

  // Screenshot at rest
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.screenshot({
    path: `${outDir}/state-scroll-0.png`,
    clip: { x: 0, y: 0, width: 1440, height: 120 }
  })

  // Screenshot at each key scroll position
  for (const y of [200, 500, 1000]) {
    await page.evaluate(sy => window.scrollTo(0, sy), y)
    await page.waitForTimeout(800)
    await page.screenshot({
      path: `${outDir}/state-scroll-${y}.png`,
      clip: { x: 0, y: 0, width: 1440, height: 120 }
    })
  }

  // Screenshot after scroll-up
  await page.evaluate(() => window.scrollTo(0, 1000))
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: `${outDir}/state-scroll-up-to-300.png`,
    clip: { x: 0, y: 0, width: 1440, height: 120 }
  })

  // Save all data
  fs.writeFileSync(`${outDir}/extraction.json`, JSON.stringify(results, null, 2))
  console.log('Done. Check:', outDir)

  await browser.close()
})()
```

### What to Adapt Per Site

| Variable | How to Determine |
|----------|-----------------|
| `rect.y < 100` | Adjust based on where your component lives (header = top, footer = bottom) |
| `rect.width > 400` | Helps filter to full-width components — lower for sidebar elements |
| `scrollPositions` | Add more positions between the values where transitions happen |
| `waitForTimeout` | Increase if the site has slow animations (Framer = 300-500ms typical) |
| `data-framer-name` | Replace with framework-specific identifiers (data-testid, class patterns, etc.) |

---

## Phase 3: Analyze the Extraction Data

### Step 1: Find the Transition Boundaries

Look at the scroll captures and find WHERE values change:

```
scroll=0:   bg="rgba(0, 0, 0, 0)"         blur="none"
scroll=50:  bg="rgba(0, 0, 0, 0)"         blur="none"       ← still resting
scroll=100: bg="rgba(0, 0, 0, 0)"         blur="none"       ← still resting
scroll=200: bg="rgba(0, 0, 0, 0)"         blur="none"       ← TRANSITION STARTS HERE
scroll=300: bg="rgba(253, 253, 253, 0.2)"  blur="blur(1.6px)" ← mid-transition
scroll=500: bg="rgba(253, 253, 253, 0.59)" blur="blur(4.9px)" ← TRANSITION ENDS HERE
scroll=1000: bg="rgba(255, 255, 255, 0.6)" blur="blur(5px)"  ← final state
```

This tells you:
- **Start threshold**: scroll = 200
- **End threshold**: scroll = 500
- **Transition range**: 300px
- **It's PROGRESSIVE, not binary**

### Step 2: Calculate the Math

From the boundary data:

```javascript
// progress goes from 0 to 1 over the transition range
const progress = Math.min(1, Math.max(0, (scrollY - START) / RANGE))

// Apply to each property
const bgAlpha = progress * FINAL_ALPHA    // 0 → 0.6
const blurPx = progress * FINAL_BLUR      // 0 → 5
```

### Step 3: Verify with Screenshots

Compare your screenshots against the computed values:
- `state-scroll-0.png` should show transparent header over dark content = YES
- `state-scroll-500.png` should show frosted glass = YES
- `state-scroll-up-to-300.png` should match the scroll=300 capture = CHECK

### Step 4: Check for Variant Swapping

Framer sites often swap entire component variants instead of animating properties.
Signs of variant swapping:
- A `data-framer-name` attribute changes (e.g., "Laptop" → "Laptop White")
- The element's `transform` changes abruptly
- Child elements appear/disappear (e.g., logo swap from white SVG to dark SVG)

If you see variant swapping, capture BOTH variant states and their exact threshold.

---

### Step 5: Detect Scroll Velocity (Parallax / Sticky / Fixed)

Not everything scrolls at the same rate. An element can look normal in a single screenshot but behave completely differently in motion. The only way to catch this is to **measure element Y positions across multiple scroll depths and compute velocity**.

```
velocity = (elementY_at_scrollB - elementY_at_scrollA) / (scrollB - scrollA)
```

| Velocity | Behavior | Example |
|----------|----------|---------|
| **-1.0** | Normal — moves with the page | Regular content |
| **0** | Fixed — stays in place | `position: fixed` header, `background-attachment: fixed` |
| **Between -1 and 0** (e.g. -0.7) | Parallax — moves slower than scroll | Hero images, background layers |
| **0 within a range, then -1** | Sticky — fixed until threshold | `position: sticky` nav bars |

**How to extract it:**

```javascript
// Track every significant element's absY across scroll positions
const velocityData = []
const scrollSteps = [0, 200, 400, 600, 800]

for (const scrollY of scrollSteps) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scrollY)
  await page.waitForTimeout(500)

  const snapshot = await page.evaluate(() => {
    const els = []
    document.querySelectorAll('img, [class*="wrapper"], [class*="hero"], section').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 100 && rect.height > 100) {
        els.push({
          selector: el.tagName + '.' + el.className.split(' ')[0],
          viewportY: rect.y,
          absY: rect.y + window.scrollY,
          transform: getComputedStyle(el).transform
        })
      }
    })
    return { scrollY: window.scrollY, elements: els }
  })
  velocityData.push(snapshot)
}
```

Then for each element, compare its `viewportY` change against the scroll change:
- If the page scrolled 200px and the element's `viewportY` changed by -200px → velocity = -1 (normal)
- If the page scrolled 200px and the element's `viewportY` changed by -140px → velocity = -0.7 (parallax, 30% slower)
- If the page scrolled 200px and the element's `viewportY` didn't change → velocity = 0 (fixed)

**Signs of parallax in static extraction** (when you can't run the velocity check):
- Element has `transform: matrix(1, 0, 0, 1, 0, 0)` — initialized for JS manipulation
- Element has `will-change: transform` — GPU-accelerated for scroll performance
- Image is **oversized** relative to its container (e.g. `height: 120%`) with `overflow: hidden` parent — the extra size gives room for parallax translation
- Container uses `display: flex; justify-content: center; align-items: center; overflow: hidden` around an image — this is a manual crop frame that enables parallax shifting

**To replicate parallax**, you don't need to match the original's implementation. You need:
1. The **velocity ratio** (e.g., image moves at 70% of scroll speed = 0.3 parallax factor)
2. An **oversized image** (typically 110-130% of container height)
3. A `translateY` that shifts based on scroll: `translateY(-(scrollProgress * parallaxFactor * maxShift)px)`

### Step 6: Detect Stacked/Layered Element Patterns

When two or more elements share **identical `rect` values** (same x, y, width, height), they're stacked layers. This is extremely common for:
- Image + overlay composites (one layer holds the image, another holds buttons/text)
- Gradient masks on top of content
- Clip regions with separate content and decoration layers

**How to detect**: After extraction, group elements by their rect signature `{x, y, w, h}`. Any group with 2+ elements is a layer stack. Then classify each:
- Layer with `img` or `background-image` → **content layer**
- Layer with `position: absolute` children → **overlay layer**
- Layer with `background: linear-gradient(...)` → **gradient mask layer**
- Layer with `pointer-events: none` → **decorative layer**

Record the stacking order (DOM order = paint order, unless `z-index` overrides).

**Common trap**: Assuming overlays need gradients for text contrast. Check the actual `background` and `backgroundImage` of every element between the text and the image. If none contain `gradient`, the contrast comes from the image content itself (e.g., text placed over a naturally dark area like clothing or shadows).

---

## Phase 4: Implement from Data, Not Assumptions

### The Golden Rule

```
For EVERY CSS value in your implementation:
  1. Find it in the extraction JSON
  2. If it's not there, extract it
  3. If you can't extract it, screenshot it and measure
  4. NEVER guess "it looks like about 16px"
```

### Implementation Checklist

For each component:

- [ ] All dimensions (width, height) match extracted `rect` values
- [ ] All colors match extracted `backgroundColor`, `color` values
- [ ] All spacing matches extracted `padding`, `margin`, `gap` values
- [ ] All typography matches extracted `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
- [ ] All borders match extracted `border`, `borderRadius` values
- [ ] All effects match extracted `boxShadow`, `backdropFilter`, `opacity`
- [ ] All transitions match extracted `transition` values
- [ ] All `letter-spacing` values extracted in px (not em/unitless) — especially for headings where `-2px` vs default is dramatic
- [ ] All `line-height` values extracted in px — `1.05em` on a 61px heading is NOT the same as `60.95px`
- [ ] Overlay insets measured precisely: `left = child.x - parent.x`, `right = (parent.x + parent.w) - (child.x + child.w)`, `bottom = (parent.y + parent.h) - (child.y + child.h)`
- [ ] Stacked layers (same rect) reproduced with correct DOM nesting and z-order
- [ ] Parallax/fixed/sticky elements identified via scroll velocity and implemented with correct speed ratio
- [ ] `margin: auto` layout patterns detected (e.g., flex column child with `margin-top: auto` = "pin to bottom")
- [ ] **DOM nesting matches live site** — wrapper hierarchy (padding-global > container-large > padding-section-*) replicated before any section-specific layout
- [ ] State changes happen at the correct thresholds (verified by multi-position capture)
- [ ] Progressive transitions use the correct math (verified by intermediate captures)

---

## Phase 5: Hover & Interaction States

Scroll is just one trigger. Extend the extraction for interactive states:

### Hover Extraction

```javascript
// Find the target element
const button = await page.$('a[data-framer-name="CTA"]')

// Capture BEFORE hover
const beforeHover = await page.evaluate(el => {
  const cs = getComputedStyle(el)
  return {
    background: cs.backgroundColor,
    color: cs.color,
    transform: cs.transform,
    boxShadow: cs.boxShadow,
    border: cs.border,
  }
}, button)

// Hover and capture AFTER
await button.hover()
await page.waitForTimeout(500) // Wait for transition

const afterHover = await page.evaluate(el => {
  const cs = getComputedStyle(el)
  return {
    background: cs.backgroundColor,
    color: cs.color,
    transform: cs.transform,
    boxShadow: cs.boxShadow,
    border: cs.border,
  }
}, button)

// Now you know exactly what changes on hover
```

### Responsive Extraction

```javascript
const viewports = [
  { width: 1440, height: 900, label: 'desktop' },
  { width: 1024, height: 768, label: 'tablet-landscape' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 390, height: 844, label: 'mobile' },
]

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  await page.waitForTimeout(1000)

  // Extract computed styles at this viewport
  // Screenshot at this viewport
  // Compare layout changes
}
```

---

## The Two Fundamental Animation Detection Rules

Every animation misclassification we've made traces back to violating one of these two rules. Apply them to EVERY element on EVERY website before writing implementation code.

### Rule 1: The Causality Isolation Protocol

**The problem:** You see values (opacity, transform, position) changing across captures and assume the capture variable (e.g., scroll position) caused the change. This is wrong more often than you think. Your scroll captures have wait times between them. During those waits, time-based animations cycle independently. A carousel that fades its items every 3 seconds will show different opacities at scroll=500 vs scroll=1000 — not because scroll drives it, but because you captured different frames of a timer.

**The principle:** Any observed change has a **trigger**. The possible triggers are:

| Trigger | Examples |
|---------|----------|
| Scroll position | Parallax, sticky nav, scroll-reveal, progress bars |
| Time | Carousels, marquees, blinking cursors, cycling testimonials |
| User interaction | Hover states, click toggles, focus rings |
| Viewport intersection | Lazy load, appear-on-scroll, one-shot entrance |
| Combination | Scroll-triggered animation that then plays on a timer |

**You cannot determine the trigger by observing the change alone.** You must isolate variables.

**The protocol — run for every detected change:**

```
TEST A — Is it time-driven? (RUN THIS FIRST)
  1. Scroll to a position where the element is visible
  2. Wait 2 seconds (let everything settle)
  3. Capture values every 500ms for 15 seconds (30 data points)
  4. Analyze:
     - Values oscillate between states → CAROUSEL / TOGGLE (measure cycle duration)
     - Values drift monotonically → MARQUEE / CONTINUOUS (measure speed)
     - Values change once then stabilize → ONE-SHOT ENTRANCE
     - Values are perfectly stable → NOT time-driven (proceed to Test B)

TEST B — Is it scroll-driven?
  1. Capture at 5+ scroll positions, but at each position:
     - Wait for settle (800ms)
     - Take 3 rapid captures (100ms apart) to confirm stability
  2. If values at each position are stable (Test A passed) but differ
     between positions → SCROLL-DRIVEN
  3. Calculate: velocity = deltaValue / deltaScroll
     - velocity ≈ constant → linear scroll relationship
     - velocity varies → eased/threshold scroll relationship

TEST C — Is it intersection-driven?
  1. Scroll element completely OUT of viewport, capture values
  2. Scroll element INTO viewport, wait 1s, capture values
  3. Scroll element OUT again, wait 1s, capture
  4. Scroll element IN again, wait 1s, capture
  5. Analyze:
     - Animates on first entry, doesn't reset on exit → ONE-SHOT INTERSECTION
     - Animates every time it enters → REPEATING INTERSECTION
     - Animates on entry AND exit → BIDIRECTIONAL INTERSECTION

Only after all three tests can you classify the animation.
```

**Why Test A must come first:** If you skip it and compare scroll positions directly, every time-based animation gets misclassified as scroll-driven. This is the single most common extraction error.

**Capture duration math:** You need 3+ full cycles to confirm a repeating pattern. For unknown cycle durations, 15 seconds at 500ms intervals catches cycles from 1s to 5s. For slower animations (image sliders, testimonial rotators), extend to 30 seconds.

**The `transition: all` signal:** When extraction shows `transition: all` but `animationName: none`, this does NOT mean "no animation." It means "CSS transitions are ready to smooth any property change triggered by JavaScript." This is the standard pattern for JS-driven animations (Webflow IX2, GSAP, Framer Motion, custom requestAnimationFrame loops). The JS engine sets `opacity: 0`, and `transition: all` makes it smooth. Treat `transition: all` as a **positive signal** that JS animation is likely.

**Template: Time-Based Animation Detector**

```javascript
// Fix scroll position, capture over time
async function detectTimeAnimation(page, selector, durationMs = 15000, intervalMs = 500) {
  const captures = [];
  const count = Math.ceil(durationMs / intervalMs);
  
  for (let i = 0; i < count; i++) {
    const data = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        opacity: parseFloat(cs.opacity),
        transform: cs.transform,
        x: rect.x,
        y: rect.y,
        // Content fingerprint (Rule 2)
        contentHash: el.innerHTML.length + ':' + el.innerHTML.substring(0, 100),
      };
    }, selector);
    captures.push({ timestamp: Date.now(), ...data });
    await page.waitForTimeout(intervalMs);
  }

  // Analyze
  const opacities = captures.map(c => c.opacity);
  const isStable = opacities.every(o => Math.abs(o - opacities[0]) < 0.01);
  const contentChanged = new Set(captures.map(c => c.contentHash)).size > 1;
  
  return { captures, isStable, contentChanged };
}
```

### Rule 2: The Content Identity Protocol

**The problem:** You track computed styles (opacity, transform, position) but never check if the **content inside elements changed**. Five logo containers sit in the DOM with `opacity` fading in and out. You think it's a visual animation. But the SVGs inside them are shuffling — different logos appear in different slots each cycle. You track the container and miss that the contents rotated.

**The principle:** A DOM element is a **container**. What it contains can change independently of how it's styled. Carousels swap children. Tabs replace content. Sliders reorder items. Image galleries cycle `src` attributes. If you only track the container's computed styles, you will never detect content rotation.

**The protocol — run for every element suspected of cycling:**

```
1. CAPTURE A CONTENT FINGERPRINT at each time interval:
   - Child element classNames or tag sequence
   - Text content (first 50 chars)
   - Image src attributes
   - SVG viewBox or path data prefix
   - innerHTML length + first 100 chars (cheap hash)

2. COMPARE fingerprints across captures:
   - Same fingerprint every time → STATIC content, animation is purely visual
   - Fingerprint changes → CONTENT SWAP detected
   - Fingerprints follow a repeating sequence → CAROUSEL with ordered rotation
   - Fingerprints are random each cycle → SHUFFLE

3. When content swaps are detected, also extract:
   - Total number of unique content pieces (how many items exist in rotation)
   - The rotation order (sequential, random, or weighted)
   - Cycle duration (from Rule 1 Test A)
   - Transition style (crossfade, slide, instant swap)
```

**How to detect carousel/rotator candidates** (elements that MIGHT swap content):

| Signal | What It Means |
|--------|--------------|
| Multiple siblings with identical structure (same class, same child layout) | Slots in a carousel |
| Parent has `overflow: hidden` | Clips content during swap/slide |
| Elements have `transition: opacity` or `transition: all` | Smooths the crossfade |
| `position: relative` parent with `position: absolute` children at same coordinates | Stacked slides |
| Fixed container dimensions with variable child content | Slider viewport |
| More DOM children than visually displayed items | Hidden slides waiting to rotate in |
| `display: none` siblings with similar structure | Off-screen carousel items |

**Position changes ≠ movement:**

When element positions change between captures but element count stays the same:
- x AND y both change smoothly → likely real movement (drag, scroll, parallax)
- Only y changes in small jumps while x stays constant → likely **content swap** (different content has different natural height — a 69px-tall logo replacing a 32px-tall one shifts everything)
- Positions snap instantly (no interpolation between old and new) → content swap, not animated movement

**Stagger pattern detection:**

When sibling elements have graduated values at a single capture moment (e.g., opacities `[0.001, 0.007, 0.02, 0.06, 0.15]`):
- Calculate ratios between consecutive items: `0.007/0.001 ≈ 7`, `0.02/0.007 ≈ 3`, `0.06/0.02 ≈ 3`, `0.15/0.06 ≈ 2.5`
- Roughly consistent ratios = **stagger delay pattern** (each item starts its transition N ms after the previous)
- Gradient direction (ascending left→right or right→left) = animation sweep direction
- If direction reverses between fade-out and fade-in = alternating stagger (common in premium animations)
- Stagger delay can be calculated: if you know the transition duration (from `transition` property) and the opacity gradient, the delay ≈ `transition_duration × (1 - opacity_ratio)`

**Template: Content Fingerprint Capture**

```javascript
// Capture content identity alongside computed styles
async function captureWithFingerprint(page, containerSelector, itemSelector) {
  return await page.evaluate((container, items) => {
    const parent = document.querySelector(container);
    if (!parent) return null;
    
    const children = parent.querySelectorAll(items);
    return Array.from(children).map((el, i) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      // Visual properties
      const visual = {
        opacity: parseFloat(cs.opacity),
        transform: cs.transform,
        x: rect.x,
        y: rect.y,
      };
      
      // Content fingerprint
      const firstChild = el.firstElementChild;
      const fingerprint = {
        childClass: firstChild ? firstChild.className.substring(0, 60) : '',
        childTag: firstChild ? firstChild.tagName : '',
        textContent: el.textContent?.trim()?.substring(0, 50) || '',
        imgSrc: el.querySelector('img')?.src?.substring(0, 80) || '',
        svgViewBox: el.querySelector('svg')?.getAttribute('viewBox') || '',
        innerHTMLLength: el.innerHTML.length,
      };
      
      return { index: i, ...visual, fingerprint };
    });
  }, containerSelector, itemSelector);
}
```

**These two rules together catch every animation pattern:**

| Scenario | Rule 1 Catches | Rule 2 Catches |
|----------|---------------|----------------|
| Parallax image | ✓ Test B: scroll-driven | — |
| Logo carousel | ✓ Test A: time-driven oscillation | ✓ Content fingerprints change each cycle |
| Marquee ticker | ✓ Test A: time-driven drift | — (same content, just translating) |
| Scroll-reveal | ✓ Test C: one-shot intersection | — |
| Tab switcher | — (user-triggered) | ✓ Content swaps on click |
| Image slider | ✓ Test A: time-driven or user | ✓ img src changes between captures |
| Sticky header | ✓ Test B: scroll-driven | — |
| Testimonial rotator | ✓ Test A: time-driven | ✓ Text content fingerprint changes |
| Hover effect | — (user-triggered) | — |
| Content shuffle | ✓ Test A: time-driven | ✓ Fingerprints reorder randomly |

---

## The Invisible Animation Trap (Lesson from Hero Ticker)

This is the gold discovery. Our hero had giant scrolling text at the bottom — "Renewable Energy Clean Energy...". We looked at it and thought:

> "It's faint white text, maybe `rgba(255,255,255,0.05)`, scrolling left."

We extracted the computed styles and got:

```
color: rgba(255, 255, 255, 0)    ← FULLY TRANSPARENT. Not 0.05. ZERO.
animationName: none               ← No CSS animation at all
animationDuration: 0s             ← Nothing
transform: none                   ← Nothing
```

But the text IS visible on screen (as an outline) and IS moving. Two things were happening:

### 1. The text uses `-webkit-text-stroke` (outline only, no fill)

The `color` is transparent — the text has NO fill. What you SEE is a **stroke outline** around each letter. This creates the subtle hollow/ghost text effect. `getComputedStyle()` returns the `color` correctly as `rgba(255,255,255,0)`, but we weren't extracting `-webkit-text-stroke` — so we MISSED the actual visual mechanism.

**Lesson**: When a visual effect doesn't match the extracted `color`/`opacity`/`background`, look for these alternative rendering properties:
- `-webkit-text-stroke` / `-webkit-text-stroke-width` / `-webkit-text-stroke-color`
- `background-clip: text` + `background-image` (gradient text)
- `mix-blend-mode` (compositing effects)
- `mask-image` / `-webkit-mask-image`
- `filter` (blur, brightness, contrast)
- `clip-path`
- SVG filters referenced via `filter: url(#...)`

### 2. The animation is JS-driven, not CSS

We proved the text moves by capturing positions at 3 time intervals:
```
Capture 0:  x = -192.1
Capture 1:  x = -252.6   (2 seconds later, moved 60.5px)
Capture 2:  x = -312.6   (2 seconds later, moved 60.0px)
```

Speed: **~30px/s** — a very slow crawl. But `animationName: none` and `transform: none`.

Framer (and many other frameworks) use their own JS animation engines — `requestAnimationFrame` loops that update element positions directly via JS, not through CSS. The browser sees no CSS animation, but the element moves anyway.

**How to detect JS-driven animations**:
```javascript
// Capture element position at multiple time intervals
const motionCaptures = []
for (let i = 0; i < 3; i++) {
  await page.waitForTimeout(2000)
  const pos = await page.evaluate(() => {
    const el = document.querySelector('YOUR_SELECTOR')
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      x: rect.x,
      y: rect.y,
      transform: cs.transform,
      animation: cs.animationName,
      timestamp: Date.now()
    }
  })
  motionCaptures.push(pos)
}

// If x/y changed but transform and animation are "none" → JS animation
// Calculate speed: deltaPixels / deltaSeconds
```

**For replication**: It doesn't matter HOW the original animates. What matters is:
1. **Speed**: pixels per second (calculate from motion captures)
2. **Direction**: left-to-right or right-to-left (watch x increase or decrease)
3. **Easing**: linear (constant speed) or eased (compare deltas between captures)

Then replicate with CSS `@keyframes` + `translateX(-50%)` at the matching speed. CSS animation is actually better for performance than the JS approach many frameworks use.

### Speed Calculation Formula

```
Speed = |x_change| / time_between_captures

Duration for CSS animation = total_content_width / speed

Example from Solshine ticker:
  Speed = 60.5px / 2s = 30.25px/s
  Content width = 11486px (one copy)
  Duration = 11486 / 30.25 ≈ 380s
```

### What Our Eyes Told Us vs What The Data Showed

| What We Saw | What We Assumed | What Extraction Proved |
|-------------|-----------------|----------------------|
| Faint white text | `color: rgba(255,255,255,0.05)` | `color: rgba(255,255,255,0)` + stroke outline |
| Text scrolling left | `animation: ticker 20s linear infinite` | JS animation at 30px/s ≈ 380s per cycle |
| Font weight looks normal | `fontWeight: 300` | `fontWeight: 700` (bold, but stroke-only makes it look thin) |
| Letter spacing looks wide | `letterSpacing: -10px` | `letterSpacing: -2px` |

**Every single assumption was wrong.** Not approximately wrong — fundamentally wrong mechanism. This is why you extract, not eyeball.

---

## Golden Rule: Blind Extract, Filter Later

> **Extract EVERYTHING first. Never filter during extraction.**

Targeted scripts that filter by assumptions (fontSize > 100, width > 400) miss what doesn't match your mental model.
Blind extraction dumps ALL elements with ALL CSS properties — reveals container `opacity: 0.19`, `rotate(2deg)` on rows, `mask-image` gradients, unequal hamburger bars (26/23/29px not 24px), SVG icons vs unicode chars.
3 targeted scripts missed what 1 blind script found in seconds.
Motion detection: no `Math.round()`, 5+ captures at 3s+ intervals, raw floats, track by element index not position.
If you can't see it in the data, your script has a filter hiding it.

---

## Mistakes to Avoid

### 1. Extracting Class Names Instead of Computed Styles
Class names tell you nothing about the actual rendered output. A class called `.header-transparent` might not be transparent at all. **Always use `getComputedStyle()`**.

### 2. Capturing Only Two States
Binary thinking ("at top" / "scrolled") misses progressive transitions. The Solshine header has a 300px-wide transition zone. You need **granular captures** to find it.

### 3. Forgetting Scroll Direction
Some headers hide on scroll-down and show on scroll-up. If you only test scrolling down, you'll miss half the behavior. **Always test scroll-up**.

### 4. Trusting the Design Document
The handoff document for Solshine had the header states **completely inverted**. Always verify against extracted data. The extraction is the source of truth, not the spec.

### 5. Not Waiting Long Enough
Framer transitions are typically 300-500ms. CSS transitions can be up to 1s. If you capture too quickly, you'll get mid-transition values. **Wait at least 800ms** after any state change.

### 6. Ignoring Sub-Elements
The header has a nav pill, individual links, a CTA button, a search icon, a hamburger — each with their own styles. Don't just extract the top-level `<header>` — go deep into children.

### 7. Assuming Something Animates When It Doesn't (and Vice Versa)
The hero ticker we assumed was a 20s fast animation is actually ~380s — **19x slower**.

But worse: we then concluded the client logos were static because our first extraction showed "no movement." We were WRONG AGAIN. A second extraction with **higher precision** (no rounding, 5 captures at 3-second intervals) proved the logos DO scroll at ~4.5px/s.

**Why the first extraction missed it:**
1. `Math.round()` on x-positions hid sub-pixel movement
2. The delta calculation tracked the wrong element (`allImgs[0]` was the header logo, not client logos)
3. Only 3 captures at 2-second intervals — too few, too fast for a slow animation

**Fix: High-precision motion detection protocol:**
```javascript
// NO rounding, 5+ captures, 3+ second intervals, track the RIGHT elements
for (let i = 0; i < 5; i++) {
  const pos = await page.evaluate(() => {
    const imgs = []
    document.querySelectorAll('img[alt="YOUR_TARGET"]').forEach(el => {
      imgs.push({ x: el.getBoundingClientRect().x }) // NO .toFixed(), NO Math.round()
    })
    return { timestamp: Date.now(), imgs }
  })
  captures.push(pos)
  await page.waitForTimeout(3000) // Longer intervals catch slower animations
}
// Compare MATCHING elements, not just "first in array"
```

### 8. Missing Gradient Mask Overlays
The client logos section had fade-in/fade-out edges that we completely missed because we never extracted `mask-image`. The original uses TWO overlapping gradient masks:
- Left fade: `mask: linear-gradient(90deg, transparent 2%, black 18%)`
- Right fade: `mask: linear-gradient(270deg, transparent 4.24%, black...)`

These create the classic "logos fade in from edge" effect. Without them, logos appear/disappear abruptly at the container edge.

**Always extract these overlay properties:**
- `mask-image` / `-webkit-mask-image`
- `background-image` on sibling/child elements (gradient overlays)
- Pseudo-elements `::before` / `::after` (often used for fade effects)
- `pointer-events: none` on overlay elements (they're decorative)

### 9. Hard-Coding Instead of Using Math
When you find a progressive transition, don't use CSS breakpoints or class toggles. **Use math**:
```javascript
const progress = clamp((scrollY - start) / range, 0, 1)
const value = progress * targetValue
```

### 10. Missing Parallax Because You Only Took One Screenshot
A single screenshot at scroll=0 reveals nothing about scroll behavior. An image that looks perfectly normal might be parallax-scrolling at 70% speed. **You cannot detect parallax from a static capture.** You need element positions at multiple scroll depths to compute velocity. If an element has `transform: matrix(...)` or `will-change: transform` in its computed styles, treat it as a parallax suspect and run the velocity check.

### 11. Assuming Overlay Text Needs a Gradient
When you see white text over an image, the instinct is to add a dark gradient overlay for contrast. But many sites place text over **naturally dark regions** of the photo (clothing, shadows, dark backgrounds). If extraction shows `background: rgba(0,0,0,0)` and `backgroundImage: none` on every element between the text and the image — there is no gradient. The photographer/art director chose the image specifically for that dark zone. Adding a gradient where none exists changes the mood of the image.

### 12. Treating `flex + center + overflow:hidden` as Decorative
When an image container uses `display: flex; justify-content: center; align-items: center; overflow: hidden` — this isn't just styling. It's a **crop-and-center mechanism**. The image is larger than its container, the flex centering positions the focal point (face, subject), and overflow clips the edges. This pattern is the foundation for parallax: on scroll, a `translateY` shifts the image inside this flex-centered frame, and the overflow keeps it clean. If you replace this with `object-fit: cover`, it looks the same statically but breaks the parallax because `object-fit` doesn't respond to `transform`.

### 13. Ignoring Precise Insets on Overlays
When an overlay sits inside a container, don't just say "position: absolute; bottom: 0". Measure the exact pixel insets from parent edges. A 15px left inset vs 11px right inset is intentional — it aligns with content rhythm or optical balance. Calculate from rects: `left_inset = child.x - parent.x`, `right_inset = (parent.x + parent.w) - (child.x + child.w)`. Small asymmetries are design decisions, not rounding errors.

### 14. Extracting Font Size But Not Letter-Spacing and Line-Height in Pixels
A heading can have the right `font-size` and still look wrong because `letter-spacing: -2px` was missed (characters too spread out) or `line-height` was approximated as `1.05` instead of the exact `60.95px`. For any text larger than 24px, **always extract letter-spacing and line-height in their computed px values**. The visual difference between `letter-spacing: normal` (-0.28px) and `letter-spacing: -2px` is obvious to any human eye.

### 15. Confusing Time-Based Animation with Scroll-Driven
Your scroll captures show different opacity values at scroll=500 vs scroll=1000 and you conclude "scroll-driven opacity." But your captures had 800ms waits between them. During those waits, a 3-second carousel cycled independently. You captured different frames of a **timer**, not different scroll states. **Always run the Causality Isolation Protocol (Rule 1, Test A) first:** fix scroll position, capture over time. If values change at a fixed scroll position, it's time-driven — full stop.

### 16. Tracking Containers Without Checking Content
You see 5 elements with cycling opacity and think "crossfade animation." But the SVGs inside those elements are **shuffling** — different logos appear in different slots each cycle. If you only extracted computed styles and never checked `innerHTML` or child classNames, you'd replicate a fade animation with static content instead of a rotating carousel. **Always capture content fingerprints (Rule 2)** alongside visual properties.

### 17. Treating `transition: all` as "No Animation"
`transition: all` with `animationName: none` doesn't mean the element is static. It means CSS is ready to smooth **any property change triggered by JavaScript**. This is the standard setup for Webflow IX2, GSAP, Framer Motion, and custom JS animation engines. When you see `transition: all`, treat it as a **positive signal** that JS-driven animation exists and run the full causality test.

### 18. Insufficient Capture Duration for Cycle Detection
You captured 3 data points at 2-second intervals (4 seconds total). The animation cycles every 3 seconds. You barely caught one cycle and the data looked like noise (1 → 0 → 1). If you'd captured for 15 seconds at 500ms intervals, you'd have 30 data points showing 5 clear repeating cycles. **Minimum: 15 seconds at 500ms intervals** for unknown animations. For slow rotators, extend to 30 seconds.

### 19. Skipping DOM Hierarchy — Styling Before Structure
You extract every design token (colors, padding, font sizes, border-radius) perfectly, but the clone still looks wrong because you **didn't replicate the DOM nesting hierarchy first**. The live site wraps content in `.padding-global > .container-large > .padding-section-*` before any section-specific layout. If your clone goes straight from `<section>` to the card/grid, you get wrong max-widths, missing horizontal padding, and broken responsive behavior. **Rule: always match the live site's wrapper/container DOM tree first (padding-global, container-large, padding-section-*), THEN apply design tokens inside that structure.** Tokens on wrong nesting = wrong layout even with correct values.

### 20. Missing Layout Intent From `margin: auto`
When a flex container has `justify-content: flex-start` but a child has `margin-top: auto`, that child is **pinned to the bottom** of the container. This is the "content at top, tagline at bottom" pattern. If you don't extract `margin` values, you'll see the child at the bottom in the screenshot and assume the parent uses `justify-content: space-between` — which breaks the layout when content height changes. Always check for `auto` margins on flex/grid children.

---

## Quick Reference: Extraction Script Checklist

For any new website component:

1. **Identify the component region** (Y range for header, X/Y for sidebar, etc.)
2. **List all possible states** (scroll, hover, click, viewport, animation)
3. **Write extraction capturing ALL states** with computed styles
4. **Use many intermediate positions** (not just start/end)
5. **Test state reversals** (scroll up, unhover, close)
6. **Take screenshots at every state** for visual verification
7. **Analyze the JSON** — find boundaries, calculate math
8. **Compute scroll velocity** for key elements across 3+ scroll depths — flag parallax/sticky/fixed
9. **Detect layer stacks** — group elements by identical rect, classify each layer's role
10. **Measure overlay insets** — exact px from parent edges, not just "absolute bottom"
11. **Run Causality Isolation Protocol** (Rule 1) — for every changing value, run Test A (time) before Test B (scroll) before Test C (intersection)
12. **Run Content Identity Protocol** (Rule 2) — for every carousel/rotator candidate, capture content fingerprints across time intervals
13. **Implement from data** — every value traced to extraction
14. **Compare implementation screenshots against original screenshots**
15. **Iterate** — if something looks off, extract THAT specific property again

---

## File Organization

```
project/
├── deep-audit/
│   ├── extraction.json          # All computed style data
│   ├── state-scroll-0.png       # Screenshot per state
│   ├── state-scroll-200.png
│   ├── state-scroll-500.png
│   ├── state-scroll-up.png
│   ├── state-hover-cta.png
│   └── state-mobile.png
├── extract-component.js          # The Playwright extraction script
└── components/
    └── Header.tsx                # Implementation driven by extraction data
```

Every value in `Header.tsx` should be traceable to a line in `extraction.json`.
If someone asks "why is the blur 5px?", you point to the extraction, not to "it looked right."

---

## The Golden Rule

**Every section must use the page's proportional grid columns (e.g. `435fr 703fr` or `524fr 881fr`), `gap: 11.4286px`, exact extracted `padding`/`font-size`/`line-height`/`letter-spacing`/`color` values from `extraction.json` — never guess with `1fr 1fr`, round numbers, or CSS variables.**
