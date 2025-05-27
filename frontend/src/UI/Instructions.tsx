import React from "react";

export const Instructions: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 rounded-2xl shadow-md max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Game Instructions</h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-800">
        <li>Use the arrow keys or WASD to move your character.</li>
        <li>Click on objects to interact with them.</li>
        <li>Collect coins to increase your score.</li>
        <li>Avoid enemies or obstacles to survive.</li>
        <li>Reach the goal to complete the level.</li>
      </ol>
    </div>
  );
};
