# Layout Architecture - Visual Guide

## Before Fix (Unstable)

```
┌─────────────────────────────────────┐
│ <div className="min-h-screen">     │ ← Allows overflow beyond viewport
│                                     │
│  ┌────────────────────────────────┐│
│  │ Header (sticky top-0)          ││ ← Sticky but not height-controlled
│  └────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐│
│  │ Main (flex-1, pb-16 md:pb-0)  ││ ← Conflicting padding
│  │                                ││
│  │  <Outlet /> (no scroll mgmt)  ││ ← No height containment
│  │                                ││
│  └────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐│
│  │ Footer (mt-auto)               ││ ← Pushes down, causes shifts
│  └────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
     ↓ Mobile Nav (fixed bottom-0) ↓   ← Overlaps content
```

**Problems:**
- Content can overflow viewport (min-h-screen allows growth)
- Mobile nav overlaps content (fixed positioning)
- Footer pushes content around (mt-auto)
- No scroll management (pages handle their own padding)

## After Fix (Stable)

### Desktop Layout
```
┌─────────────────────────────────────┐ ← h-screen (100vh exactly)
│ <div className="h-screen            │
│      flex flex-col                  │
│      overflow-hidden">              │
│                                     │
│  ┌────────────────────────────────┐│
│  │ Header (flex-shrink-0)         ││ ← Fixed height, never shrinks
│  └────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐│
│  │ Main (flex-1, overflow-hidden) ││ ← Takes remaining space
│  │  ┌──────────────────────────┐  ││
│  │  │ <div overflow-y-auto>    │  ││ ← Scrollable container
│  │  │                          │  ││
│  │  │   <Outlet />             │  ││ ← Pages render here
│  │  │   (ChatPage, Moments,    │  ││
│  │  │    Analytics, etc.)      │  ││
│  │  │                          │  ││
│  │  │   ↕️ Scrolls here        │  ││
│  │  └──────────────────────────┘  ││
│  └────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐│
│  │ Footer (flex-shrink-0)         ││ ← Fixed height, always visible
│  └────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────────────┐ ← h-screen (100vh exactly)
│ <div className="h-screen            │
│      flex flex-col                  │
│      overflow-hidden">              │
│                                     │
│  ┌────────────────────────────────┐│
│  │ Header (flex-shrink-0)         ││ ← Fixed height
│  └────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐│
│  │ Main (flex-1, overflow-hidden) ││ ← Takes remaining space
│  │  ┌──────────────────────────┐  ││
│  │  │ <div overflow-y-auto>    │  ││ ← Scrollable container
│  │  │                          │  ││
│  │  │   <Outlet />             │  ││
│  │  │                          │  ││
│  │  │   ↕️ Scrolls here        │  ││
│  │  └──────────────────────────┘  ││
│  └────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐│
│  │ Mobile Nav (flex-shrink-0)     ││ ← Part of flex layout, not fixed
│  └────────────────────────────────┘│
└─────────────────────────────────────┘
```

## ChatPage Architecture

### Before Fix
```
<div className="flex-col flex-1">
  <div className="flex-1 flex flex-col min-h-0">  ← Conflicting constraints
    <header>Chat Header</header>
    <div className="flex-1 overflow-y-auto">      ← Height calculation issues
      Messages
    </div>
    <div className="mb-16 md:mb-4">              ← Conflicting margins
      Input Area
    </div>
  </div>
</div>
```

### After Fix
```
<div className="h-full flex flex-col">           ← Uses full available height
  <div className="h-full flex flex-col">         ← Explicit height
    <header className="flex-shrink-0">           ← Fixed height
      Chat Header
    </header>
    <div className="flex-1 overflow-y-auto">     ← Scrollable messages
      Messages
    </div>
    <div className="flex-shrink-0">              ← Fixed at bottom
      Input Area
    </div>
  </div>
</div>
```

## Flexbox Hierarchy

```
Root Container (h-screen, flex-col, overflow-hidden)
├── Header (flex-shrink-0) ← Never compresses
├── Main (flex-1, overflow-hidden) ← Takes remaining space
│   └── Scrollable Wrapper (overflow-y-auto) ← Handles scrolling
│       └── <Outlet /> ← Page content
└── Footer/Mobile Nav (flex-shrink-0) ← Never compresses
```

## Key Principles

1. **Single Scroll Container**: Only the main content area scrolls
2. **Fixed UI Elements**: Header, footer, and mobile nav never scroll
3. **Explicit Heights**: Use `h-screen` and `h-full` instead of `min-h-*`
4. **Flex Shrink Control**: Use `flex-shrink-0` for fixed elements
5. **Overflow Management**: `overflow-hidden` on parent, `overflow-y-auto` on scroll container

## Responsive Breakpoints

- **Mobile**: `< 768px` (md breakpoint)
  - Shows mobile bottom navigation
  - Hides desktop footer
  
- **Desktop**: `≥ 768px` (md breakpoint)
  - Shows desktop footer
  - Hides mobile bottom navigation

## CSS Classes Used

- `h-screen`: 100vh (full viewport height)
- `h-full`: 100% of parent height
- `flex-1`: Grow to fill available space
- `flex-shrink-0`: Never shrink below content size
- `overflow-hidden`: Hide overflow, no scrollbar
- `overflow-y-auto`: Vertical scrollbar when needed

## Testing Scenarios

### Scenario 1: Chat Page
- ✅ Messages scroll independently
- ✅ Input stays at bottom
- ✅ Header stays at top
- ✅ No overlapping with footer/mobile nav

### Scenario 2: Manager Moments
- ✅ Content scrolls smoothly
- ✅ No gaps or overlaps
- ✅ Footer visible on desktop
- ✅ Mobile nav visible on mobile

### Scenario 3: Window Resize
- ✅ Layout adapts smoothly
- ✅ No content jumping
- ✅ Scroll position maintained
- ✅ All elements stay in place

### Scenario 4: Route Changes
- ✅ No layout shifts
- ✅ Consistent spacing
- ✅ Smooth transitions
- ✅ Scroll resets to top
