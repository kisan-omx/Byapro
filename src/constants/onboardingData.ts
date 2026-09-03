// Slide content definitions
export interface SlideDataItem {
  id: string;
  title: string;
}

// Onboarding runtime constants
export const OnboardingConstants = {
  AUTO_SLIDE_INTERVAL_MS: 3500,
  LARGE_SCREEN_BREAKPOINT: 768,
} as const;

export const SLIDES_DATA: SlideDataItem[] = [
  {
    id: "slide1",
    title: "Create Unlimited Invoices And Share Digitally",
  },
  {
    id: "slide2",
    title: "Manage All Your Items At One Place",
  },
  {
    id: "slide4",
    title: "Send Reminders And Get Paid Faster",
  },
];
