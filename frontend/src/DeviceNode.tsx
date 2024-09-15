import { Handle, Position } from '@xyflow/react';

interface DeviceNodeProps {
    label: string,
    inputs: string[],
    outputs: string[]
}

export default function DeviceNode ( { data }: any ) {
  return (
    <>
      <div style={{ padding: '10px 20px', border: '1px solid red'}}>
        {data.label}<br/>
        {data.inputs}
        {data.outputs}
      </div>

      <Handle type="target" position={Position.Right}
        style={{ top: '20%', background: '#555' }} />
      <Handle type="source" position={Position.Right}
        style={{ top: '40%', background: '#555' }} />
      <Handle type="source" position={Position.Right}
        style={{ top: '60%', background: '#555' }} />
      <Handle type="source" position={Position.Right}
        style={{ top: '80%', background: '#555' }} />
      <Handle type="source" position={Position.Right}
        style={{ top: '100%', background: '#555' }} />
    </>
  );
};
