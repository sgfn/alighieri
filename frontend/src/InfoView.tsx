import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
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
                        some text 2
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Frame>
    )
}
