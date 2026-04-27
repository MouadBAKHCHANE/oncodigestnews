# Phase 1: Complete State Catalog — OncoDigest

> Every component, every state, every trigger. Extracted from source HTML.

---

## Site Overview

| Page | File | Purpose |
|------|------|---------|
| Homepage | `index.html` | Hero, partners, expertise, advisors, CTA, journal, FAQ |
| About | `a-propos.html` | Founder, expertise cards, editorial process |
| News | `actualites.html` | Featured article, article grid, filters, search |
| Article Detail | `article.html` | Article body, content gate, related articles |
| Scientific Articles | `articles-scientifiques.html` | Featured card, article grid, congress filters |
| Congress | `congres.html` | Featured congress, congress grid |
| Videos | `videos.html` | Video grid, **lives calendar** (replaces live cards), filter pills |
| Login | `connexion.html` | Login form, password reset |
| Register | `inscription.html` | Registration form, benefits |
| Contact | `contact.html` | Contact form, social links |
| Legal | `mentions-legales.html` | Static text |
| Privacy | `politique-de-confidentialite.html` | Static text |

---

## GLOBAL COMPONENTS (shared across ALL pages)

### 1. Page Loader
| State | Trigger | What Changes |
|-------|---------|-------------|
| Visible | Page load (first visit) | opacity: 1, visibility: visible, logo fadeIn animation (0.4s) |
| Hidden | After 800ms or page load | opacity: 0, visibility: hidden (0.6s cubic-bezier) |
| Skipped | Return visit (sessionStorage flag) | Immediately hidden |
| Reduced motion | prefers-reduced-motion | display: none |

### 2. Fixed Navbar
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | Always | position: fixed, white bg, border-bottom 1px, z-index 900, height 52px |
| Desktop (>1024px) | Viewport | All links visible, both buttons visible, hamburger hidden |
| Tablet (768-1024px) | Viewport | Links font-size 11.5px, gap 24px, btn-white hidden |
| Mobile (<768px) | Viewport | Links hidden, hamburger visible, menu toggle-able |
| Menu open (mobile) | Hamburger click | navbar_menu: position fixed, flex-direction column, white bg, shadow, z-index 1000 |

### 3. Navbar Links
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | color: gray-500, font-weight: 400, font-size: 12.5px |
| Hover | Mouse hover | color: gray-900 (0.2s ease) |
| Active | Current page (is-active class) | color: gray-900, font-weight: 500 |
| Dot separator | Adjacent links (::before) | 3px gray dot between links |

### 4. Button Variants
| Variant | Default | Hover | Notes |
|---------|---------|-------|-------|
| btn-white | bg: #fff, color: gray-600 | bg: gray-50 | Hidden on tablet/mobile |
| btn-yellow | bg: canary-300, color: canary-900 | bg: canary-400 | Shrinks on <390px |
| btn-dark | bg: gray-900, color: white | bg: gray-800 | Magnetic effect on desktop |
| btn-husk | bg: #514932, color: #f7f6ef | opacity: 0.9 | Magnetic effect on desktop |
| btn-satin | bg: #3d3229, color: #f9f7f3 | opacity: 0.9 | Magnetic effect on desktop |
| btn-glass | bg: rgba(255,255,255,0.15), blur(4px) | bg: rgba(255,255,255,0.25) | Backdrop filter |
| btn-ghost | bg: transparent, border: white 15% | bg: rgba(255,255,255,0.06) | Border brightens |
| btn-text | bg: transparent, border: #e5e5e5 | bg: gray-50 | — |

### 5. Button Dot Icon Animation
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | SVG paths at rest |
| Hover (path 1) | Button hover | translateY(-1px), 0.4s cubic-bezier |
| Hover (path 3) | Button hover | translateY(1px), 0.4s cubic-bezier |

### 6. Magnetic Buttons (Desktop Only)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | No transform |
| Mouse within 80px | mousemove | translate toward cursor, strength: (1 - dist/80) * 0.15 |
| Mouse leave | mouseleave | Reset transform, 0.4s cubic-bezier |
| Disabled | Touch device or <1024px | No magnetic effect |

