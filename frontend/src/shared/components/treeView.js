import clsx from "clsx";
import React, { useState } from "react";

import PlusSmall from "./icons/plusSmall";
import MinusSmall from "./icons/minusSmall";
import User from "./icons/user3";

const TreeNode = ({ node, onClick }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="mb-1 overflow-hidden">
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="flex items-center gap-2 font-medium cursor-pointer"
      >
        {hasChildren ? (
          <div className="w-[17px] h-[17px] bg-color-12 rounded flex items-center justify-center">
            {expanded ? <MinusSmall /> : <PlusSmall />}
          </div>
        ) : node.type === "employee" ? (
          <div className="min-w-[8.5px] h-[17px]" />
        ) : (
          <div className="min-w-[17px] h-[17px]" />
        )}
        <div
          className={clsx(
            "flex items-center gap-1",
            node.type === "employee"
              ? "text-[18px] text-color-10 font-[350] flex-1"
              : "text-[16px] text-color-3 font-medium flex-1"
          )}
          onClick={() =>
            !hasChildren && node.type === "employee" && onClick(node)
          }
        >
          {node.type === "employee" && <User />}
          <div className={`whitespace-nowrap ${node.type === "employee" ? 'max-w-[144px] flex-1' : 'max-w-[180px] flex-1'} overflow-hidden text-ellipsis hover:bg-color-76`}>{node.label}</div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="ml-6 mt-1 space-y-1">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ data, onClick }) => {
  return (
    <div className="pt-8">
      {data.map((node, index) => (
        <TreeNode key={index} node={node} onClick={onClick} />
      ))}
    </div>
  );
};

export default TreeView;
