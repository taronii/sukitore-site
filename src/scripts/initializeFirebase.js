import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// 月次合言葉の初期データ設定
export const initializeMonthlyPassphrases = async () => {
  try {
    // データベースに接続できるか確認
    console.log('データベース接続を確認中...');
    try {
      const testRef = collection(db, 'test');
      console.log('データベース接続成功:', testRef.path);
    } catch (dbError) {
      console.error('データベース接続エラー:', dbError);
    }

    const passphrases = {
      "2025-05": "sukitore2025", 
      "2025-06": "diet2025june",
      "2025-07": "slim2025july"
    };
    
    console.log('月次合言葉の初期化を開始...');
    
    for (const [yearMonth, passphrase] of Object.entries(passphrases)) {
      console.log(`${yearMonth}の合言葉を設定中...`);
      
      try {
        // まず単純なオブジェクトで試す
        await setDoc(doc(db, 'monthlyPassphrases', yearMonth), { 
          passphrase: passphrase
        });
        console.log(`${yearMonth}の合言葉を設定しました`);
      } catch (docError) {
        console.error(`${yearMonth}の合言葉設定エラー:`, docError);
        // エラーが発生しても続行する
      }
    }
    
    console.log('月次合言葉の初期化が完了しました');
    return true;
  } catch (error) {
    console.error('月次合言葉の初期化エラー:', error);
    return false;
  }
};

// 管理者アカウントの作成
export const createAdminUser = async (email, password) => {
  try {
    console.log('管理者アカウントの作成を開始...');
    
    // 既存ユーザーをチェック
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isAdmin', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('管理者アカウントは既に存在します');
      return false;
    }
    
    // 新しい管理者ユーザーを作成
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Firestoreに管理者データを保存
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      isAdmin: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      tokenExpiry: Timestamp.fromDate(lastDayOfMonth),
      viewHistory: []
    });
    
    console.log('管理者アカウントの作成が完了しました');
    return true;
  } catch (error) {
    console.error('管理者アカウント作成エラー:', error);
    return false;
  }
};

// ローカルストレージからFirestoreへコンテンツを移行
export const migrateContentsToFirestore = async () => {
  try {
    console.log('コンテンツの移行を開始...');
    
    // ローカルストレージからコンテンツを取得
    const savedContents = localStorage.getItem('sukitoreContents');
    if (!savedContents) {
      console.log('移行するコンテンツがありません');
      return false;
    }
    
    const contents = JSON.parse(savedContents);
    let migratedCount = 0;
    
    for (const content of contents) {
      // タイムスタンプをFirestoreのTimestamp形式に変換
      const contentData = {
        ...content,
        date: Timestamp.fromDate(new Date(content.date)),
        migratedAt: serverTimestamp()
      };
      
      // Firestoreにコンテンツを保存
      await setDoc(doc(db, 'contents', content.id.toString()), contentData);
      migratedCount++;
    }
    
    console.log(`${migratedCount}件のコンテンツの移行が完了しました`);
    return true;
  } catch (error) {
    console.error('コンテンツ移行エラー:', error);
    return false;
  }
};

// 初期化実行関数
export const initializeFirebaseData = async (adminEmail = null, adminPassword = null) => {
  try {
    // 月次合言葉の初期化
    await initializeMonthlyPassphrases();
    
    // 管理者アカウントの作成（メールとパスワードが提供された場合）
    if (adminEmail && adminPassword) {
      await createAdminUser(adminEmail, adminPassword);
    }
    
    // コンテンツの移行
    await migrateContentsToFirestore();
    
    console.log('Firebaseデータの初期化が完了しました');
    return true;
  } catch (error) {
    console.error('Firebase初期化エラー:', error);
    return false;
  }
};
