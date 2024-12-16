import { WarningIcon } from '@chakra-ui/icons';
import { Tooltip } from '@chakra-ui/react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: any) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const status = data !== undefined ? data['status'] : undefined;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        {status !== undefined && status != 'Connected (unicast)' && <Tooltip label={`connection status: ${status}`}>
          <WarningIcon
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              color: '#C53030'
            }}
            className="nodrag nopan"
            onClick={() => {
              setEdges((es) => es.filter((e) => e.id !== id));
            }}
          />
        </Tooltip>}
      </EdgeLabelRenderer>
    </>
  );
}
