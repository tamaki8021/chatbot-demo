import React, {useState, useEffect, useCallback} from 'react';
import './assets/styles/style.css';
import {AnswersList, Chats} from "./components/index";
import FormDaialog from './components/Forms/FormDaialog';
import {db} from './firebase/index';


const App = () => {
  const [answers, setAnawers] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentId, setCurrentID] = useState('init');
  const [dataset, setDataset] = useState({});
  const [open, setOpen] = useState(false);

    /* @nextQuestionId ユーザーの回答を受け取る 
   * 質問とチャットをstateへセットする
   */
  const displayNextQuestion = (nextQuestionId, nextDataset) => {
    addChats({
      text: nextDataset.question,
      type: 'question'
    })

    // 次の回答一覧をセット
    setAnawers(nextDataset.answers)

    //現在の質問IDをセット
    setCurrentID(nextQuestionId)
  }

  /* ユーザーの回答を受け取り、chatsへ保存 */
  const selectAnswer = (selectedAnswer, nextQuestionId) => {
    switch(true) {
      /* お問い合わせの場合、モーダルを開く(setStateの変更) */
      case (nextQuestionId === 'contact'):
        handleClickOpen();
        break;

      /* URL時 */
      case(/http:*/.test(nextQuestionId)):
        const a = document.createElement('a');
        a.href = nextQuestionId;
        a.target = '_blank';
        a.click();
        break;

      /* 回答時 */
      default:
        // チャットに回答するvalueを「chats」へ入れる
        addChats({
          text: selectedAnswer,
          type: 'answer'
        })

        // state変更
        setTimeout(() => displayNextQuestion(nextQuestionId, dataset[nextQuestionId]), 500);
        break;
    }
  }

  const addChats = (chat) => {
    setChats(preveChats => {
      return [...preveChats, chat]
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = useCallback(() => {
      setOpen(false)
  }, [setOpen]);


   /* ライフサイクル */
  // アンサーが回答される度にselectAnswerメソッドが実行される
  useEffect(() => {
    // 即時関数を使ってデータベースから取得を行う
    (async() => {
      const initDataset = {};
      // awaitをすることで中の処理が終えるのを待ってくれる
      await db.collection('questions').get().then(snapshots => {
        snapshots.forEach(doc => {
          const id = doc.id;
          const data = doc.data();
          initDataset[id] = data;
        })
      })

      // state更新・表示
      setDataset(initDataset) //生のデータ

      //最初の質問を表示
      displayNextQuestion(currentId, initDataset[currentId])
    })();
  }, []);

  // 自動スクロールを実装
  useEffect(() => {
    const scrollArea = document.getElementById('scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  })

    return (
      <section className="c-section">
        <div className="c-box">
            <Chats chats={chats}/>
            <AnswersList answers={answers} select={selectAnswer}/>
            <FormDaialog open={open} handleClose={handleClose} />
        </div>
      </section>
    );
}

export default App
