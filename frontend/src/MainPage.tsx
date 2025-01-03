import { Button, Grid, GridItem } from "@chakra-ui/react";
import { useRef } from "react";
import InfoView from "./info-view/InfoView";
import RoutingView, { RoutingViewMethods } from "./routing/RoutingView";

export default function MainPage() {
  const ref = useRef<RoutingViewMethods>(null);

  const btnAddDevice = (): void => {
    if (ref.current) {
      ref.current.addDevices([{
        id: 200,
        name: "test",
        channels: {
          receivers: ["CH1"],
          transmitters: ["CH1"],
        },
        ipv4: "0.0.0.0",
        macAddress: "aaaa:bbbb:cccc:dddd:eeee:ffff",
        sampleRate: 1,
        subscriptions: [],
      }]);
    }
  }
  const btnRemoveDevice = (): void => {
    if (ref.current) {
      ref.current.removeDevices(['200']);
    }
  }
  const btnAddSub = (): void => {
    if (ref.current) {
      ref.current.addSubscriptions([{
        status: 'ok',
        transmitter: {
          deviceName: 'MIKROFON',
          channelName: 'CH1',
        },
        receiver: {
          deviceName: 'GLOSNIK1',
          channelName: 'CH1',
        },
      }]);
    }
  }
  const btnRemoveSub = (): void => {
    if (ref.current) {
      ref.current.removeSubscriptions([{
        status: 'ok',
        transmitter: {
          deviceName: 'MIKROFON',
          channelName: 'CH1',
        },
        receiver: {
          deviceName: 'GLOSNIK1',
          channelName: 'CH1',
        },
      }]);
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
        <RoutingView ref={ref} />
      </GridItem>
      <GridItem area="info" mr="4" mb="4">
        <Button onClick={btnAddDevice} > add device </Button>
        <Button onClick={btnRemoveDevice} > remove device </Button>
        <Button onClick={btnAddSub} > add subscription </Button>
        <Button onClick={btnRemoveSub} > remove subscription </Button>
        <InfoView />
      </GridItem>
    </Grid>
  );
}
