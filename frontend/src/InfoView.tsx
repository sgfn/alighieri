import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import DeviceList from "./DeviceList";
import Frame from "./Frame";

export default function InfoView() {
    return (
        <Frame>
            <Tabs>
                <TabList textColor='gray.900'>
                    <Tab> Devices list </Tab>
                    <Tab> Settings </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <DeviceList />
                    </TabPanel>
                    <TabPanel>
                        dhcp settings placeholder
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Frame>
    )
}
