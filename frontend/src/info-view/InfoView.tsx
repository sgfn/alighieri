import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Frame from "../components/Frame";
import { Device } from "../types";
import DeviceList from "./devices/DeviceList";
import Settings from "./settings/Settings";

interface InfoViewProps {
    devices: Device[]
}

export default function InfoView({ devices }: InfoViewProps) {
    return (
        <Frame>
            <Tabs>
                <TabList textColor='gray.900'>
                    <Tab> devices list </Tab>
                    <Tab> settings </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <DeviceList devices={devices} />
                    </TabPanel>
                    <TabPanel>
                        <Settings />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Frame>
    )
}
