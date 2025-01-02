import { Button, Grid, GridItem } from "@chakra-ui/react";
import { Ref, RefObject, useRef, useState } from "react";
import InfoView from "./info-view/InfoView";
import RoutingView, { RoutingViewMethods } from "./routing/RoutingView";

export default function MainPage() {
  const ref = useRef<RoutingViewMethods>(null);
  const [cnt, setCnt] = useState<number>(0);

  const btnClick = (): void => {
    setCnt(cnt + 1);
    if (ref.current) {
      ref.current.testFn("abc" + cnt);
    }
  }

  return (
    <Grid
      templateAreas={`"routing info"`}
      gridTemplateColumns={'55% 1fr'}
      height="100%"
      gap="4"
    >
      <GridItem area="routing" ml="4" mb="4">
        <RoutingView baseInfo='test' ref={ref} />
      </GridItem>
      <GridItem area="info" mr="4" mb="4">
        <Button onClick={() => btnClick()} > test button </Button>
        <InfoView />
      </GridItem>
    </Grid>
  );
}
