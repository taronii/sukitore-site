import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiList, FiPlus, FiLogOut, FiUpload, FiImage, FiYoutube, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import mockData from '../utils/mockData';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../assets/css/editor.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'list'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ダイエット');
  const [contentType, setContentType] = useState('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [contentsList, setContentsList] = useState([]);
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const fileInputRef = useRef(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [viewCount, setViewCount] = useState(0); // 閲覧数（デモ用）
  
  // 編集モード関連の状態
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContentId, setEditingContentId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  
  // カテゴリー一覧
  const categories = [
    'ダイエット',
    '運動',
    '食事',
    'メンタル',
    'ビューティー',
    'ライフスタイル'
  ];
  
  // 既存コンテンツを取得
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const contentsRef = collection(db, 'contents');
        const q = query(contentsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log('コンテンツが見つかりません。初期データを使用します。');
          
          // Firestoreにデータがない場合は、モックデータをFirestoreに保存
          const promises = mockData.map(async (item) => {
            return addDoc(collection(db, 'contents'), {
              ...item,
              date: serverTimestamp()
            });
          });
          
          await Promise.all(promises);
          setContentsList(mockData);
        } else {
          // Firestoreからのデータをマッピング
          const contents = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            contents.push({
              ...data,
              id: doc.id,
              date: data.date ? new Date(data.date.toDate()).toISOString() : new Date().toISOString()
            });
          });
          
          setContentsList(contents);
        }
      } catch (error) {
        console.error('コンテンツ取得エラー:', error);
        setContentsList(mockData); // エラー時はモックデータを使用
      }
    };
    
    fetchContents();
  }, []);

  
  // フォームリセット
  const resetForm = () => {
    setTitle('');
    setCategory('ダイエット');
    setContentType('video');
    setVideoUrl('');
    setContent('');
    setThumbnail('');
    setThumbnailFile(null);
    setThumbnailPreview('');
    setIsFeatured(false);
    setViewCount(0);
  };
  
  // サムネイル画像ファイルのハンドリング
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setThumbnailFile(file);
    
    // プレビュー表示用のURL生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // ファイル選択ダイアログを開く
  const openFileSelector = () => {
    fileInputRef.current.click();
  };
  
  // YouTube URLからビデオIDを抽出する関数
  const extractYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // YouTube URLを埋め込み用URLに変換する関数
  const convertToEmbedUrl = (url) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      // セキュリティ強化パラメータを追加
      return `https://www.youtube.com/embed/${videoId}?origin=https://www.youtube.com&enablejsapi=0&widgetid=1&rel=0`;
    }
    return url; // 変換できない場合は元のURLを返す
  };

  // YouTube動画のサムネイル画像URLを生成する関数
  const getYouTubeThumbnailUrl = (url) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  // YouTube URLの検証
  const validateYouTubeUrl = (url) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId !== null;
  };

  // YouTube URLからサムネイルを設定
  const setThumbnailFromYouTube = (url) => {
    if (validateYouTubeUrl(url)) {
      const thumbnailUrl = getYouTubeThumbnailUrl(url);
      if (thumbnailUrl) {
        setThumbnail(thumbnailUrl);
        setThumbnailPreview(thumbnailUrl);
      }
    }
  };
  
  // エディターでのテキスト書式設定関数
  const formatText = (format) => {
    // 現在のカーソル位置や選択範囲を考慮しないシンプルな実装
    switch (format) {
      case 'h1':
        setContent(content + '\n<h1>見出しレベル1</h1>');
        break;
      case 'h2':
        setContent(content + '\n<h2>見出しレベル2</h2>');
        break;
      case 'h3':
        setContent(content + '\n<h3>見出しレベル3</h3>');
        break;
      case 'bold':
        setContent(content + '<strong>太字テキスト</strong>');
        break;
      case 'italic':
        setContent(content + '<em>斜体テキスト</em>');
        break;
      case 'ul':
        setContent(content + '\n<ul>\n  <li>箇条書き項目1</li>\n  <li>箇条書き項目2</li>\n</ul>');
        break;
      case 'ol':
        setContent(content + '\n<ol>\n  <li>番号付き項目1</li>\n  <li>番号付き項目2</li>\n</ol>');
        break;
      default:
        break;
    }
  };
  
  // 要素の挿入関数
  const insertElement = (element) => {
    switch (element) {
      case 'img':
        const imgUrl = prompt('画像のURLを入力してください:');
        if (imgUrl) {
          setContent(content + `\n<img src="${imgUrl}" alt="画像説明" class="my-4 rounded-lg max-w-full mx-auto" />`);
        }
        break;
      case 'a':
        const linkUrl = prompt('リンク先URLを入力してください:');
        const linkText = prompt('リンクのテキストを入力してください:');
        if (linkUrl && linkText) {
          setContent(content + `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
        }
        break;
      default:
        break;
    }
  };

  // サムネイル画像をStorageにアップロードする関数
  const uploadThumbnail = async (file, contentId) => {
    if (!file) return null;
    
    try {
      const storageRef = ref(storage, `thumbnails/${contentId}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('サムネイルアップロードエラー:', error);
      return null;
    }
  };

  // 新規投稿の送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力検証
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    if (contentType === 'video' && !videoUrl.trim()) {
      alert('動画URLを入力してください');
      return;
    }
    
    // YouTube URLの検証（動画コンテンツの場合）
    if (contentType === 'video' && !validateYouTubeUrl(videoUrl)) {
      alert('有効なYouTube URLを入力してください');
      return;
    }
    
    if (contentType === 'article' && !content.trim()) {
      alert('記事内容を入力してください');
      return;
    }
    
    try {
      // サムネイルの準備
      let thumbnailUrl = thumbnail;
      
      // YouTube動画からのサムネイルを取得
      if (contentType === 'video' && validateYouTubeUrl(videoUrl)) {
        const youtubeThumb = getYouTubeThumbnailUrl(videoUrl);
        if (youtubeThumb && !thumbnailFile) {
          thumbnailUrl = youtubeThumb;
        }
      }
      
      // ランダム画像をフォールバックとして使用
      if (!thumbnailUrl && !thumbnailFile) {
        thumbnailUrl = `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`;
      }
      
      // サムネイルの処理
      let finalThumbnailUrl = thumbnailUrl;
      
      // Base64データの場合は先にStorageにアップロード
      if (thumbnailPreview && thumbnailPreview.startsWith('data:')) {
        try {
          // Base64文字列からBlobを作成
          const response = await fetch(thumbnailPreview);
          const blob = await response.blob();
          
          // 一意なファイル名を生成
          const fileName = `thumbnail_${Date.now()}.jpg`;
          const storageRef = ref(storage, `thumbnails/${fileName}`);
          
          // Storageにアップロード
          await uploadBytes(storageRef, blob);
          finalThumbnailUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Base64サムネイルのアップロードエラー:', error);
          // エラー時は元のURLを使用
        }
      }
      
      // Firestoreにドキュメントを作成 (サムネイルはURLのみ保存)
      const docRef = await addDoc(collection(db, 'contents'), {
        title,
        category,
        type: contentType,
        date: serverTimestamp(),
        thumbnail: finalThumbnailUrl, // URLのみ保存
        videoUrl: contentType === 'video' ? convertToEmbedUrl(videoUrl) : '',
        originalVideoUrl: contentType === 'video' ? videoUrl : '',
        content: contentType === 'article' ? content : '',
        viewCount: viewCount,
        isFeatured,
        createdAt: serverTimestamp()
      });
      
      // ファイルアップロードの場合
      if (thumbnailFile) {
        const uploadedUrl = await uploadThumbnail(thumbnailFile, docRef.id);
        if (uploadedUrl) {
          // ドキュメントを更新
          await updateDoc(doc(db, 'contents', docRef.id), {
            thumbnail: uploadedUrl
          });
          finalThumbnailUrl = uploadedUrl;
        }
      }
      
      // UIを更新
      const newContent = {
        id: docRef.id,
        title,
        category,
        type: contentType,
        date: new Date().toISOString(),
        thumbnail: thumbnailUrl,
        videoUrl: contentType === 'video' ? convertToEmbedUrl(videoUrl) : '',
        originalVideoUrl: contentType === 'video' ? videoUrl : '',
        content: contentType === 'article' ? content : '',
        viewCount,
        isFeatured
      };
      
      setContentsList([newContent, ...contentsList]);
      alert('コンテンツを投稿しました');
      resetForm();
    } catch (error) {
      console.error('コンテンツ投稿エラー:', error);
      alert(`コンテンツ投稿中にエラーが発生しました: ${error.message}`);
    }
  };
  
  // 編集モードを開始
  const startEdit = (content) => {
    setIsEditMode(true);
    setEditingContentId(content.id);
    setActiveTab('new');
    
    // フォームにデータを設定
    setTitle(content.title);
    setCategory(content.category);
    setContentType(content.type);
    setIsFeatured(content.isFeatured);
    setViewCount(content.viewCount);
    
    if (content.type === 'video') {
      // 動画の場合は元のURLを設定（あれば）
      setVideoUrl(content.originalVideoUrl || content.videoUrl);
    } else {
      // 記事の場合
      setContent(content.content);
    }
    
    // サムネイル設定
    setThumbnail(content.thumbnail);
    setThumbnailPreview(content.thumbnail);
  };
  
  // 編集モードをキャンセル
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingContentId(null);
    resetForm();
  };
  
  // 編集内容を更新
  const updateContent = async () => {
    // 入力検証
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    if (contentType === 'video' && !videoUrl.trim()) {
      alert('動画URLを入力してください');
      return;
    }
    
    if (contentType === 'article' && !content.trim()) {
      alert('記事内容を入力してください');
      return;
    }
    
    try {
      // サムネイルの処理
      let finalThumbnailUrl = thumbnail;
      
      // サムネイルプレビューがBase64データの場合、先にStorageにアップロード
      if (thumbnailPreview && thumbnailPreview.startsWith('data:')) {
        try {
          // Base64文字列からBlobを作成
          const response = await fetch(thumbnailPreview);
          const blob = await response.blob();
          
          // 一意なファイル名を生成
          const fileName = `thumbnail_${editingContentId}_${Date.now()}.jpg`;
          const storageRef = ref(storage, `thumbnails/${fileName}`);
          
          // Storageにアップロード
          await uploadBytes(storageRef, blob);
          finalThumbnailUrl = await getDownloadURL(storageRef);
          console.log('Base64サムネイルをStorageにアップロードしました:', finalThumbnailUrl);
        } catch (error) {
          console.error('Base64サムネイルのアップロードエラー:', error);
          // エラー時は既存のURLを使用
        }
      } else if (thumbnailPreview && thumbnailPreview !== thumbnail) {
        // URLの場合はそのまま使用
        finalThumbnailUrl = thumbnailPreview;
      }
      
      // サムネイル画像がファイルとしてアップロードされた場合
      if (thumbnailFile) {
        const uploadedUrl = await uploadThumbnail(thumbnailFile, editingContentId);
        if (uploadedUrl) {
          finalThumbnailUrl = uploadedUrl;
        }
      }
      
      // Firestoreドキュメントの更新
      const contentRef = doc(db, 'contents', editingContentId);
      await updateDoc(contentRef, {
        title,
        category,
        type: contentType,
        // 日付は更新しない
        thumbnail: finalThumbnailUrl, // URLのみを保存
        videoUrl: contentType === 'video' ? convertToEmbedUrl(videoUrl) : '',
        originalVideoUrl: contentType === 'video' ? videoUrl : '',
        content: contentType === 'article' ? content : '',
        viewCount,
        isFeatured,
        updatedAt: serverTimestamp()
      });
      console.log('コンテンツを更新しました。サムネイルURL:', finalThumbnailUrl);
      
      // UI上のデータ更新
      const updatedContent = {
        id: editingContentId,
        title,
        category,
        type: contentType,
        date: new Date().toISOString(),
        thumbnail: finalThumbnailUrl, // StorageにアップロードしたURLを使用
        videoUrl: contentType === 'video' ? convertToEmbedUrl(videoUrl) : '',
        originalVideoUrl: contentType === 'video' ? videoUrl : '',
        content: contentType === 'article' ? content : '',
        viewCount,
        isFeatured
      };
      
      const updatedList = contentsList.map(item => 
        item.id === editingContentId ? updatedContent : item
      );
      
      setContentsList(updatedList);
      alert('コンテンツを更新しました');
      
      // 編集モードを終了
      setIsEditMode(false);
      setEditingContentId(null);
      resetForm();
      setActiveTab('list'); // 一覧タブに戻る
    } catch (error) {
      console.error('コンテンツ更新エラー:', error);
      alert(`コンテンツ更新中にエラーが発生しました: ${error.message}`);
    }
  };
  
  // 削除確認ダイアログを表示
  const confirmDelete = (content) => {
    setContentToDelete(content);
    setShowDeleteConfirm(true);
  };
  
  // コンテンツを削除
  const deleteContent = async () => {
    if (!contentToDelete) return;
    
    try {
      // Firestoreから削除
      await deleteDoc(doc(db, 'contents', contentToDelete.id));
      
      // UI上のデータ更新
      const updatedList = contentsList.filter(item => item.id !== contentToDelete.id);
      setContentsList(updatedList);
      
      // ダイアログを閉じる
      setShowDeleteConfirm(false);
      setContentToDelete(null);
      
      alert('コンテンツを削除しました');
    } catch (error) {
      console.error('コンテンツ削除エラー:', error);
      alert(`コンテンツ削除中にエラーが発生しました: ${error.message}`);
    }
  };
  
  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate('/password');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="bg-primary shadow-md py-4 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-secondary">管理者ページ</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center text-textLight hover:text-secondary"
          >
            <FiLogOut className="mr-1" />
            ログアウト
          </button>
        </div>
      </header>
      
      {/* タブ切り替え */}
      <div className="flex border-b border-primary-light">
        <button
          className={`py-3 px-6 flex items-center ${
            activeTab === 'new' ? 'border-b-2 border-secondary text-secondary' : 'text-textDark'
          }`}
          onClick={() => setActiveTab('new')}
        >
          <FiPlus className="mr-2" />
          新規投稿
        </button>
        <button
          className={`py-3 px-6 flex items-center ${
            activeTab === 'list' ? 'border-b-2 border-secondary text-secondary' : 'text-textDark'
          }`}
          onClick={() => setActiveTab('list')}
        >
          <FiList className="mr-2" />
          コンテンツ一覧
        </button>
      </div>
      
      {/* タブコンテンツ */}
      <div className="p-6">
        {activeTab === 'new' ? (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-textLight mb-6">新規コンテンツ投稿</h2>
            
            <form onSubmit={isEditMode ? (e) => { e.preventDefault(); updateContent(); } : handleSubmit} className="space-y-6">
              {/* タイトル */}
              <div>
                <label htmlFor="title" className="block text-textLight mb-2">タイトル *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                  placeholder="コンテンツのタイトルを入力"
                  required
                />
              </div>
              
              {/* カテゴリー */}
              <div>
                <label htmlFor="category" className="block text-textLight mb-2">カテゴリー *</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {/* コンテンツタイプ */}
              <div>
                <label className="block text-textLight mb-2">コンテンツタイプ *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="video"
                      checked={contentType === 'video'}
                      onChange={() => setContentType('video')}
                      className="mr-2"
                    />
                    <span className="text-textLight">動画</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="article"
                      checked={contentType === 'article'}
                      onChange={() => setContentType('article')}
                      className="mr-2"
                    />
                    <span className="text-textLight">記事</span>
                  </label>
                </div>
              </div>
              
              {/* サムネイル画像アップロード */}
              <div>
                <label className="block text-textLight mb-2">サムネイル画像</label>
                <div className="space-y-4">
                  {/* アップロードボタン */}
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={openFileSelector}
                      className="flex items-center px-4 py-2 bg-secondary text-primary-dark rounded-lg hover:bg-secondary-light transition-colors"
                    >
                      <FiUpload className="mr-2" />
                      画像を選択
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    {thumbnailFile && (
                      <span className="text-textDark">{thumbnailFile.name}</span>
                    )}
                  </div>
                  
                  {/* 画像プレビュー */}
                  {thumbnailPreview ? (
                    <div className="relative w-full max-w-md">
                      <img 
                        src={thumbnailPreview} 
                        alt="サムネイルプレビュー" 
                        className="w-full h-auto rounded-lg border border-primary-light" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-800 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full max-w-md h-40 bg-primary-light rounded-lg border border-primary-light border-dashed">
                      <FiImage className="text-4xl text-textDark mb-2" />
                      <p className="text-textDark text-sm">画像をアップロードするか、URLを指定してください</p>
                    </div>
                  )}
                  
                  {/* URL入力（代替手段として残す） */}
                  <div>
                    <label htmlFor="thumbnail" className="block text-textLight text-sm mb-1">または画像URLを入力</label>
                    <input
                      type="text"
                      id="thumbnail"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                      placeholder="画像のURLを入力（空白の場合はランダム画像が使用されます）"
                    />
                  </div>
                </div>
              </div>
              
              {/* 動画URL（動画タイプの場合） */}
              {contentType === 'video' && (
                <div>
                  <label htmlFor="videoUrl" className="block text-textLight mb-2">YouTube動画URL *</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        // URLが変更されたらサムネイルをチェック
                        if (validateYouTubeUrl(e.target.value)) {
                          setThumbnailFromYouTube(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                      placeholder="YouTube動画URLを入力"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (validateYouTubeUrl(videoUrl)) {
                          setThumbnailFromYouTube(videoUrl);
                          alert('YouTubeのサムネイルを自動設定しました');
                        } else {
                          alert('有効なYouTube URLを入力してください');
                        }
                      }}
                      className="ml-2 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary-light flex items-center"
                    >
                      <FiYoutube className="mr-1" /> サムネイル取得
                    </button>
                  </div>
                  <p className="text-xs text-textDark mt-1">YouTube動画URLを入力すると、サムネイルが自動的に設定されます</p>
                </div>
              )}
              
              {/* 記事内容（記事タイプの場合） - シンプルなリッチエディタ */}
              {contentType === 'article' && (
                <div>
                  <label htmlFor="content" className="block text-textLight mb-2">記事内容 *</label>
                  <div className="editor-toolbar bg-white text-primary rounded-t-lg border border-primary p-2 flex flex-wrap gap-2">
                    <button type="button" className="editor-btn" onClick={() => formatText('h1')}>見出し1</button>
                    <button type="button" className="editor-btn" onClick={() => formatText('h2')}>見出し2</button>
                    <button type="button" className="editor-btn" onClick={() => formatText('h3')}>見出し3</button>
                    <button type="button" className="editor-btn" onClick={() => formatText('bold')}>B</button>
                    <button type="button" className="editor-btn" onClick={() => formatText('italic')}>I</button>
                    <button type="button" className="editor-btn" onClick={() => formatText('ul')}>箇条書き</button>
                    <button type="button" className="editor-btn" onClick={() => formatText('ol')}>番号付き</button>
                    <button type="button" className="editor-btn" onClick={() => insertElement('img')}>画像</button>
                    <button type="button" className="editor-btn" onClick={() => insertElement('a')}>リンク</button>
                  </div>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2 rounded-b-lg bg-white border border-primary text-primary focus:outline-none focus:border-secondary h-64"
                    placeholder="記事の内容を入力してください（HTMLタグを使用できます）"
                    required={contentType === 'article'}
                  ></textarea>
                  <div className="mt-3 bg-primary-light p-3 rounded-lg">
                    <h4 className="font-bold text-sm text-secondary mb-2">プレビュー</h4>
                    <div className="bg-white p-3 rounded border border-gray-300 overflow-auto max-h-64">
                      <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  </div>
                  <p className="text-xs text-textDark mt-3">
                    上のツールバーボタンを使って見出しやリスト、画像を挿入できます。また、HTMLタグを直接使用することもできます。
                  </p>
                </div>
              )}
              
              {/* コンテンツの分類 */}
              <div className="space-y-5">
                <div>
                  <label className="block text-textLight mb-2">コンテンツの分類</label>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="isFeatured" className="text-textLight">注目コンテンツ</label>
                  </div>
                  <p className="text-textDark text-sm italic">※ 管理者が特に注目してほしいコンテンツをマークします</p>
                </div>
                
                <div className="bg-primary-light p-4 rounded-md">
                  <h4 className="text-secondary font-medium mb-2">自動判定されるコンテンツ分類</h4>
                  <ul className="text-textDark text-sm space-y-2">
                    <li><span className="text-blue-300 font-medium">新着コンテンツ</span>: 投稿日時が新しい順に自動で表示されます</li>
                    <li><span className="text-red-300 font-medium">人気コンテンツ</span>: ユーザーの閲覧数が多い順に自動で表示されます</li>
                  </ul>
                </div>
                
                {/* 閲覧数（デモのみ） */}
                <div>
                  <label htmlFor="viewCount" className="block text-textLight mb-2">閲覧数（デモ用）</label>
                  <input
                    type="number"
                    id="viewCount"
                    value={viewCount}
                    onChange={(e) => setViewCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                    min="0"
                  />
                  <p className="text-textDark text-sm italic mt-1">※ デモ用の設定項目です。実際のアプリでは自動カウントされます</p>
                </div>
              </div>
              
              {/* 送信ボタン */}
              <div className="flex justify-end space-x-3">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-primary-light text-textLight rounded-lg hover:bg-primary border border-primary"
                  >
                    キャンセル
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary-light flex items-center"
                >
                  <FiSave className="mr-2" />
                  {isEditMode ? '更新する' : '投稿する'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-textLight mb-6">コンテンツ一覧</h2>
            
            {contentsList.length > 0 ? (
              <div className="space-y-4">
                {contentsList.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-primary p-4 rounded-lg flex flex-col sm:flex-row items-start gap-4"
                  >
                    <div className="w-full sm:w-1/4">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-textLight mb-1">{item.title}</h3>
                          <p className="text-textDark text-sm mb-2">
                            {new Date(item.date).toLocaleDateString('ja-JP')} | {item.category} | {item.type === 'video' ? '動画' : '記事'}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {new Date(item.date) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-300">新着</span>
                            )}
                            {item.isFeatured && (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">注目</span>
                            )}
                            {item.viewCount >= 100 && (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-900 text-red-300">人気</span>
                            )}
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-300">
                              <span className="mr-1">👁</span>{item.viewCount || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => startEdit(item)}
                            className="p-2 text-secondary hover:text-secondary-light"
                            title="編集"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(item)}
                            className="p-2 text-red-500 hover:text-red-400"
                            title="削除"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-textDark">コンテンツがまだありません</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-dark rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-textLight">削除の確認</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-textDark hover:text-textLight"
              >
                <FiX size={24} />
              </button>
            </div>
            <p className="text-textLight mb-6">
              「{contentToDelete?.title}」を削除してもよろしいですか？<br />
              この操作は元に戻せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-primary-light"
              >
                キャンセル
              </button>
              <button
                onClick={deleteContent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
