import React from 'react';
import './assets/styles/style.css';
import {AnswersList, Chats} from "./components/index";
import FormDaialog from './components/Forms/FormDaialog';
import {db} from './firebase/index';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answers: [],
      chats: [],
      currentId: "init",
      dataset: {},
      open: false
    }
    this.selectAnswer = this.selectAnswer.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleClickOpen = this.handleClickOpen.bind(this)
  }

    /* @nextQuestionId ユーザーの回答を受け取る 
   * 質問とチャットをstateへセットする
   */
  displayNextQuestion = (nextQuestionId) => {
    const chats = this.state.chats;
    chats.push({
      text: this.state.dataset[nextQuestionId].question,
      type: 'question'
    })

    this.setState({
      answers: this.state.dataset[nextQuestionId].answers,
      chats: chats,
      currentId: nextQuestionId
    })
  }

  /* ユーザーの回答を受け取り、chatsへ保存 */
  selectAnswer = (selectedAnswer, nextQuestionId) => {
    switch(true) {
       /* 初期値 */
      case (nextQuestionId === 'init'):
        setTimeout(() => this.displayNextQuestion(nextQuestionId), 500);
        break;

      /* お問い合わせの場合、モーダルを開く(setStateの変更) */
      case (nextQuestionId === 'contact'):
        this.handleClickOpen();
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
        const chats = this.state.chats;
        chats.push({
          text: selectedAnswer,
          type: 'answer'
        })
    
        this.setState({
          chats: chats
        })

        // state変更
        setTimeout(() => this.displayNextQuestion(nextQuestionId), 500);
        break;
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  // データベースから取得後、stateを更新する
  initDataset = (dataset) => {
    this.setState({dataset: dataset});
  };

   /* ライフサイクル */
  // アンサーが回答される度にselectAnswerメソッドが実行される
  componentDidMount() {
    // 即時関数を使ってデータベースから取得を行う
    (async() => {
      const dataset = this.state.dataset;

      // awaitをすることで中の処理が終えるのを待ってくれる
      await db.collection('questions').get().then(snapshots => {
        snapshots.forEach(doc => {
          const id = doc.id;
          const data = doc.data();
          dataset[id] = data;
        })
      })

      // state更新
      this.initDataset(dataset)
      const initAnswer = "";
      this.selectAnswer(initAnswer, this.state.currentId);

    })();
  }

  // 自動スクロールを実装
  componentDidUpdate() {
    const scrollArea = document.getElementById('scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }

  render() {
    return (
      <section className="c-section">
        <div className="c-box">
            <Chats chats={this.state.chats}/>
            <AnswersList answers={this.state.answers} select={this.selectAnswer}/>
            <FormDaialog open={this.state.open} handleClose={this.handleClose} />
        </div>
      </section>
    );
  }
}


