import { Box } from "@chakra-ui/react";
import { Node, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import DeviceNode from "./DeviceNode";

// const nodeTypes = {
//     multiple: MultipleHandleNode
// }

const nodes: Node[] = [{
    id: '1',
    type: 'device',
    data: {
        label: 'node 1',
        inputs: [
            "input1", "input2"
        ],
        outputs: [
            "output1", "output2", "output3"
        ]
    },
    position: {x: 0, y: 0}
},
{
    id: '2',
    type: 'device',
    data: {
        label: 'node 2',
        inputs: [
            "input1", "input2"
        ],
        outputs: [
            "output1", "output2", "output3"
        ]
    },
    position: {x: 20, y: 100}
}];

export default function DanteRouter() {
    const nodeTypes = useMemo(() => ({
        device: DeviceNode }), []);

    return (
        <Box height="500px" width="500px" border="1px solid black">
            <ReactFlow nodes={nodes} nodeTypes={nodeTypes} />
        </Box>
    );
}