### 7. Scroll Animations (animate-on-scroll)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Initial | Off-screen | opacity: 0, translateY(30px) |
| Visible | IntersectionObserver (threshold 0.1) | opacity: 1, translateY(0), 0.6s ease |
| delay-1 | — | transition-delay: 0.1s |
| delay-2 | — | transition-delay: 0.2s |
| delay-3 | — | transition-delay: 0.3s |
| Reduced motion | prefers-reduced-motion | opacity: 1, transform: none, transition: none |

### 8. Word-by-Word Animation
| State | Trigger | What Changes |
|-------|---------|-------------|
| Initial | Off-screen | opacity: 0, translateY(50%), rotateX(-20deg), blur(4px) |
| Visible | IntersectionObserver | opacity: 1, translateY(0), rotateX(0), blur(0) |
| Staggered | Per word index | transition-delay: index * 0.06s |
| Italic variant | Specific words | font-style: italic |
| Reduced motion | prefers-reduced-motion | All disabled |

### 9. Background Color Transition
| State | Trigger | What Changes |
|-------|---------|-------------|
| Initial | scroll = 0 | body bg: #FFFFFF (white) |
| Transitioning | scroll 0-50% | Interpolates RGB to #F7F6EF with smoothstep easing |
| Complete | scroll > 50% | body bg: #F7F6EF (husk-50) |

### 10. Grain/Noise Overlay
| State | Trigger | What Changes |
|-------|---------|-------------|
| Always active | — | position: fixed, opacity: 0.028, SVG noise, mix-blend-mode: multiply, z-index: 9999, pointer-events: none |

### 11. Footer - Newsletter Card (Left)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | bg: #242424, white text, padding: 53.33px 45.71px |
| Email input default | — | transparent bg, border-bottom: 1px gray |
| Email input focus | Focus | border-bottom-color: white (0.2s) |
| Subscribe hover | Hover | opacity: 0.85 |

### 12. Footer - CTA Card (Right)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | bg: #f9f7f3, padding: 53.33px 45.71px |
| CTA button hover | Hover | opacity: 0.85 |
| Desktop | >1024px | padding-right: 304.76px (space for decoration) |
| Mobile | <1024px | padding-right: 45.71px |

### 13. Footer Links Grid
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | >1024px | grid: 524fr 881fr, right sub-grid: repeat(4, 1fr) |
| Tablet | <1024px | grid: 1fr, right: repeat(4, 1fr) |
| Mobile | <768px | right: repeat(2, 1fr) |
| Small | <480px | right: 1fr |
| Link hover | Mouse hover | color: gray-400 -> gray-700 (0.2s) |

### 14. Responsive Breakpoints
| Breakpoint | Key Changes |
|-----------|-------------|
| 1024px | Grid collapses, sticky -> relative, hamburger appears, btn-white hidden |
| 768px | Mobile layout, hamburger menu, section padding 48px, min-height 44px buttons |
| 480px | Smaller fonts, reduced gaps/padding |
| 390px | Button font 11px, smaller padding |
| 360px | Minimum sizes, 12px side padding |

### 15. Accessibility
| Feature | Implementation |
|---------|---------------|
| Reduced motion | All animations disabled via prefers-reduced-motion |
| Touch targets | min-height: 44px on mobile for buttons/inputs |
| iOS zoom prevention | font-size: 16px on mobile inputs |
| Focus states | Keyboard-accessible hover equivalents on journal cards |

---

## PAGE-SPECIFIC COMPONENTS

### Homepage (index.html)

#### Hero Section
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | >1024px | grid: 1fr 520px, full viewport height |
| Tablet | <1024px | grid: 1fr, auto height |
| Mobile | <768px | Single column, overlay hidden, mobile-caption shown |
| Parallax | Scroll (desktop only) | hero_img-inner img translateY at 0.3x scroll speed |
| is-outside | Image scrolls past overlay | Text colors shift to dark, button bg changes |

