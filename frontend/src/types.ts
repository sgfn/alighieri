export interface Device {
    id: number;
    name: string;
    channels: Channels;
    ipv4: string;
    macAddress: string;
    sampleRate: number;
    subscriptions: Subscription[];
}

export interface Channels {
    receivers: string[];
    transmitters: string[];
}

export interface Subscription {
    receiver: ChannelAddress;
    transmitter: ChannelAddress;
    status: string;
}

export interface ChannelAddress {
    deviceName: string;
    channelName: string;
}

export interface ErrorResponse {
    error: string;
}

export interface DeviceJson {
    id: number;
    name: string;
    channels: Channels;
    ipv4: string;
    mac_address: string;
    sample_rate: number;
    subscriptions: Subscription[];
}

export function deviceFromJson(deviceJson: DeviceJson) {
    return (
        {
            id: deviceJson.id,
            name: deviceJson.name,
            channels: deviceJson.channels,
            ipv4: deviceJson.ipv4,
            macAddress: deviceJson.mac_address,
            sampleRate: deviceJson.sample_rate,
            subscriptions: deviceJson.subscriptions
        }
    )
}

export interface SubscriptionJson {
    receiver: ChannelAddressJson,
    transmitter: ChannelAddressJson,
    status: string
}

export interface ChannelAddressJson {
    device_name: string,
    channel_name: string,
}
export function subscriptionFromJson(subscriptionJson: SubscriptionJson): Subscription {
    return (
        {
            receiver: {
                deviceName: subscriptionJson.receiver.device_name,
                channelName: subscriptionJson.receiver.channel_name,
            },
            transmitter: {
                deviceName: subscriptionJson.transmitter.device_name,
                channelName: subscriptionJson.transmitter.channel_name,
            },
            status: subscriptionJson.status
        }
    )
}
export function subscriptionToJson(subscription: Subscription): SubscriptionJson {
    return {
        receiver: {
            device_name: subscription.receiver.deviceName,
            channel_name: subscription.receiver.channelName
        },
        transmitter: {
            device_name: subscription.transmitter.deviceName,
            channel_name: subscription.transmitter.channelName
        },
        status: subscription.status
    };
}
export interface SimpleSubscription {
    receiver: ChannelAddress,
    transmitter: ChannelAddress
}

export interface SimpleSubscriptionJson {
    receiver: ChannelAddressJson,
    transmitter: ChannelAddressJson,
}
export function simpleSubscriptionFromJson(json: SimpleSubscriptionJson): SimpleSubscription {
    return {
        receiver: {
            deviceName: json.receiver.device_name,
            channelName: json.receiver.channel_name,
        },
        transmitter: {
            deviceName: json.transmitter.device_name,
            channelName: json.transmitter.channel_name,
        }
    };
}
export function simpleSubscriptionToJson(simpleSubscription: SimpleSubscription): SimpleSubscriptionJson {
    return {
        receiver: {
            device_name: simpleSubscription.receiver.deviceName,
            channel_name: simpleSubscription.receiver.channelName,
        },
        transmitter: {
            device_name: simpleSubscription.transmitter.deviceName,
            channel_name: simpleSubscription.transmitter.channelName,
        }
    };
}

export interface DhcpSettings {
    netmask: string,
    range_from: string,
    range_to: string
}
