# ZUS.pl Design System - Complete UI Analysis

## 1. COLOR PALETTE

### Primary Colors
- **ZUS Green (Primary)**: `#00843D` (used in logo, navigation active states, primary buttons, links)
- **Dark Green**: `#006B32` (darker shade for hover states)
- **Light Green Background**: `#F0F8F4` (subtle backgrounds)

### Secondary Colors
- **Navy Blue**: `#0B4C7C` (primary action buttons like "Zarejestruj w PUE/eZUS")
- **Light Blue**: `#4DA6D9` (secondary elements, info sections)
- **Bright Blue**: `#0088CC` (used in family program banners)
- **Teal**: `#00A99D` (accent color in some elements)

### Utility Colors
- **Orange/Amber**: `#F5A623` (call-to-action buttons like "Zaloguj do PUE/eZUS", "OBLICZ")
- **Red (Error)**: `#D32F2F` or `#C62828` (error states, validation messages)
- **Grey Scale**:
  - `#F5F5F5` (light background)
  - `#E0E0E0` (borders, dividers)
  - `#757575` (secondary text)
  - `#424242` (body text)
  - `#212121` (headings)
  - `#FFFFFF` (white backgrounds)

### Status Colors
- **Success Green**: `#00843D`
- **Error Red**: `#D32F2F`
- **Warning Orange**: `#F5A623`
- **Info Blue**: `#0B4C7C`

## 2. TYPOGRAPHY

### Font Families
- **Primary Font**: Sans-serif system font stack (likely Arial, Helvetica, or similar)
- **Fallback**: System default sans-serif

### Font Sizes
- **H1 (Main Heading)**: ~36-40px / 2.25-2.5rem
- **H2 (Section Heading)**: ~28-32px / 1.75-2rem
- **H3 (Subsection)**: ~24px / 1.5rem
- **H4**: ~20px / 1.25rem
- **Body Text**: 16px / 1rem
- **Small Text**: 14px / 0.875rem
- **Tiny Text**: 12px / 0.75rem
- **Button Text**: 16px / 1rem
- **Navigation**: 16px / 1rem

### Font Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (navigation items)
- **Semi-Bold**: 600 (subheadings)
- **Bold**: 700 (headings, buttons)

### Line Heights
- **Headings**: 1.2-1.3
- **Body Text**: 1.5-1.6
- **Buttons**: 1.2

## 3. SPACING SYSTEM

### Padding/Margin Scale (appears to follow 4px or 8px base unit)
- **XS**: 4px
- **S**: 8px
- **M**: 16px
- **L**: 24px
- **XL**: 32px
- **XXL**: 48px
- **XXXL**: 64px

### Component Spacing
- **Button Padding**: 12-16px vertical, 24-32px horizontal
- **Card Padding**: 24-32px
- **Section Padding**: 48-64px vertical
- **Container Max Width**: ~1200-1400px

## 4. BORDERS

### Border Widths
- **Thin**: 1px (default borders, dividers)
- **Medium**: 2px (focus states, active elements)
- **Thick**: 3-4px (emphasis, green underlines)

### Border Colors
- **Default**: `#E0E0E0`
- **Active/Focus**: `#00843D` (green)
- **Error**: `#D32F2F` (red)
- **Hover**: `#BDBDBD`

### Border Styles
- **Solid**: Primary style for all borders
- **Green Vertical Divider**: 4px solid green (left sidebar separator)
- **Navigation Active State**: 3-4px bottom border in green

## 5. BORDER RADIUS

### Radius Scale
- **None**: 0px (cards, some containers)
- **Small**: 2-3px (inputs, minor elements)
- **Medium**: 4-6px (buttons, dropdowns)
- **Large**: 8px (cards, panels)
- **Circle**: 50% (icon containers, info buttons)

### Component Specific
- **Buttons**: 4-6px
- **Input Fields**: 4px
- **Cards**: 0-8px (varies by component)
- **Info Icons**: 50% (circular)
- **Dropdowns**: 4px

