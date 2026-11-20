import React from "react";
import { Composition, registerRoot } from "remotion";
import { BeerFlood, FLOOD_FRAMES } from "./videos/beerflood/Bridge";

const Root: React.FC = () => (
  <Composition id="BeerFlood" component={BeerFlood} durationInFrames={FLOOD_FRAMES} fps={30} width={1080} height={1920} />
);

registerRoot(Root);
