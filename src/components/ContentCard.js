import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiPlayCircle, FiFileText } from 'react-icons/fi';

const ContentCard = ({ content }) => {
  const { id, title, thumbnail, type, category, date } = content;
  
  // 日付フォーマット
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };

  return (
    <div className="content-card">
      <Link to={`/content/${id}`} className="block">
        <div className="thumbnail">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-primary bg-opacity-80 text-secondary p-1 rounded-full">
            {type === 'video' ? (
              <FiPlayCircle className="text-xl" />
            ) : (
              <FiFileText className="text-xl" />
            )}
          </div>
        </div>
        <h3 className="content-title">{title}</h3>
        <div className="content-meta flex items-center justify-between">
          <span className="inline-block bg-primary-light px-2 py-1 rounded-full text-xs">
            {category}
          </span>
          <div className="flex items-center">
            <FiClock className="mr-1 text-xs" />
            <span className="text-xs">{formatDate(date)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ContentCard;
