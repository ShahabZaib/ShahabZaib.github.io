# AGENTS.md

## Build/Test Commands
Static HTML/CSS/JS portfolio - no build system
- Test: Open `index.html` directly in browser
- Debug: Use browser dev tools
- No package.json, tests, or linting configured

## Code Style Guidelines

### JavaScript
- ES6+ syntax: arrow functions, const/let, template literals
- Wrap in DOMContentLoaded event listener
- Use semantic variable names (isAnimating, targetId)
- GSAP for animations, register ScrollTrigger plugin
- Keep functions modular and focused

### CSS
- CSS custom properties for colors (#1e40af, #3b82f6, #10b981)
- Mobile-first responsive design with @media queries
- BEM-style naming (neural-hub, agent-body, content-panel)
- CSS Grid/Flexbox for layouts
- Smooth transitions with ease functions

### HTML
- Semantic HTML5 elements (header, main, section, article)
- External CDN links with integrity attributes
- Proper ARIA labels and accessibility

### Animation
- GSAP timelines for coordinated sequences
- Use transform/opacity for performance
- Mobile-considerate animation durations