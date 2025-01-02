import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Frame from "../components/Frame";
import DeviceList from "./devices/DeviceList";
import Settings from "./settings/Settings";

export default function InfoView() {
    return (
        <Frame>
            <Tabs>
                <TabList textColor='gray.900'>
                    <Tab> devices list </Tab>
                    <Tab> settings </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <DeviceList />
                    </TabPanel>
                    <TabPanel>
                        <Settings />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Frame>
    )
}