#### Hero Typewriter
| State | Trigger | What Changes |
|-------|---------|-------------|
| Typing | Time (65ms/char) | Characters appear one by one |
| Paused | After full word typed | Hold 2200ms |
| Deleting | Time (35ms/char) | Characters delete one by one |
| Cursor blink | Always | 0.8s infinite opacity animation |

#### Venetian Reveal (Promesse Section)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | >1024px | Sticky container, 220vh scroll space |
| Progress 0-0.5 | Scroll | Strips slide in from alternating sides (easeOutCubic) |
| Progress 0.35-0.6 | Scroll | Gaps between strips close |
| Progress 0-1 | Scroll | Motion blur 0-3px based on velocity |
| Progress 0.25-0.5 | Scroll | Background heading fades out |
| Progress 0.55+ | Scroll | Panel fades in (opacity, translateX) |
| Mobile | <1024px | Static image, no animation, position relative |

#### Partners / Stats
| State | Trigger | What Changes |
|-------|---------|-------------|
| Logo default | — | opacity: 0.45 |
| Logo hover | Hover | opacity: 0.75 (0.5s ease) |
| Logo carousel | Time (3s cycle) | Logos shuffle with staggered fade (0, 40, 80, 120, 160ms delays) |
| Stat counters | IntersectionObserver | Animate 0 -> target over 2s (ease-out-cubic) |

#### Expertise Accordion
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | Item 0 active |
| Active item | Click header | Number/title opacity 0.9, icon bar-v rotates 90deg |
| Inactive hover | Hover | Number/title opacity 0.6/0.75 |
| Body expand | Active | max-height: 0 -> 400px, opacity: 0 -> 1 (400ms cubic-bezier) |
| Content stagger | Active | Children fade-in at 80ms, 150ms, 220ms delays |
| Image crossfade | Active change | 600ms opacity transition + 4s scale-out |
| Mobile | <1024px | Single column, image relative |

#### Advisors (Stacked Dossiers)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | >1024px | 220vh scroll space, card peel animation |
| Card stack | Scroll progress | Cards peel with easeOutBack, staggered (0.08/0.22/0.36 start) |
| Shadow lift | During peel | Shadow 4-28px, settles at 4-20px |
| Quote reveal | Card 75% placed | opacity 0->1, translateY 6->0 |
| Info reveal | After quote | opacity 0->1, 150ms delay |
| Buttons | Progress > 0.72 | opacity 0->1 |
| Mobile | <1024px | Static 2-column grid, no animation |

#### CTA Section
| State | Trigger | What Changes |
|-------|---------|-------------|
| Background | Always | ::before pseudo animates 18s infinite (translate + scale) |
| Glow pulse | Always | 8s infinite (opacity 0.4->0.7, scale 1->1.1) |
| Signature line | IntersectionObserver | scaleX(0) -> scaleX(1) (1.2s cubic-bezier) |
| Mobile | <768px | Single column, constellation hidden |

#### Journal Cards
| State | Trigger | What Changes |
|-------|---------|-------------|
| Image hover | Hover | scale(1.05) (600ms cubic-bezier) |
| Overlay hidden | Default | translateY(100%) |
| Overlay visible | Hover | translateY(0%) (450ms cubic-bezier) |
| Content stagger | Hover | tag 150ms, title 220ms, desc 290ms, meta 340ms, read 380ms |
| Arrow | Hover | translateX(4px) (300ms ease-out) |
| Touch devices | hover: none | Overlay always visible |
| Mobile | <768px | Overlay always visible |

#### FAQ Accordion
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | All closed |
| Open | Click | max-height 0->300px, opacity 0->1, icon rotate 45deg (350ms) |
| Hover (inactive) | Hover | Number/title opacity increases |
| Watermark number | Item change | Fade + translateY animation (300ms) |
| Mobile | <768px | Watermark hidden |

---

### News Page (actualites.html)

#### Search Input
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | Satin bg, gray border, 14px padding |
| Focus | Focus | border-color: gray-400 (0.2s) |
| Mobile | <768px | min-height: 44px, font-size: 16px |

