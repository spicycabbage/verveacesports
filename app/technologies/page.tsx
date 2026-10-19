import type { Metadata } from "next";
import { VoltArticle } from "@/components/volt/VoltArticle";
import { requireVoltSite } from "@/lib/site/require-volt";

export async function generateMetadata(): Promise<Metadata> {
  await requireVoltSite();
  return {
    title: "Technologies",
    description:
      "Volt Caddy LiFePo4 battery system and dual 180W motor control: range, charging, braking, and downhill speed control.",
    alternates: { canonical: "/technologies" },
  };
}

export default async function TechnologiesPage() {
  await requireVoltSite();

  return (
    <VoltArticle title="Technologies">
      <section>
        <h2 className="text-lg font-semibold text-foreground">Battery Technology</h2>
        <div className="mt-2 space-y-3">
          <p>
            Volt Caddy battery system uses a Lithium Iron Phosphate (LiFePo4) pack with an
            integrated battery management system. On the Pro-S it is built for up to 36 holes on
            one charge under normal play, and a full charge takes less than 4 hours.
          </p>
          <img
            src="/volt/tech/battery-pack.jpg"
            alt="Electric remote golf push cart battery"
            className="h-auto w-full rounded-md"
          />
          <p>
            The battery detaches for charging and travel. An external USB Type-C port charges a
            phone during the round. The pack is specified for −20°C to 60°C. Lithium batteries
            include a 2-year warranty. Warranty terms apply.
          </p>
          <img
            src="/volt/tech/battery-detach.jpg"
            alt="Detachable motorized golf cart battery"
            className="h-auto w-full rounded-md"
          />
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">Motor and Control System</h2>
        <p className="mt-2">
          Quiet dual motors, 36V and 360W (2 × 180W), with the onboard control system:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Smart braking</li>
          <li>Downhill speed control</li>
          <li>Smooth start</li>
          <li>Programmed distance, 15 to 30 yards</li>
          <li>Speed modes from 5 to 9 km/h</li>
        </ul>
        <img
          src="/volt/tech/motor-system.webp"
          alt="Dual-motor control system"
          className="mt-4 h-auto w-full rounded-md"
        />
        <img
          src="/volt/tech/motor-detail.jpg"
          alt="Electric golf cart motor"
          className="mt-4 h-auto w-full rounded-md"
        />
      </section>
    </VoltArticle>
  );
}
