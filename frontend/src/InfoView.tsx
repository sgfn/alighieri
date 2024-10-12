import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import DHCPSettings from "./DHCPSettings";
import Frame from "./Frame";

export default function InfoView() {
    return (
        <Frame>
            <Tabs>
                <TabList textColor='gray.900'>
                    <Tab> Devices list </Tab>
                    <Tab> DHCP settings </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        some text
                    </TabPanel>
                    <TabPanel>
                        <DHCPSettings />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Frame>
    )
}