#### Filter Pills
| State | Trigger | What Changes |
|-------|---------|-------------|
| Active pill | Click | btn-dark class (dark bg) |
| Inactive pill | — | btn-text class (transparent) |
| Inactive hover | Hover | bg: gray-50 |
| Small mobile | <480px | flex-wrap: nowrap, overflow-x: auto, horizontal scroll |

#### Featured Article Card
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | 2-column grid (45%/55%), 1px border |
| Hover | Hover | box-shadow: 0 8px 30px rgba(0,0,0,0.06) |
| Image hover | Hover | scale(1.05) (0.4s ease) |
| Mobile | <1024px | Single column |
| Filtered | Search/filter | display: none via JS |

#### Article Card (Grid)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | White bg, 1px border, 16px radius |
| Hover | Hover | box-shadow: 0 8px 30px rgba(0,0,0,0.06) |
| Image hover | Hover | scale(1.05) (0.4s) |
| Hidden | Filter/search | display: none |
| Load more | Button click | batch-loaded class, reveal animation |
| Lock badge | Locked article | Absolute top-right, dark circle, lock icon |

#### Newsletter CTA Section
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | — | Dark bg, 2-column grid, 80px padding |
| Mobile | <768px | Single column, 40px padding |
| Email focus | Focus | border-bottom white (0.2s) |

---

### Article Detail (article.html)

#### Article Header
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | Breadcrumb, tag, title, author, date, share buttons |
| Scroll animation | IntersectionObserver | Fade in with translateY |
| Share button hover | Hover | bg: gray-50, color: gray-700 |
| Copy link click | Click | aria-label updates, bg changes, reverts after 2s |
| Mobile | <768px | flex-direction: column |

#### Content Gate (Paywall)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Active | Always (for gated content) | Overlay card visible with lock icon |
| Gated body | — | article_body-gated: display: none |
| Visual gradient | — | transparent -> white linear-gradient overlay |

#### Related Articles Grid
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | — | repeat(3, 1fr) |
| Mobile | <768px | 1fr (stacked) |

---

### Scientific Articles (articles-scientifiques.html)

#### Filter Dropdowns
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | White bg, custom arrow SVG, gray text |
| Focus | Focus | border-color: gray-500 (0.2s) |
| Mobile | <480px | flex-direction: column |

#### URL Param Filter
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | No param | All articles shown |
| ?congress=X | URL param | Dropdown value set, filters applied, scroll to grid |

---

### Congress (congres.html)

#### Featured Congress Card
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | 1px border, no shadow |
| Hover | Hover | box-shadow: 0 8px 30px rgba(0,0,0,0.06) |

#### Congress Grid Card
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | 1px border |
| Hover | Hover | box-shadow + translateY(-2px), image scale (0.4s) |

---

### Videos (videos.html)

#### Video Card
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | White bg, 1px border |
| Hover | Hover | box-shadow: 0 8px 30px rgba(0,0,0,0.06) |
| Image hover | Hover | scale(1.05) (0.4s) |
| Hidden | Filter | display: none |

#### Video Play Icon
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | Centered circle, rgba(255,255,255,0.9), 48px |

#### Video Duration Badge
| State | Trigger | What Changes |
|-------|---------|-------------|
| Default | — | Bottom-right, dark bg, white text, 12px |

#### Filter Pills (Videos)
| State | Trigger | What Changes |
|-------|---------|-------------|
| Active | Click | btn-dark (dark bg, shadow) |
| Inactive hover | Hover | bg: rgba(0,0,0,0.04) |

