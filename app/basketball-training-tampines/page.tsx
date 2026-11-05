import type { Metadata } from "next";
import LocationPage from "../../components/LocationPage";

export const metadata: Metadata = {
  title: "Basketball Training in Tampines | 413OPENCOURT",
  description:
    "FREE 60-minute basketball skills assessment in Tampines, for kids and adults starting from zero. 4.9/5 Google rating. Head Coach Wai, former Division 2 player, 20 years' experience.",
};

export default function Page() {
  return <LocationPage location="Tampines" slug="tampines" />;
}
