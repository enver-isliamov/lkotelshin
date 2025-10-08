# Design Guidelines: Telegram Mini App - Client Portal

## Design Approach
**Design System**: Telegram Mini App Guidelines + Material Design principles for data-dense interfaces
**Rationale**: Utility-focused application requiring efficient data display, consistent patterns, and native Telegram integration. The app prioritizes clarity, quick data access, and administrative control.

## Core Design Principles
1. **Data Clarity First**: Every piece of information should be immediately scannable
2. **Telegram Native Feel**: Interface should feel like a natural extension of Telegram
3. **Mobile-Optimized**: Designed primarily for Telegram mobile experience
4. **Administrative Control**: Clear separation between client and admin interfaces

## Color Palette

### Light Mode
- **Primary**: 47 84% 57% (Telegram Blue)
- **Background**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Text Primary**: 0 0% 13%
- **Text Secondary**: 0 0% 40%
- **Border**: 0 0% 88%
- **Success**: 142 71% 45%
- **Warning**: 38 92% 50%
- **Error**: 0 84% 60%

### Dark Mode (Telegram Dark Theme)
- **Primary**: 47 84% 57%
- **Background**: 220 13% 18%
- **Surface**: 220 13% 22%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 65%
- **Border**: 220 13% 28%
- **Success**: 142 71% 45%
- **Warning**: 38 92% 50%
- **Error**: 0 84% 60%

## Typography
- **Primary Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif (system fonts for native feel)
- **Headings**: 600 weight, sizes: 24px (h1), 20px (h2), 16px (h3)
- **Body**: 400 weight, 15px (Telegram standard)
- **Small/Meta**: 400 weight, 13px
- **Data Labels**: 500 weight, 14px (slightly bolder for scanability)

## Layout System
**Spacing Units**: Consistent use of 4, 8, 12, 16, 24 Tailwind units
- **Section Padding**: p-4 mobile, p-6 desktop
- **Card Padding**: p-4
- **Element Spacing**: gap-4 for lists, gap-2 for tight groups
- **Container**: max-w-2xl for optimal mobile reading

## Component Library

### Client Portal Interface
**Header**: 
- Fixed top navigation with client name and avatar
- Logout button (right-aligned)
- Active order indicator badge

**Dashboard Cards**:
- White/dark surface cards with rounded-lg borders
- Key-value pairs in grid layout (label on left, value on right)
- Conditional field display based on admin settings
- Icons for status indicators (check, clock, alert)

**Order History**:
- Accordion-style collapsed items showing order date + status
- Expand to reveal full order details
- Color-coded status badges (green=completed, blue=active, gray=archived)

**Data Display Patterns**:
- Labels: Text secondary color, 13px, uppercase tracking-wide
- Values: Text primary color, 15px, medium weight
- Dividers: Subtle 1px borders between sections
- Empty states: Centered icon + message for no data

### Admin Settings Interface
**Toggle Controls**:
- Switch components for field visibility
- Grouped by category (Client Info, Order Details, Financial)
- Real-time preview of client view
- Save confirmation toast

**Field Manager**:
- Drag-and-drop reordering (mobile-friendly)
- Checkbox + label for each field
- Visual indicator for required vs optional fields

### Navigation
**Bottom Tab Bar** (Client):
- Dashboard, Orders, Profile (3 tabs max)
- Active tab: Primary color with indicator
- Icons from Heroicons (outline style)

**Admin Panel**:
- Separate admin route with protected access
- Settings gear icon in header to access

## Animations
**Minimal & Purposeful**:
- Card expand/collapse: 200ms ease
- Toggle switches: 150ms ease
- Page transitions: 300ms slide (Telegram-style)
- No decorative animations

## Mobile-First Specifications
- **Touch Targets**: Minimum 44px height for all interactive elements
- **Scroll Behavior**: Smooth scroll, pull-to-refresh enabled
- **Single Column Layout**: Stack all content vertically
- **Bottom Navigation**: Fixed bottom bar for primary actions

## Data Presentation Strategy
**Information Hierarchy**:
1. Critical data first (Client name, Active order status)
2. Order details in expandable sections
3. Historical data in separate tab
4. Financial info (if visible) clearly separated

**Field Visibility Logic**:
- Admin controls master list of visible fields
- Client sees only enabled fields
- Sensitive fields (Debt, Address) off by default
- Status always visible for context

## Images
No hero images needed - this is a data-focused utility app. Icons only:
- **Dashboard**: Use outline icons for data categories (car, calendar, warehouse icons from Heroicons)
- **Empty States**: Simple illustration icons (inbox-empty, document-empty)
- **Profile**: Client initials in colored circle avatar

## Accessibility & Performance
- WCAG AA contrast ratios maintained
- Keyboard navigation support
- Loading skeletons for data fetch
- Offline mode with cached last state
- Error boundaries with retry options

## Technical Considerations
- Telegram WebApp API integration for native features
- Google Sheets real-time sync with loading states
- Local storage for admin settings cache
- Responsive breakpoints: sm:640px, md:768px (though primarily mobile)