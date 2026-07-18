const PLANS = [
  {
    name: "Starter",
    desc: "For individuals getting started",
    monthly: 0,
    yearly: 0,
    cta: "Get started free",
    featured: false,
    features: ["1 project", "Basic analytics", "Community support", "1 GB storage"],
  },
  {
    name: "Pro",
    desc: "For growing teams that need more",
    monthly: 24,
    yearly: 19,
    cta: "Start free trial",
    featured: true,
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "50 GB storage",
      "Custom integrations",
    ],
  },
  {
    name: "Enterprise",
    desc: "For organizations at scale",
    monthly: 79,
    yearly: 63,
    cta: "Contact sales",
    featured: false,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SSO & audit logs",
      "Unlimited storage",
      "Custom SLA",
    ],
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      "Switching to this tool cut our onboarding time in half. The interface finally feels like it was designed for humans.",
    name: "Sofia Lehmann",
    role: "Product Lead, Nordfeld",
    initials: "SL",
    color: "#4f46e5",
  },
  {
    stars: 5,
    quote:
      "We evaluated four competitors. This was the only one where the whole team actually wanted to log in every day.",
    name: "Rahim Karimi",
    role: "CTO, Bramblewood",
    initials: "RK",
    color: "#0ea5e9",
  },
  {
    stars: 4,
    quote:
      "Support is fast and the Pro plan pricing is honestly a steal for what we get. Minor learning curve at first, worth it.",
    name: "Maya Thornton",
    role: "Freelance Designer",
    initials: "MT",
    color: "#16a34a",
  },
];