## 6. SHADOWS

### Shadow Levels
- **None**: Most elements have no shadow
- **Subtle**: `0 1px 3px rgba(0,0,0,0.12)` (cards on hover)
- **Medium**: `0 2px 8px rgba(0,0,0,0.15)` (dropdowns, modals)
- **Raised**: `0 4px 12px rgba(0,0,0,0.15)` (floating elements)

### Usage
- Generally minimal shadow usage
- Primarily used for dropdowns and elevated states
- Focus on flat design with borders instead of shadows

## 7. BUTTONS

### Button Variants

#### Primary (Orange/Amber)
- **Background**: `#F5A623`
- **Text Color**: `#FFFFFF`
- **Padding**: 12px 24px
- **Border Radius**: 4-6px
- **Font Weight**: 600-700
- **Hover**: Darker shade `#E89512`

#### Secondary (Navy Blue)
- **Background**: `#0B4C7C`
- **Text Color**: `#FFFFFF`
- **Padding**: 12px 24px
- **Border Radius**: 4-6px
- **Font Weight**: 600-700
- **Hover**: Darker shade `#083A5F`

#### Success (Green)
- **Background**: `#00843D`
- **Text Color**: `#FFFFFF`
- **Padding**: 12px 24px
- **Border Radius**: 4-6px
- **Font Weight**: 600-700
- **Hover**: Darker shade `#006B32`

#### Outline/Ghost
- **Background**: Transparent
- **Border**: 2px solid `#00843D`
- **Text Color**: `#00843D`
- **Padding**: 12px 24px
- **Hover**: Background `#F0F8F4`

#### Icon Buttons
- **Size**: 40-48px square
- **Border Radius**: 50% or 4px
- **Background**: Varies (navy blue for accessibility)
- **Icon Color**: White or green

### Button States
- **Default**: As specified above
- **Hover**: Darker background (-10-15% lightness)
- **Active/Pressed**: Even darker (-20% lightness)
- **Disabled**: Opacity 0.5-0.6, no hover effect
- **Focus**: 2px outline in accent color, offset 2px

## 8. FORM ELEMENTS

### Input Fields
- **Height**: 40-48px
- **Border**: 1px solid `#E0E0E0`
- **Border Radius**: 4px
- **Padding**: 12px 16px
- **Font Size**: 16px
- **Background**: `#FFFFFF`

### Input States
- **Default**: Grey border `#E0E0E0`
- **Focus**: Green border `#00843D`, 2px width
- **Error**: Red border `#D32F2F`, 2px width
- **Disabled**: Grey background `#F5F5F5`, grey text

### Dropdowns (Select)
- **Height**: 40-48px
- **Border**: 1px solid `#E0E0E0`
- **Border Radius**: 4px
- **Padding**: 12px 16px
- **Arrow**: Custom green chevron icon
- **Background**: `#FFFFFF`

### Checkboxes
- **Size**: 20-24px
- **Border**: 2px solid `#E0E0E0`
- **Border Radius**: 3px
- **Checked State**: Green background `#00843D`, white checkmark
- **Focus**: Green outline

### Labels
- **Font Size**: 14-16px
- **Font Weight**: 500-600
- **Color**: `#424242`
- **Margin Bottom**: 8px

### Error Messages
- **Color**: `#D32F2F`
- **Font Size**: 14px
- **Font Weight**: 400
- **Display**: Below input field
- **Padding**: 4px 0

## 9. NAVIGATION

### Top Navigation Bar
- **Height**: ~60-70px
- **Background**: `#FFFFFF`
- **Border Bottom**: 1px solid `#E0E0E0`
- **Link Color**: `#424242`
- **Link Hover**: `#00843D`
- **Active Link**: Green underline 3-4px

