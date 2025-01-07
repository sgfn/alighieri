import { ReactFlowProvider } from "@xyflow/react";
import { Grid, GridItem } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import InfoView from "./info-view/InfoView";
import RoutingView, { RoutingViewMethods } from "./routing/RoutingView";
import { Device, SimpleSubscription, Subscription, subscriptionToSimple } from "./types";
import { getDevices, getSubscriptions } from "./utils/backendController";

export default function MainPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [devicesSet, _setDevicesSet] = useState<Set<number>>(new Set());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsSet, _setSubscriptionsSet] = useState<Set<string>>(new Set()); // I know it's not done properly, comparing strigified objects to check for content equality

  const updateDevices = (updateDevices: Device[]) => {
    const newDevices = updateDevices.filter(device => !devicesSet.has(device.id));
    const updateDevicesSet = new Set(updateDevices.map(device => device.id));
    const oldDevices = devices.filter(device => !updateDevicesSet.has(device.id));
    if (ref.current) {
      if (newDevices.length > 0) {
        ref.current.addDevices(newDevices);
      }
      if (oldDevices.length > 0) {
        ref.current.removeDevices(oldDevices);
      }
    }
    for (let device of newDevices) {
      devicesSet.add(device.id);
    }
    for (let device of oldDevices) {
      devicesSet.delete(device.id);
    }
    //setDevices(updateDevices);
  }

  const updateSubscriptions = (updateSimpleSubscriptions: SimpleSubscription[]) => {
    //console.log('subscriptions set:', subscriptionsSet);
    const newSubscriptions = updateSimpleSubscriptions.filter(subscription => !subscriptionsSet.has(JSON.stringify(subscription)));
    //console.log('new:', newSubscriptions);
    const updateSubscriptionsSet = new Set(updateSimpleSubscriptions.map(subscription => JSON.stringify(subscription)));
    //console.log('udapte set:', updateSubscriptionsSet);
    //console.log('simple:', subscriptions.map(subscription => subscriptionToSimple(subscription)));
    const oldSubscriptions = subscriptions.map(subscription => subscriptionToSimple(subscription)).filter(subscription => !updateSubscriptionsSet.has(JSON.stringify(subscription)));
    //console.log('old:', oldSubscriptions);
    if (ref.current) {
      if (newSubscriptions.length > 0) {
        ref.current.addSubscriptions(newSubscriptions);
      }
      if (oldSubscriptions.length > 0) {
        ref.current.removeSubscriptions(oldSubscriptions);
      }
    }
    for (let subscription of newSubscriptions) {
      subscriptionsSet.add(JSON.stringify(subscription));
    }
    for (let subscription of oldSubscriptions) {
      subscriptionsSet.delete(JSON.stringify(subscription));
    }
    //setSubscriptions(updateSubscriptions);
  }

  const fetchDevices = async () => {
    console.log('fetch devices');
    const fetchedDevices: Device[] = await getDevices();
    console.log('fetched devices:', fetchedDevices);
    console.log('current devices:', devices);
    updateDevices(fetchedDevices);
    setDevices(fetchedDevices);
  };
  useEffect(() => {
    fetchDevices();
  }, []);


  const fetchSubscriptions = async () => {
    console.log('fetch subscriptions');
    const fetchedSubscriptions = await getSubscriptions();
    console.log('fetched subscriptions:', fetchedSubscriptions);
    console.log('current subscriptions:', subscriptions);
    updateSubscriptions(fetchedSubscriptions.map(subscription => subscriptionToSimple(subscription)));
    setSubscriptions(fetchedSubscriptions);
  }
  useEffect(() => {
    fetchSubscriptions();
  }, []);
  const ref = useRef<RoutingViewMethods>(null);

  const fetchAll = async () => {
    await fetchDevices();
    await fetchSubscriptions();
  }

  //const FETCH_INTERVAL = 10_000;
  //
  //useEffect(() => {
  //  const interval = setInterval(async () => {
  //    console.log('fetch devices and subscriptions from backend');
  //    await fetchAll();
  //  }, FETCH_INTERVAL);
  //
  //  return () => clearInterval(interval);
  //}, [])

  const onSubscriptionRemove = (simpleSubscription: SimpleSubscription) => {
    //setSubscriptions(subscriptions.filter(subscription => !compareSimpleToSubscription(simpleSubscription, subscription)))
    //  subscriptionsSet.delete(JSON.stringify(subscription));
  }

  return (
    <Grid
      templateAreas={`"routing info"`}
      gridTemplateColumns={'55% 1fr'}
      height="100%"
      gap="4"
    >
      <GridItem area="routing" ml="4" mb="4">
        <ReactFlowProvider>
          <RoutingView onRefresh={fetchAll} onSubscriptionRemove={onSubscriptionRemove} ref={ref} />
        </ReactFlowProvider>
      </GridItem >
      <GridItem area="info" mr="4" mb="4">
        <InfoView devices={devices} />
      </GridItem>
    </Grid >
  );
}
