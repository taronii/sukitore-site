import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { FiChevronRight } from 'react-icons/fi';
import mockData from '../utils/mockData';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';

const HomePage = () => {
  const [newContents, setNewContents] = useState([]);
  const [featuredContents, setFeaturedContents] = useState([]);
  const [popularContents, setPopularContents] = useState([]);
  
  // Firestoreからデータを取得
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const contentsRef = collection(db, 'contents');
        
        // 新着コンテンツの取得（投稿日時順）
        const newQuery = query(
          contentsRef, 
          orderBy('date', 'desc'), 
          limit(4)
        );
        const newSnapshot = await getDocs(newQuery);
        
        if (!newSnapshot.empty) {
          const newData = [];
          newSnapshot.forEach(doc => {
            const data = doc.data();
            newData.push({
              ...data,
              id: doc.id,
              date: data.date ? new Date(data.date.toDate()).toISOString() : new Date().toISOString()
            });
          });
          setNewContents(newData);
        } else {
          setNewContents(mockData.slice(0, 4));
        }
        
        // 注目コンテンツの取得（isFeaturedがtrueのもの）
        const featuredQuery = query(
          contentsRef, 
          where('isFeatured', '==', true), 
          limit(4)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        
        if (!featuredSnapshot.empty) {
          const featuredData = [];
          featuredSnapshot.forEach(doc => {
            const data = doc.data();
            featuredData.push({
              ...data,
              id: doc.id,
              date: data.date ? new Date(data.date.toDate()).toISOString() : new Date().toISOString()
            });
          });
          setFeaturedContents(featuredData);
        } else {
          setFeaturedContents(mockData.filter(item => item.isFeatured).slice(0, 4));
        }
        
        // 人気コンテンツの取得（閲覧数順）
        const popularQuery = query(
          contentsRef, 
          orderBy('viewCount', 'desc'), 
          limit(4)
        );
        const popularSnapshot = await getDocs(popularQuery);
        
        if (!popularSnapshot.empty) {
          const popularData = [];
          popularSnapshot.forEach(doc => {
            const data = doc.data();
            popularData.push({
              ...data,
              id: doc.id,
              date: data.date ? new Date(data.date.toDate()).toISOString() : new Date().toISOString()
            });
          });
          setPopularContents(popularData);
        } else {
          const sortedByViews = [...mockData].sort((a, b) => b.viewCount - a.viewCount);
          setPopularContents(sortedByViews.slice(0, 4));
        }
        
      } catch (error) {
        console.error('コンテンツ取得エラー:', error);
        // エラー時はモックデータを使用
        const sortedByDate = [...mockData].sort((a, b) => new Date(b.date) - new Date(a.date));
        setNewContents(sortedByDate.slice(0, 4));
        setFeaturedContents(mockData.filter(item => item.isFeatured).slice(0, 4));
        const sortedByViews = [...mockData].sort((a, b) => b.viewCount - a.viewCount);
        setPopularContents(sortedByViews.slice(0, 4));
      }
    };
    
    fetchContents();
  }, []);

  return (
    <div className="pb-4">
      {/* 新着コンテンツセクション */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="section-title">新着コンテンツ</h2>
          <Link to="/new" className="text-secondary text-sm flex items-center">
            全て見る <FiChevronRight className="ml-1" />
          </Link>
        </div>
        <div className="content-grid">
          {newContents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>
      
      {/* 注目コンテンツセクション */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="section-title">注目コンテンツ</h2>
          <Link to="/featured" className="text-secondary text-sm flex items-center">
            全て見る <FiChevronRight className="ml-1" />
          </Link>
        </div>
        <div className="content-grid">
          {featuredContents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>
      
      {/* 人気コンテンツセクション */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="section-title">人気コンテンツ</h2>
          <Link to="/popular" className="text-secondary text-sm flex items-center">
            全て見る <FiChevronRight className="ml-1" />
          </Link>
        </div>
        <div className="content-grid">
          {popularContents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