### Main Navigation
- **Background**: `#FFFFFF`
- **Link Spacing**: 24-32px horizontal
- **Font Size**: 16px
- **Font Weight**: 500
- **Active State**: Green bottom border 3-4px thick
- **Hover**: Green color `#00843D`

### Sidebar Navigation
- **Background**: `#FFFFFF` or `#F5F5F5`
- **Link Color**: `#00843D` (green)
- **Link Hover**: Darker green
- **Active Link**: Bold weight + darker green
- **Padding**: 12px 16px per item
- **Font Size**: 15-16px

### Breadcrumbs
- **Font Size**: 14px
- **Color**: `#757575`
- **Separator**: ">" or "/"
- **Active/Current**: Bold, darker color

## 10. CARDS

### Standard Card
- **Background**: `#FFFFFF`
- **Border**: 1px solid `#E0E0E0` or none
- **Border Radius**: 0-8px
- **Padding**: 24-32px
- **Shadow**: None or subtle on hover
- **Margin**: 16-24px between cards

### Icon Cards (Services)
- **Background**: `#F5F5F5`
- **Icon Size**: 48-64px
- **Icon Color**: `#00843D`
- **Text Alignment**: Center
- **Padding**: 32px 24px
- **Hover**: Slight background change or shadow

### News/Article Cards
- **Image**: Top aligned
- **Padding**: 20-24px
- **Title Font Size**: 18-20px
- **Title Font Weight**: 600-700
- **Meta Info**: 14px, grey color
- **Border**: 1px solid `#E0E0E0`

## 11. ICONS

### Icon System
- **Style**: Line icons (outlined style)
- **Primary Color**: `#00843D` (green)
- **Secondary Color**: `#0B4C7C` (navy blue)
- **Size Scale**:
  - Small: 16-20px
  - Medium: 24-32px
  - Large: 48-64px

### Icon Containers
- **Circular**: 50% border radius
- **Background**: White or light grey
- **Border**: 2px solid green or blue
- **Padding**: 8-12px
- **Size**: 40-80px depending on use

### Icon Usage
- Navigation icons: 20-24px
- Info buttons: 24px in 40px circle
- Service cards: 48-64px
- Accessibility: 32px in 48px container

## 12. BACKGROUNDS

### Page Backgrounds
- **Primary**: `#FFFFFF`
- **Secondary**: `#F5F5F5`
- **Accent Sections**: `#F0F8F4` (light green tint)

### Section Backgrounds
- **Hero/Featured**: Light blue `#E3F2FD` or image with overlay
- **Alternating Sections**: White and light grey
- **Footer**: Dark green or dark grey

### Overlay/Modal
- **Backdrop**: `rgba(0, 0, 0, 0.5)`
- **Modal Background**: `#FFFFFF`
- **Modal Padding**: 32-48px

## 13. LAYOUT PATTERNS

### Grid System
- **Columns**: 12-column grid
- **Gutter**: 16-24px
- **Container Max Width**: 1200-1400px
- **Container Padding**: 16-24px on mobile, 32-48px on desktop

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Wide Desktop**: > 1440px

### Common Layouts
- **Two Column**: 70/30 split (content/sidebar)
- **Three Column**: Equal or varied widths
- **Card Grid**: 2, 3, or 4 columns depending on screen size
- **Full Width**: Hero sections, banners

## 14. SPECIFIC COMPONENT PATTERNS

### Info Buttons (i icons)
- **Size**: 24-28px icon in 40-44px container
- **Shape**: Circle (50% border radius)
- **Border**: 2px solid `#00843D`
- **Color**: `#00843D`
- **Hover**: Filled green background, white icon

### Language Selector
- **Style**: Dropdown button
- **Background**: Transparent
- **Border**: 1px solid `#E0E0E0`
- **Text**: "PL" with chevron down
- **Size**: Compact, ~80-100px width

