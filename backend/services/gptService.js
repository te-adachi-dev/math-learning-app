const { OpenAI } = require('openai');

// OpenAI APIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class GPTService {
  // 単元情報からGPTに問題生成を依頼
  static async generateProblem(unit, grade, isAdvanced = false) {
    try {
      const difficulty = isAdvanced ? '応用問題' : '基本問題';
      
      const prompt = `
あなたは小学${grade}年生向けの算数教師です。
以下の単元に関する${difficulty}を1つだけ作成してください。

単元名: ${unit.name}
単元内容: ${unit.description}

問題作成の条件:
1. 小学${grade}年生の学習指導要領に準拠した内容であること
2. 年齢に適した難易度と表現を使用すること
3. 計算式や数値は明確で誤解を招かないこと
4. 問題文は簡潔で、何を求めるのかが明確であること
5. 単位の表記は一貫して正確であること（例：km, m, cm, kg, g など）
6. 数値は教科書に準拠した表記方法を使用すること

問題、正解、解説の3つをJSON形式で返してください。
答えには必要に応じて単位を含めてください。また、小数点以下の桁数が重要な場合は何桁まで求めるかを問題文中に明記してください。

{
  "problem": "問題文をここに書いてください",
  "answer": "正解を単位付きで記入してください",
  "explanation": "解法の手順を段階的に説明してください"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '小学校の教科書に掲載されているような質の高い算数問題を作成します。問題は教育的で、明確で、子どもが理解しやすく、かつ学習効果の高いものを作成します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5, // 温度を下げて一貫性を高める
      });

      const responseText = completion.choices[0].message.content;
      try {
        // JSONの部分を抽出して解析
        const jsonMatch = responseText.match(/({[\s\S]*})/);
        if (jsonMatch) {
          const problemData = JSON.parse(jsonMatch[0]);
          return {
            problem: problemData.problem,
            answer: problemData.answer,
            explanation: problemData.explanation
          };
        } else {
          throw new Error('JSONフォーマットが見つかりませんでした');
        }
      } catch (jsonError) {
        console.error('JSON解析エラー:', jsonError);
        // フォールバック: テキスト全体を返す
        return {
          problem: '問題を生成できませんでした。もう一度お試しください。',
          answer: '',
          explanation: responseText
        };
      }
    } catch (error) {
      console.error('問題生成エラー:', error);
      throw error;
    }
  }

  // 回答の正誤判定
  static async evaluateAnswer(problem, userAnswer, correctAnswer, unit, grade) {
    try {
      const prompt = `
小学${grade}年生の算数の問題の回答を評価してください。

単元名: ${unit.name}
単元内容: ${unit.description}

問題: ${problem}
正解: ${correctAnswer}
生徒の回答: ${userAnswer}

評価基準:
1. 数値の正確さ - 計算結果が正しいか
2. 単位の正確さ - 適切な単位が付けられているか
3. 表記の許容範囲 - 以下の場合は正解として扱う:
   a. 同値の異なる表記（例：1.5億と1億5000万）
   b. 末尾の0の有無（例：1.50と1.5）
   c. 漢数字とアラビア数字の違い（例：三百と300）
   d. 分数と小数の互換表記（例：1/4と0.25）

回答が問題で指定された桁数や形式と一致しているかを特に確認してください。
問題で「小数第2位まで求めなさい」のような指定がある場合は、その条件を満たしているかも評価してください。

生徒の回答が正解かどうか判断し、なぜその判断になったかの説明をJSON形式で返してください。

{
  "isCorrect": true または false,
  "explanation": "判断理由と追加の解説"
}`;
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '算数の教師として、明確な基準に基づいて生徒の回答を公平に評価します。数学的に正確で、かつ教育的な解説を提供します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // さらに温度を下げて判定の一貫性を高める
      });

      const responseText = completion.choices[0].message.content;
      try {
        // JSONの部分を抽出して解析
        const jsonMatch = responseText.match(/({[\s\S]*})/);
        if (jsonMatch) {
          const evaluationData = JSON.parse(jsonMatch[0]);
          return {
            isCorrect: evaluationData.isCorrect,
            explanation: evaluationData.explanation
          };
        } else {
          throw new Error('JSONフォーマットが見つかりませんでした');
        }
      } catch (jsonError) {
        console.error('JSON解析エラー:', jsonError);
        // フォールバック: テキスト全体を解析してフラグを推測
        const isCorrectGuess = responseText.toLowerCase().includes('correct') || 
                              responseText.toLowerCase().includes('正解');
        return {
          isCorrect: isCorrectGuess,
          explanation: responseText
        };
      }
    } catch (error) {
      console.error('回答評価エラー:', error);
      throw error;
    }
  }
  
  // チャット応答を生成
  static async generateChatResponse(message, userData, unitData) {
    try {
      const prompt = `
小学${userData.grade}年生の生徒とのチャットです。生徒のメッセージに応答してください。

生徒の学年: ${userData.grade}年生
取り組んでいる単元: ${unitData ? unitData.name : '未選択'}
単元内容: ${unitData ? unitData.description : ''}

生徒のメッセージ: ${message}

応答の条件:
1. 小学生にわかりやすい言葉で、短く簡潔に説明してください
2. 専門用語を使う場合は、必ず子どもでもわかる言葉で説明を加えてください
3. 算数の概念は具体例を用いて説明してください
4. 励ましや前向きな言葉を含めてください
5. 質問に対しては正確で明確な回答を心がけてください`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '親しみやすく、わかりやすく、かつ教育的な小学校の算数教師として応答します。子どもの学習意欲を高め、算数の楽しさを伝えることを心がけます。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 200
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('チャット応答生成エラー:', error);
      return 'ごめんなさい、うまく返事ができませんでした。もう一度話しかけてみてね。';
    }
  }
}

module.exports = GPTService;