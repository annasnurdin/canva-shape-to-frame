import { Button, Rows, Text } from "@canva/app-ui-kit";
import { addElementAtPoint } from "@canva/design";
import { useFeatureSupport, useSelection } from "@canva/app-hooks";
import { useEffect } from "react";

export const App = () => {
  const isSupported = useFeatureSupport();
  const canAddElement = isSupported(addElementAtPoint);

  const handleAddHeart = async () => {
    if (!canAddElement) return;

    await addElementAtPoint({
      type: "shape",
      paths: [
        {
          d: "M 50,92.5 C 50,92.5 15,62.5 15,32.5 C 15,17.5 27.5,5 42.5,5 C 50,5 50,15 50,15 C 50,15 50,5 57.5,5 C 72.5,5 85,17.5 85,32.5 C 85,62.5 50,92.5 50,92.5 Z",
          fill: {
            color: "#ff4d4d", 
            dropTarget: true, 
          },
        },
      ],
      viewBox: {
        width: 100,
        height: 100,
        left: 0,
        top: 0,
      },
      top: 0,
      left: 0,
      width: 200,
      height: 200,
    });
  };


  return (
    <div style={{ padding: "16px" }}>
      <Rows spacing="2u">
        <Text>
          ADD HEART SHAPE
        </Text>
        <Button
          variant="primary"
          onClick={handleAddHeart}
          disabled={!canAddElement}
          stretch
        >
          Click Me
        </Button>
      </Rows>
    </div>
  );
};