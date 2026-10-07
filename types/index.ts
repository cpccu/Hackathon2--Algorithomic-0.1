export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  tagline: string;
  status: "Planned" | "In Development" | "Available";
  iconName: string;
}

export interface ProblemItem {
  channel: string;
  shortfall: string;
}
