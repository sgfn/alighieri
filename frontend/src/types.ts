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

export interface DeviceJson{
    id: number;
    name: string;
    channels: Channels;
    ipv4: string;
    mac_address: string;
    sample_rate: number;
    subscriptions: Subscription[];
}

export function deviceFromJson(deviceJson: DeviceJson) {
    return(
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
