import { ReactFlowProvider } from "@xyflow/react";
import { Grid, GridItem, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import InfoView from "./info-view/InfoView";
import RoutingView, { RoutingViewMethods } from "./routing/RoutingView";
import { Device, SimpleSubscription, Subscription, subscriptionToSimple } from "./types";
import { getDevices, getSubscriptions } from "./utils/backendController";

export default function MainPage() {
  const toast = useToast();
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

  const updateSubscriptions = (simpleSubscriptions: Subscription[]) => {
    //console.log('subscriptions set:', subscriptionsSet);
    const newSubscriptions = simpleSubscriptions.filter(subscription => !subscriptionsSet.has(JSON.stringify(subscriptionToSimple(subscription))));
    //console.log('new:', newSubscriptions);
    const updateSubscriptionsSet = new Set(simpleSubscriptions.map(subscription => JSON.stringify(subscriptionToSimple(subscription))));
    //console.log('udapte set:', updateSubscriptionsSet);
    //console.log('simple:', subscriptions.map(subscription => subscriptionToSimple(subscription)));
    const oldSubscriptions = subscriptions.filter(subscription => !updateSubscriptionsSet.has(JSON.stringify(subscriptionToSimple(subscription))));
    //console.log('old:', oldSubscriptions);
    if (ref.current) {
      ref.current.addSubscriptions(simpleSubscriptions);
      if (newSubscriptions.length > 0) {
        let newSubscriptionsStr = "";
        for (let subscription of newSubscriptions) {
          newSubscriptionsStr = newSubscriptionsStr + `${subscription.transmitter.deviceName}/${subscription.transmitter.channelName} -> ${subscription.receiver.deviceName}/${subscription.receiver.channelName}, `;
        }
        newSubscriptionsStr = newSubscriptionsStr.slice(0, -2);
        toast({
          title: 'found new subscriptions',
          description: newSubscriptionsStr,
          position: 'top',
          status: 'info'
        })
        //ref.current.addSubscriptions(simpleSubscriptions);
      }
      if (oldSubscriptions.length > 0) {
        let oldSubscriptionsStr = "";
        for (let subscription of oldSubscriptions) {
          oldSubscriptionsStr = oldSubscriptionsStr + `${subscription.transmitter.deviceName}/${subscription.transmitter.channelName} -> ${subscription.receiver.deviceName}/${subscription.receiver.channelName}, `;
        }
        oldSubscriptionsStr = oldSubscriptionsStr.slice(0, -2);
        toast({
          title: 'removed subscriptions',
          description: oldSubscriptionsStr,
          position: 'top',
          status: 'info'
        })
        //ref.current.removeSubscriptions(oldSubscriptions);
        //ref.current.addSubscriptions(simpleSubscriptions);
      }
    }
    for (let subscription of newSubscriptions) {
      subscriptionsSet.add(JSON.stringify(subscriptionToSimple(subscription)));
    }
    for (let subscription of oldSubscriptions) {
      subscriptionsSet.delete(JSON.stringify(subscriptionToSimple(subscription)));
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
    updateSubscriptions(fetchedSubscriptions);
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

  const FETCH_INTERVAL = 10_000;

  useEffect(() => {
    const interval = setTimeout(async () => {
      console.log('fetch devices and subscriptions from backend');
      await fetchAll();
    }, FETCH_INTERVAL);

    return () => clearInterval(interval);
  }, [devices, subscriptions, setDevices, setSubscriptions, devicesSet, subscriptionsSet]);

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
