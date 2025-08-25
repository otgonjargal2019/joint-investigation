const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div>
      <div className="flex space-x-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`text-[24px] font-medium border-b-2 transition-colors duration-200 ${
              activeTab === index
                ? "border-color-8 text-color-8"
                : "border-transparent text-color-49 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
