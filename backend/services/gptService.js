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
      
      // デバッグ用にログを追加
      console.log(`問題生成開始: ${unit.name}, 学年: ${grade}, 難易度: ${difficulty}`);
      
      const prompt = `
あなたは小学${grade}年生向けの算数教師です。
以下の単元に関する${difficulty}を1つだけ作成してください。

単元名: ${unit.name}
単元内容: ${unit.description}

問題作成の絶対条件:
1. 問題文には必ず計算に必要なすべての情報を明示すること
2. 特に「何個のりんごを何グループに分ける」のような問題では、「8個のりんごを4グループに」のように総数と分ける数の両方を必ず明記すること
3. 一意の答えが導き出せる問題であること
4. 小学${grade}年生の学習指導要領に準拠した内容であること
5. 単位の表記は一貫して正確であること
6. 答えの形式（分数・小数・整数など）を指定する場合は、その指示を問題文に必ず含めること

問題、正解、解説の3つをJSON形式で返してください。
答えには必ず単位を含めてください（該当する場合）。

次の形式で返してください:
{
  "problem": "具体的な数値と必要な情報をすべて含む問題文",
  "answer": "明確な答え（単位付き）",
  "explanation": "解法の手順を段階的に説明"
}`;

      // レスポンス生成
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '小学校の算数問題を作成する教師として、明確で具体的な問題を作成します。問題は必ず解答可能で、計算に必要な情報がすべて明示されています。曖昧さや複数の解釈が可能な問題は作成しません。各問題には、必要な情報がすべて含まれ、正確な答えが一つに定まります。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // 創造性より一貫性を重視
      });

      const responseText = completion.choices[0].message.content;
      
      // デバッグ用にレスポンスをログ出力
      console.log(`問題生成レスポンス: ${responseText}`);
      
      try {
        // JSONの部分を抽出して解析
        const jsonMatch = responseText.match(/({[\s\S]*})/);
        if (jsonMatch) {
          const problemData = JSON.parse(jsonMatch[0]);
          
          // 問題の検証 - 明確さをチェック
          const problemText = problemData.problem;
          
          // 問題が基本条件を満たしているか検証
          const hasTotalAmount = 
            /(\d+)個の/.test(problemText) || 
            /合計(\d+)/.test(problemText) ||
            /全部で(\d+)/.test(problemText);
            
          // 条件を満たさない場合は再生成を要求
          if (!hasTotalAmount && 
              (problemText.includes('分ける') || 
               problemText.includes('分割') || 
               problemText.includes('配る'))) {
            console.log('問題が条件を満たしていません。再生成します。');
            // 再帰的に問題を再生成
            return this.generateProblem(unit, grade, isAdvanced);
          }
          
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
        // フォールバック: 明確な問題を生成
        return {
          problem: '8個のりんごを4つのグループに均等に分けます。1つのグループには何個のりんごが入りますか？',
          answer: '2個',
          explanation: '8個のりんごを4つのグループに均等に分けるので、8 ÷ 4 = 2 となります。したがって、1つのグループには2個のりんごが入ります。'
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
      // デバッグ用にログを追加
      console.log(`回答評価開始: 問題="${problem}", ユーザー回答="${userAnswer}", 正解="${correctAnswer}"`);
      
      const prompt = `
小学${grade}年生の算数の問題の回答を評価してください。

単元名: ${unit.name}
単元内容: ${unit.description}

問題: ${problem}
正解: ${correctAnswer}
生徒の回答: ${userAnswer}

評価の絶対条件:
1. 問題文をよく読み、問題が具体的に何を求めているかを正確に理解してください
2. 答えの数値だけでなく、単位や表記形式も含めて評価してください
3. 生徒の回答が正解と数学的に等価であれば正解としてください（例：0.25と1/4、2個と2つなど）
4. 評価は「正解か不正解か」の二択で判断し、部分点はありません
5. もし問題文に不備（情報不足など）がある場合は、その旨を説明に含めてください

生徒の回答が正解かどうかを判断し、その理由をJSON形式で返してください:
{
  "isCorrect": true または false,
  "explanation": "判断理由を生徒が理解できる言葉で説明"
}`;
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '算数教師として、公平で正確な採点を行います。問題の意図を正確に理解し、生徒の回答が数学的に正しいかどうかを評価します。生徒が混乱しないよう、わかりやすい言葉で説明します。問題自体に不備がある場合は、それを認識します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      });

      const responseText = completion.choices[0].message.content;
      
      // デバッグ用にレスポンスをログ出力
      console.log(`回答評価レスポンス: ${responseText}`);
      
      try {
        // JSONの部分を抽出して解析
        const jsonMatch = responseText.match(/({[\s\S]*})/);
        if (jsonMatch) {
          const evaluationData = JSON.parse(jsonMatch[0]);
          
          // 問題自体に不備があるかチェック
          const explanation = evaluationData.explanation;
          if (explanation.includes('問題に不備') || 
              explanation.includes('情報が不足') ||
              explanation.includes('明確でない')) {
            // 問題に不備がある場合は特別なフラグを立てる
            return {
              isCorrect: false,
              explanation: '申し訳ありません。この問題には必要な情報が不足しています。次の問題に進みましょう。',
              problemInvalid: true
            };
          }
          
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
        
        // 問題自体の不備をチェック
        const hasProblemIssue = responseText.includes('問題に不備') || 
                               responseText.includes('情報が不足') ||
                               responseText.includes('明確でない');
        
        if (hasProblemIssue) {
          return {
            isCorrect: false,
            explanation: '申し訳ありません。この問題には必要な情報が不足しています。次の問題に進みましょう。',
            problemInvalid: true
          };
        }
        
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