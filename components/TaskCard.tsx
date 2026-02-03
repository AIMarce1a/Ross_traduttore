
import React from 'react';
import { TaskType } from '../types';

interface TaskCardProps {
  type: TaskType;
  title: string;
  icon: string;
  iconColor: string;
  isSelected: boolean;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, icon, iconColor, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-5 rounded-[28px] cursor-pointer
        transition-all duration-300 min-h-[135px] w-full
        ${isSelected 
          ? 'border border-[#701280] bg-[#f3e8ff] shadow-md scale-[1.02]' 
          : 'bg-white shadow-sm border border-gray-100 hover:shadow-md'
        }
      `}
    >
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300
        ${isSelected ? 'bg-[#701280] text-white shadow-lg' : `bg-white border border-gray-100 ${iconColor} shadow-sm`}
        text-xl
      `}>
        <i className={icon}></i>
      </div>
      <span className={`text-[13px] font-normal text-center leading-tight tracking-[0.01em] px-1 ${isSelected ? 'text-[#701280] font-medium' : 'text-[#707070]'}`}>
        {title}
      </span>
      {isSelected && (
        <div className="absolute top-4 right-4 bg-[#701280] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm border-2 border-white">
          <i className="fa-solid fa-check"></i>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
