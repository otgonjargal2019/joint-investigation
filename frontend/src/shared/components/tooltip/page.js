import * as Tooltip from "@radix-ui/react-tooltip";

function Toolbar({ children, label }) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          align="center"
          sideOffset={5}
          className="tooltip-content"
        >
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default Toolbar;
