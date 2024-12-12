import { Grid, GridItem } from "@chakra-ui/react";
import InfoView from "./InfoView";
import RoutingView from "./RoutingView";

export default function MainPage() {
  return (
    <Grid
      templateAreas={`"routing info"`}
      gridTemplateColumns={'55% 1fr'}
      height="100%"
      gap="4"
    >
      <GridItem area="routing" ml="4" mb="4">
        <RoutingView />
      </GridItem>
      <GridItem area="info" mr="4" mb="4">
        <InfoView />
      </GridItem>
    </Grid>
  );
}
