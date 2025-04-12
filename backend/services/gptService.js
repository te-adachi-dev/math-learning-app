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

問題は小学${grade}年生が理解できる表現で、明確な解答が導けるものにしてください。
問題、正解、解説の3つをJSON形式で返してください。

{
  "problem": "問題文をここに書いてください",
  "answer": "正解をここに書いてください",
  "explanation": "詳しい解説をここに書いてください"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '小学生向けの算数問題を作成する教師として振る舞います。問題、解答、解説のJSON形式で返します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
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

生徒の回答が正解かどうか判断し、なぜその判断になったかの説明をJSON形式で返してください。
数値計算の場合は小数点以下の桁数や表記の違いは許容してください。

{
  "isCorrect": true または false,
  "explanation": "判断理由と追加の解説"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '算数の先生として、生徒の回答を公平に評価します。基本的な概念が理解できていれば、表記の小さな違いは許容します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
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

生徒が質問している場合は答えてあげてください。励ましやアドバイスも適宜行ってください。
小学生にわかりやすい言葉で、短く簡潔に説明してください。`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '小学生向けの算数を教える優しい先生として振る舞います。子供が理解しやすい簡単な言葉を使い、励ましの言葉も添えます。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
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