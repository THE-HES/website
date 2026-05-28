// ── H.E.S. Homepage Data ─────────────────────────────────────────
// In production (Sanity), each of these becomes a CMS document type.

const HERO_SLIDES = [
  {
    eyebrow: "YOUR Community Center · Brooklyn, NY",
    headline: ["A century of", "neighbors", "helping neighbors."],
    body: "From early childhood through senior services — H.E.S. has been the heart of Canarsie for over 100 years.",
    primaryCta: { label: "Explore Programs", href: "#programs" },
    secondaryCta: { label: "About H.E.S.", href: "#about" },
    photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC07709-1-scaled.jpg",
    photoCredit: "H.E.S. Community"
  },
  {
    eyebrow: "Registration Open · Limited Spots",
    headline: ["Summer Camp", "2026 is", "now open."],
    body: "June 29 – August 19. Swim, arts, karate, STEM, day & overnight trips. Camp Xtra supports children with disabilities.",
    primaryCta: { label: "Register Now", href: "#camp" },
    secondaryCta: { label: "Camp Activities", href: "#camp-activities" },
    photo: "assets/hero-camp-boat.jpg",
    photoCredit: "H.E.S. Summer Camp"
  },
  {
    eyebrow: "Sunday, June 7, 2026 · Free Admission",
    headline: ["Annual Street Fair.", "Music, food,", "the whole block."],
    body: "DJ, games, food carts, bounce houses, demonstrations & giveaways. Bring the whole family.",
    primaryCta: { label: "Event Details", href: "#fair" },
    secondaryCta: { label: "Become a Sponsor", href: "#sponsor" },
    photo: "assets/hero-street-fair.jpg",
    photoCredit: "H.E.S. Brooklyn"
  },
];

// 8 program tiles — replaces UofL's colored tile band
const PROGRAM_TILES = [
  { label: "Summer Camp",        accent: "#F26522", photo: "https://www.thehes.org/wp-content/uploads/2025/12/IMG_0409-2-scaled.jpg" },
  { label: "Aquatics",            accent: "#3DB8F5", photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC09364-2-scaled.jpg" },
  { label: "Early Childhood",    accent: "#1FB59C", photo: "https://www.thehes.org/wp-content/uploads/2020/08/Fitness-Classes-at-the-H.E.S-1600-%C3%97-600-px-16-626x462.png" },
  { label: "Sports & Fitness",   accent: "#E8363A", photo: "https://www.thehes.org/wp-content/uploads/2019/02/HES-Bball-626x462.jpg" },
  { label: "Disability Services", accent: "#2AAB47", photo: "https://www.thehes.org/wp-content/uploads/2025/08/Untitled-design-8-1.png" },
  { label: "Music School",       accent: "#8E4FB8", photo: "https://www.thehes.org/wp-content/uploads/2023/08/DSC_0349-2-scaled.jpg" },
  { label: "After School",       accent: "#F5C400", photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC04986-1-scaled.jpg" },
  { label: "Social Services",    accent: "#0D1070", photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC07709-1-scaled.jpg" },
];

const STATS = [
  { num: "100+",   label: "Years serving southeast Brooklyn" },
  { num: "5,000+", label: "Community members and families" },
  { num: "20",     label: "Programs across every age group" },
];

const IMPACT_CARDS = [
  { title: "Youth Enrichment",     body: "From pre-K to teen leadership, we cultivate confidence, creativity, and character in every child who walks through our doors.", photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC04986-1-scaled.jpg" },
  { title: "Health & Wellness",    body: "A full aquatics center, fitness floor, and nutrition support — because a strong community starts with healthy neighbors.", photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC09364-2-scaled.jpg" },
  { title: "Care for All Ages",    body: "Food pantry, disability services, senior programs, and the It Takes A Village parent support series — meeting families where they are.", photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC07709-1-scaled.jpg" },
];

const NEWS = [
  { tag: "Featured Story", date: "May 18, 2026", title: "Camp Xtra welcomes record cohort for summer 2026", categories: ["Summer Camp", "Disability Services"], photo: "https://www.thehes.org/wp-content/uploads/2025/08/Untitled-design-8-1.png", featured: true },
  { tag: "Featured Story", date: "May 12, 2026", title: "H.E.S. food pantry expands hours starting June 1", categories: ["Social Services", "Community"], photo: "https://www.thehes.org/wp-content/uploads/2025/08/DSC07709-1-scaled.jpg" },
  { tag: "Featured Story", date: "May 3, 2026",  title: "It Takes A Village: spring session recap and what's next", categories: ["Family Programs", "Events"], photo: "https://www.thehes.org/wp-content/uploads/2025/12/image-2.png" },
];

const EVENTS = [
  { month: "JUN", day: "07", title: "Annual Street Fair 2026",          time: "1:00 P.M.", desc: "Free admission · Seaview Ave" },
  { month: "JUN", day: "29", title: "Summer Camp Opening Day",          time: "8:30 A.M.", desc: "All cohorts · Main H.E.S." },
  { month: "JUL", day: "10", title: "It Takes A Village · Family Tech", time: "6:30 P.M.", desc: "Hybrid · Zoom + Main Hall" },
];

// Mega-menu structure for the top nav
const NAV = [
  { label: "Social Services", items: [
    { col: "Community Support", links: ["Food Pantry", "Senior Adults", "Community Resources"] },
    { col: "Programs & Groups", links: ["Parent Support Groups", "Community Events", "Volunteer"] },
    { col: "About",             links: ["H.E.S. Documentary", "Your H.E.S. Story"] },
  ]},
  { label: "Disability Services", items: [
    { col: "Programs",      links: ["Adults with Disabilities", "Children with Disabilities", "Camp Xtra"] },
    { col: "Aquatics",      links: ["Swim 'N' Skills"] },
    { col: "Registration",  links: ["How to Register Online", "Registration FAQs"] },
  ]},
  { label: "Programs", items: [
    { col: "For Kids & Teens", links: ["Summer Camp", "Early Childhood", "After School", "Camp Xtra", "Youth Sports", "Teen Leadership"] },
    { col: "For Adults",       links: ["Fitness Center", "Aquatics", "Music School", "Yoga & Zumba", "Cardio Kickboxing"] },
    { col: "For Families",     links: ["It Takes A Village", "Family Programs", "Parent Workshops", "Community Calendar"] },
  ]},
  { label: "About", items: [
    { col: "Our Story",   links: ["100 Years of H.E.S.", "Mission & Values", "Leadership", "Board of Directors", "Annual Report"] },
    { col: "Partnerships", links: ["UJA Federation New York", "Community Partners", "Become a Partner"] },
    { col: "Visit",        links: ["Hours & Location", "Tour H.E.S.", "Membership", "Contact Us"] },
  ]},
  { label: "Get Involved", items: [
    { col: "Volunteer",    links: ["Public Health Volunteer", "Camp Counselor Hiring", "Event Volunteers", "Teen Leadership Council"] },
    { col: "Give",         links: ["Make a Donation", "Sponsor a Camper", "Corporate Giving", "Planned Giving"] },
    { col: "Connect",      links: ["Newsletter Signup", "Follow Us", "Community Calendar"] },
  ]},
];

Object.assign(window, { HERO_SLIDES, PROGRAM_TILES, STATS, IMPACT_CARDS, NEWS, EVENTS, NAV });