### Accessibility Icons
- **Background**: Navy blue `#0B4C7C`
- **Icon Color**: White
- **Size**: 40-48px square or circular
- **Spacing**: 8px between icons

### Search Button
- **Icon**: Magnifying glass
- **Color**: Green `#00843D`
- **Size**: 40-44px
- **Border**: 2px solid green or none
- **Shape**: Circular

### EU Flag
- **Display**: As image
- **Size**: ~40-50px height
- **Positioning**: Top right header area

### Tab Navigation (Horizontal)
- **Background**: Green `#00843D` for active
- **Text Color**: White for active, green for inactive
- **Height**: 48-56px
- **Border Radius**: 0 (sharp corners)
- **Hover**: Lighter green background for inactive

## 15. VALIDATION & FEEDBACK

### Error States
- **Border**: 2px solid `#D32F2F`
- **Background**: Light red tint `#FFEBEE` (optional)
- **Message Color**: `#D32F2F`
- **Icon**: Red exclamation or X

### Success States
- **Border**: 2px solid `#00843D`
- **Message Color**: `#00843D`
- **Icon**: Green checkmark

### Loading States
- **Spinner Color**: `#00843D`
- **Size**: 24-48px
- **Style**: Circular spinner

## 16. DESIGN PRINCIPLES

### Key Characteristics
1. **Flat Design**: Minimal use of shadows and gradients
2. **High Contrast**: Strong color contrasts for accessibility
3. **Clean Typography**: Clear hierarchy with sans-serif fonts
4. **Government/Official Style**: Professional, trustworthy appearance
5. **Accessibility First**: Large touch targets, clear focus states
6. **Green as Brand Color**: Consistent use of green for brand identity
7. **Structured Layouts**: Grid-based, organized information architecture

### Accessibility Features
- High contrast ratios (WCAG AA compliant)
- Large icon buttons for accessibility tools
- Clear focus indicators
- Sufficient spacing between interactive elements
- Error messages with both color and text

## 17. ANIMATION & TRANSITIONS

### Transition Timing
- **Default**: 200-300ms
- **Easing**: ease-in-out or cubic-bezier(0.4, 0, 0.2, 1)

### Common Animations
- **Hover**: Color change, background change (200ms)
- **Focus**: Border color change (150ms)
- **Dropdown**: Slide down (250ms)
- **Modal**: Fade in (300ms)
- **Buttons**: Scale slightly on press (100ms)

### Interaction Feedback
- Color transitions on hover
- Border changes on focus
- Subtle background changes
- No complex or distracting animations

## 18. LOGO & BRANDING

### ZUS Logo
- **Primary Color**: Green `#00843D`
- **Typography**: Bold, custom font for "ZUS"
- **Full Name**: "ZAKŁAD UBEZPIECZEŃ SPOŁECZNYCH" in green
- **Layout**: Logo mark + text lockup
- **Minimum Size**: ~120px width for legibility

### Logo Usage
- Always on white or very light backgrounds
- Maintain clear space around logo
- Never distort or change colors
- Minimum padding: 16px around logo

---

## QUICK REFERENCE COLOR CODES

```css
/* Primary Palette */
--zus-green: #00843D;
--zus-green-dark: #006B32;
--zus-green-light: #F0F8F4;

/* Secondary Colors */
--zus-navy: #0B4C7C;
--zus-blue: #0088CC;
--zus-orange: #F5A623;
--zus-teal: #00A99D;

/* Utility Colors */
--error-red: #D32F2F;
--grey-900: #212121;
--grey-700: #424242;
--grey-500: #757575;
--grey-300: #E0E0E0;
--grey-100: #F5F5F5;
--white: #FFFFFF;

/* Status Colors */
--success: #00843D;
--error: #D32F2F;
--warning: #F5A623;
--info: #0B4C7C;
```

---

This design system provides a comprehensive foundation for building interfaces consistent with the ZUS.pl visual language. Use this reference when implementing new features or components with Claude Code.