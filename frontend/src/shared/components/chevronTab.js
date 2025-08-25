import { ChevronRight } from "lucide-react";

const ChevronTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center space-x-2">
      {tabs.map((tab, index) => (
        <div key={index} className="flex items-center space-x-2">
          <button
            // onClick={() => setActiveTab(index)}
            className={`text-[24px] font-medium transition-colors duration-200 ${
              activeTab === index
                ? "text-color-8"
                : "text-color-49 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>

          {index < tabs.length - 1 && (
            <div className="flex -space-x-2">
              <ChevronRight
                size={16}
                className="text-color-8"
                style={{ opacity: 0.3 }}
              />
              <ChevronRight
                size={16}
                className="text-color-8"
                style={{ opacity: 0.6 }}
              />
              <ChevronRight
                size={16}
                className="text-color-8"
                style={{ opacity: 0.9 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChevronTabs;
