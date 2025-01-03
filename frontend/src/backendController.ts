import { ChannelAddress, channelAddressToJson, Device, deviceFromJson, DeviceJson, DhcpSettings, SimpleSubscriptionJson, Subscription, subscriptionFromJson, SubscriptionJson } from "./types";

const hostname = window.location.hostname;
const BASE_URL = `http://${hostname}:4000/`;

export async function createSubscription(subscriptionJson: SimpleSubscriptionJson) {
  console.log('creating subscription', subscriptionJson);
  console.log(JSON.stringify(subscriptionJson));
  try {
    const response = await fetch(BASE_URL + 'subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionJson)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to add subscription", error);
    throw error;
  }
}
export async function deleteSubscription(subscriptionJson: SimpleSubscriptionJson) {
  console.log('deleting subscription', subscriptionJson);
  console.log('json', JSON.stringify({ receiver: subscriptionJson.receiver }));
  try {
    const response = await fetch(BASE_URL + 'subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ receiver: subscriptionJson.receiver })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to add subscription", error);
    throw error;
  }
}
export async function getSubscriptions(): Promise<Subscription[]> {

  try {
    const response = await fetch(BASE_URL + 'subscriptions');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData.subscriptions.map((subscription: SubscriptionJson) => subscriptionFromJson(subscription));
  } catch (error) {
    console.error("failed to fetch subscriptions: ", error);
    return []
  }
}

export async function getDevices(): Promise<Device[]> {
  try {
    const response = await fetch(BASE_URL + 'devices');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData.devices.map((json: DeviceJson) => deviceFromJson(json));
  } catch (error) {
    console.error("failed to fetch devices: ", error);
    return []
  }
}

export async function setDhcpSettings(dhcpSettings: DhcpSettings) {
  console.log('set DHCP settings', dhcpSettings);
  console.log(JSON.stringify(dhcpSettings));
  try {
    const response = await fetch(BASE_URL + 'dhcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dhcpSettings)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to set DHCP settings", error);
    throw error;
  }
}

export async function getConfig() {
  try {
    const response = await fetch(BASE_URL + 'config');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("failed to fetch subscriptions: ", error);
    throw error;
  }
}

export async function sendConfig(config: any) {
  console.log('set config', config);
  console.log(JSON.stringify(config));
  try {
    const response = await fetch(BASE_URL + 'config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to set config", error);
    throw error;
  }
}

export async function identifyChannel(channelAddress: ChannelAddress) {
  console.log(`identify channel ${channelAddress}`);
  try {
    const response = await fetch(BASE_URL + 'identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(channelAddressToJson(channelAddress))
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to identify channel", error);
    throw error;
  }
}
