import { Helmet } from '@dr.pogodin/react-helmet';
import MoodRail from '@/components/motion/MoodRail';

export default function LookbookPage() {
  return (
    <>
      <Helmet>
        <title>Lookbook — Bsbasil</title>
        <meta
          name="description"
          content="Rompers, sets, sleepwear, winter wear, and accessories for ages 0–3."
        />
        <link rel="canonical" href="https://bsbasil.com/lookbook" />
      </Helmet>
      <main>
        <MoodRail />
      </main>
    </>
  );
}
