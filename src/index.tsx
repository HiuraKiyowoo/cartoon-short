import React from "react";
import { Composition, registerRoot } from "remotion";
import { BeerFlood, FLOOD_FRAMES } from "./videos/beerflood/Bridge";
import { Probe } from "./probe";

const Root: React.FC = () => (
  <>
    <Composition id="BeerFlood" component={BeerFlood} durationInFrames={FLOOD_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Probe" component={Probe} durationInFrames={120} fps={30} width={1080} height={1920} />
  </>
);

registerRoot(Root);
