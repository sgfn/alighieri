import { Device, deviceFromJson, DeviceJson, SimpleSubscriptionJson, Subscription, subscriptionFromJson, SubscriptionJson } from "./types";

const BASE_URL = `http://${window.location.hostname}:4000/`;

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