#### Lives Calendar (REPLACES horizontal live cards — client request)
| State | Trigger | What Changes |
|-------|---------|-------------|
| **Calendar Grid** | | |
| Default month | — | Current month displayed, Lu-Di headers, 7-column grid |
| Month navigation | Click < / > | Switches to prev/next month with transition |
| Day default | — | Subtle text, same font system (gray-600) |
| Day with live | Has event | Canary-300 dot indicator below date number |
| Day selected | Click on day with event | bg: canary-300 (or canary-50), text: canary-900 |
| Day today | Current date | Border or ring indicator (1px gray-900) |
| Day hover (with event) | Hover | bg: husk-50, cursor pointer |
| Day hover (no event) | Hover | No change, cursor default |
| Day outside month | Prev/next month overflow | opacity: 0.3 or hidden |
| Mobile | <768px | Grid scales down, smaller font, full-width |
| **Event Detail (below calendar)** | | |
| No selection | Default / no day clicked | Show next upcoming live automatically |
| Selected day | Click day with event | Show event: date, time, title, speaker, CTA button |
| Multiple events | Day has 2+ lives | Stack events vertically |
| Event card | — | Same card style: 1px border gray-100, 16px radius, padding 24px |
| Event card hover | Hover | box-shadow: 0 8px 30px rgba(0,0,0,0.06) |
| CTA button | — | btn-dark or btn-yellow style, same hover states |
| Empty month | No lives this month | "Aucun live prevu ce mois" message |
| Animate in | IntersectionObserver | animate-on-scroll (opacity + translateY) |

---

### Login (connexion.html)

#### Login Form
| State | Trigger | What Changes |
|-------|---------|-------------|
| Input default | — | border: gray-200, bg: satin-linen-50 |
| Input focus | Focus | border-color: gray-500 (0.2s) |
| Checkbox unchecked | — | border: gray-200, bg: white |
| Checkbox checked | Change | bg: gray-900, border: gray-900, SVG opacity 0->1 |
| Error | Validation | .login_error.visible: display block, red text |
| Success | Validation | .login_success.visible: display block, green text |
| State toggle | Click | .login_state.is-hidden: display none (login vs password reset) |

---

### Registration (inscription.html)

#### Registration Form
| State | Trigger | What Changes |
|-------|---------|-------------|
| Desktop | >768px | grid: 45% 55%, gap 64px |
| Mobile | <768px | grid: 1fr |
| Input default | — | border: gray-200, bg: satin-linen-50 |
| Input focus | Focus | border-color: gray-500 |
| Field error | Validation | border-color: #d93025, error text shown |
| Success | Submit | .form_success.visible: display flex |

---

### Contact (contact.html)

#### Contact Form
| State | Trigger | What Changes |
|-------|---------|-------------|
| Input default | — | border: gray-200, bg: satin-linen-50 |
| Input focus | Focus | border-color: gray-400 (0.2s) |
| Submit default | — | bg: gray-900, color: white |
| Submit hover | Hover | bg: gray-800 (0.3s) |
| Success | Submit | .contact_success visible |
| Social link hover | Hover | color: gray-400 -> gray-700 (0.2s) |

---

## STATE TRIGGER SUMMARY

| Trigger Type | Count | Components |
|-------------|-------|-----------|
| **Scroll position** | 5 | Background color, venetian reveal, advisor peel, hero parallax, CTA signature |
| **Scroll direction** | 1 | Hero is-outside toggle |
| **Hover** | 20+ | All buttons, cards, links, images, accordions |
| **Click** | 8 | Hamburger, accordions, FAQ, filters, copy link, load more, checkboxes |
| **Viewport width** | 5 breakpoints | 1024, 768, 480, 390, 360 |
| **Time/Animation** | 5 | Typewriter, logo carousel, CTA glow, CTA background, live pulse |
| **IntersectionObserver** | 3 | animate-on-scroll, word-animate, stat counters |
| **Focus** | 6 | All form inputs, search input |
| **Session state** | 1 | Page loader skip |
| **URL params** | 1 | Congress filter pre-selection |
| **Reduced motion** | Global | All animations disabled |
| **Touch detection** | 2 | Magnetic buttons disabled, journal overlay always visible |

---

## PHASE 1 COMPLETE

Total components identified: **~50 unique components**
Total states cataloged: **~200+ states**
Pages analyzed: **12 HTML files**

Next step: **Phase 2 — Extract computed styles** (requires live browser)
