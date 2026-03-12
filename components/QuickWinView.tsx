
import React, { useState } from 'react';
import { Analysis } from '../types';
import { Card, Button } from './UIComponents';
import { IconBox, IconGlobe, IconBolt } from './Icons';

interface QuickWinViewProps {
  analysis: Analysis | null;
}

const QuickWinView: React.FC<QuickWinViewProps> = ({ analysis }) => {
  const [step, setStep] = useState(1);
  const tool = analysis?.recommendedTool || 'chatgpt';
  const toolInfo: any = {
    copilot: { name: 'Microsoft Copilot', url: 'https://copilot.microsoft.com', icon: <IconBox size={40} /> },
    gemini: { name: 'Google Gemini', url: 'https://gemini.google.com', icon: <IconGlobe size={40} /> },
    chatgpt: { name: 'ChatGPT Plus', url: 'https://chat.openai.com', icon: <IconBolt size={40} /> }
  };
  const currentTool = toolInfo[tool] || toolInfo.chatgpt;
  
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 animate-in slide-in-from-bottom-10 duration-1000">
      <Card className="p-16 relative overflow-hidden border-2 border-gray-100">
        <div className="text-center">
            <div className="text-gray-600 mb-6">{currentTool.icon}</div>
            <h2 className="text-3xl font-black mb-4">Vorgeschlagen: {currentTool.name}</h2>
            <Button onClick={() => setStep(2)}>Starten</Button>
        </div>
      </Card>
    </div>
  );
};

export default QuickWinView;
