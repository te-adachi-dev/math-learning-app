const { OpenAI } = require('openai');

// OpenAI APIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class GPTService {
  // 小学生向けの適切な例題を定義
  static getGradeAppropriateExamples(grade, unitName) {
    const examples = {
      1: {
        '数と計算（10までの数）': '1から10までの数を数える、5より大きい数を見つける',
        '数と計算（たし算）': '3 + 2 = 5のような一桁の足し算',
        '数と計算（ひき算）': '7 - 3 = 4のような一桁の引き算'
      },
      2: {
        '数と計算（100までの数）': '25 + 13 = 38のような2桁の計算',
        '数と計算（かけ算）': '3 × 4 = 12のような九九の計算',
        '時刻と時間': '3時30分から1時間後は4時30分'
      },
      3: {
        '数と計算（1000までの数）': '123 + 456 = 579のような3桁の計算',
        '数と計算（わり算）': '12 ÷ 3 = 4のような簡単な割り算',
        '数と計算（小数）': '1.5 + 2.3 = 3.8のような小数の計算'
      },
      4: {
        '数と計算（大きな数）': '1万2千 + 3万4千 = 4万6千のような万の単位の計算',
        '測定（面積）': '縦5cm、横3cmの長方形の面積は15㎠',
        '角度': '直角は90度、鋭角は90度より小さい角'
      },
      5: {
        '数と計算（小数の計算）': '2.5 × 3 = 7.5のような小数のかけ算',
        '数と計算（分数の計算）': '1/2 + 1/4 = 3/4のような分数の計算',
        '割合': '全体が100個のうち30個は30%'
      },
      6: {
        '数と計算（分数の計算）': '2/3 × 3/4 = 1/2のような分数のかけ算',
        '測定（円の面積）': '半径3cmの円の面積は9π㎠',
        '比例と反比例': 'yはxに比例し、x=2のときy=6ならy=3x'
      }
    };
    
    return examples[grade]?.[unitName] || '身近な数や物を使った計算問題';
  }

  // 学年別の注意事項を定義
  static getGradeGuidelines(grade) {
    const guidelines = {
      1: '数字は1から20まで、身近な物（りんご、えんぴつなど）を使用',
      2: '数字は100まで、九九の範囲内、時計や長さの基本単位',
      3: '数字は1000まで、簡単な小数（0.1、0.5など）、基本的な分数（1/2、1/4など）',
      4: '数字は1万まで、面積や角度の基本、大きな数の単位（千、万）',
      5: '数字は10万まで、小数第一位まで、通分が簡単な分数、基本的な割合',
      6: '数字は100万まで、小数第二位まで、やや複雑な分数、比例関係'
    };
    
    return guidelines[grade] || '学年に適した範囲の数字と概念を使用';
  }

  // 単元情報からGPTに問題生成を依頼
  static async generateProblem(unit, grade, isAdvanced = false) {
    try {
      // ①図形問題の場合はSVGを生成
      const SVGGeometryService = require('./svgGeometryService');
      const geometryProblem = SVGGeometryService.generateGeometryProblem(grade, unit.name);
      
      if (geometryProblem) {
        console.log(`SVG図形問題を生成: ${unit.name}`);
        return geometryProblem;
      }
      
      const difficulty = isAdvanced ? '応用問題' : '基本問題';
      const examples = this.getGradeAppropriateExamples(grade, unit.name);
      const guidelines = this.getGradeGuidelines(grade);
      
      console.log(`問題生成開始: ${unit.name}, 学年: ${grade}, 難易度: ${difficulty}`);
      
      const prompt = `
あなたは小学${grade}年生向けの算数教師です。
以下の単元に関する${difficulty}を1つだけ作成してください。

単元名: ${unit.name}
単元内容: ${unit.description}
学年: ${grade}年生

【重要】小学${grade}年生レベルの制約:
${guidelines}

この単元の適切な例: ${examples}

問題作成の絶対条件:
1. 小学${grade}年生が理解できる範囲の数字のみ使用
2. 身近で具体的な題材を使用（おかし、文房具、動物、スポーツなど）
3. 会社の売上、株式、複雑な金融概念は絶対に使用しない
4. 問題文には計算に必要な情報をすべて明示
5. 一意の答えが導き出せる問題
6. 単位の表記は一貫して正確
7. ${isAdvanced ? '学年レベルより少し難しいが、解ける程度' : '学年の標準的なレベル'}

良い例（4年生の大きな数）:
- 太郎君の小学校の生徒数は1,234人です。隣の小学校は2,567人です。2つの小学校の生徒数を合わせると何人になりますか？
- 図書館に本が15,000冊あります。新しく3,000冊増えました。全部で何冊になりますか？

悪い例（避けるべき）:
- 会社の売上が○兆円...
- 株式数を計算...
- 複雑な金融計算

次の形式で返してください:
{
  "problem": "小学${grade}年生に適した具体的で身近な問題文",
  "answer": "明確な答え（単位付き）",
  "explanation": "小学生にもわかる解法の手順"
}`;

      // レスポンス生成
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `小学校の算数教師として、小学${grade}年生のレベルに完全に適合した問題を作成します。会社の売上や株式などの複雑な概念は一切使用せず、子どもたちが親しみやすい身近な題材のみを使用します。問題は必ず学年相応の難易度で、解答可能な内容にします。` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      const responseText = completion.choices[0].message.content;
      console.log(`問題生成レスポンス: ${responseText}`);
      
      try {
        const jsonMatch = responseText.match(/({[\s\S]*})/);
        if (jsonMatch) {
          const problemData = JSON.parse(jsonMatch[0]);
          
          // 問題が不適切でないかチェック
          const problemText = problemData.problem;
          const inappropriateKeywords = [
            '兆', '億', '株', '会社', '売上', '利益', '配当', '投資', '金融',
            '企業', '経済', '市場', 'ビジネス', '株式', '証券'
          ];
          
          const hasInappropriateContent = inappropriateKeywords.some(keyword => 
            problemText.includes(keyword)
          );
          
          if (hasInappropriateContent) {
            console.log('不適切な内容が含まれています。学年相応の問題を生成します。');
            return this.generateFallbackProblem(unit, grade, isAdvanced);
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
        return this.generateFallbackProblem(unit, grade, isAdvanced);
      }
    } catch (error) {
      console.error('問題生成エラー:', error);
      return this.generateFallbackProblem(unit, grade, isAdvanced);
    }
  }

  // 学年に適したフォールバック問題を生成
  static generateFallbackProblem(unit, grade, isAdvanced) {
    const fallbackProblems = {
      1: [
        {
          problem: 'みかんが5個あります。そのうち2個を食べました。残りは何個ですか？',
          answer: '3個',
          explanation: '最初に5個あって、2個食べたので、5 - 2 = 3 です。残りは3個です。'
        },
        {
          problem: 'えんぴつが3本あります。2本もらいました。全部で何本になりますか？',
          answer: '5本',
          explanation: '最初に3本あって、2本もらったので、3 + 2 = 5 です。全部で5本です。'
        }
      ],
      2: [
        {
          problem: 'えんぴつが3本ずつ入った箱が4箱あります。えんぴつは全部で何本ありますか？',
          answer: '12本',
          explanation: '3本ずつ4箱なので、3 × 4 = 12 です。全部で12本です。'
        },
        {
          problem: 'クッキーが15個ありました。5個食べました。残りは何個ですか？',
          answer: '10個',
          explanation: '15個から5個を引くので、15 - 5 = 10 です。残りは10個です。'
        }
      ],
      3: [
        {
          problem: 'ケーキを12個作りました。3人で同じ数ずつ分けると、1人何個もらえますか？',
          answer: '4個',
          explanation: '12個を3人で分けるので、12 ÷ 3 = 4 です。1人4個もらえます。'
        },
        {
          problem: 'りんごが24個ありました。6個ずつ袋に入れると、何袋できますか？',
          answer: '4袋',
          explanation: '24個を6個ずつに分けるので、24 ÷ 6 = 4 です。4袋できます。'
        }
      ],
      4: [
        {
          problem: '学校の図書館に本が3,500冊あります。新しく1,200冊増えました。全部で何冊になりますか？',
          answer: '4,700冊',
          explanation: '3,500 + 1,200 = 4,700 です。全部で4,700冊になります。'
        },
        {
          problem: '縦4cm、横6cmの長方形の面積を求めましょう。',
          answer: '24㎠',
          explanation: '長方形の面積は たて × よこ なので、4 × 6 = 24㎠ です。'
        }
      ],
      5: [
        {
          problem: 'クッキーが20枚ありました。そのうち1/4を友達にあげました。あげたクッキーは何枚ですか？',
          answer: '5枚',
          explanation: '20枚の1/4は、20 ÷ 4 = 5 です。あげたクッキーは5枚です。'
        },
        {
          problem: '2.5mのひもを0.5mずつ切ると、何本できますか？',
          answer: '5本',
          explanation: '2.5 ÷ 0.5 = 5 です。5本できます。'
        }
      ],
      6: [
        {
          problem: '半径が6cmの円の面積を求めましょう。（円周率は3.14とします）',
          answer: '113.04㎠',
          explanation: '円の面積は 半径 × 半径 × 円周率 で求められます。6 × 6 × 3.14 = 113.04㎠です。'
        },
        {
          problem: '2/3 × 3/4 を計算しましょう。',
          answer: '1/2',
          explanation: '分数のかけ算は、分子同士、分母同士をかけます。(2×3)/(3×4) = 6/12 = 1/2 です。'
        }
      ]
    };

    const gradeProblems = fallbackProblems[grade] || fallbackProblems[3];
    const randomIndex = Math.floor(Math.random() * gradeProblems.length);
    return gradeProblems[randomIndex];
  }

  // 回答の正誤判定
  static async evaluateAnswer(problem, userAnswer, correctAnswer, unit, grade) {
    try {
      console.log(`回答評価開始: 問題="${problem}", ユーザー回答="${userAnswer}", 正解="${correctAnswer}"`);
      
      const prompt = `
小学${grade}年生の算数の問題の回答を評価してください。

単元名: ${unit.name}
単元内容: ${unit.description}

問題: ${problem}
正解: ${correctAnswer}
生徒の回答: ${userAnswer}

評価の条件:
1. 小学${grade}年生のレベルに合わせて優しく評価してください
2. 答えの数値が正しければ、表記の違い（ひらがな・カタカナ・漢字）は許容してください
3. 単位の表記の小さな違い（cm・センチメートル・cmなど）は許容してください
4. 生徒の回答が数学的に等価であれば正解としてください
5. 説明は小学生にわかりやすい言葉で行ってください

生徒の回答が正解かどうかを判断し、その理由をJSON形式で返してください:
{
  "isCorrect": true または false,
  "explanation": "小学${grade}年生にもわかる優しい説明"
}`;
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `小学${grade}年生の優しい算数の先生として、子どもたちの努力を認めながら正確で温かい評価を行います。間違いがあっても励ましの言葉を含め、正解の場合はしっかり褒めます。` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      });

      const responseText = completion.choices[0].message.content;
      console.log(`回答評価レスポンス: ${responseText}`);
      
      try {
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
        // フォールバック評価
        const isCorrectGuess = responseText.toLowerCase().includes('correct') || 
                              responseText.includes('正解') ||
                              responseText.includes('せいかい');
        
        return {
          isCorrect: isCorrectGuess,
          explanation: isCorrectGuess ? 
            'よくできました！正解です。' : 
            'おしい！もう一度考えてみましょう。'
        };
      }
    } catch (error) {
      console.error('回答評価エラー:', error);
      return {
        isCorrect: false,
        explanation: 'ごめんなさい、評価がうまくできませんでした。もう一度やってみてくださいね。'
      };
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
1. 小学${userData.grade}年生にわかりやすい言葉で、短く簡潔に説明してください
2. 専門用語を使う場合は、必ず子どもでもわかる言葉で説明を加えてください
3. 算数の概念は具体例を用いて説明してください
4. 励ましや前向きな言葉を含めてください
5. 質問に対しては正確で明確な回答を心がけてください
6. 年齢に不適切な内容（株式、複雑な金融など）は避けてください`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `親しみやすく、わかりやすく、かつ教育的な小学校の算数教師として応答します。小学${userData.grade}年生のレベルに合わせて、子どもの学習意欲を高め、算数の楽しさを伝えることを心がけます。複雑すぎる概念や年齢に不適切な内容は避けます。` 
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