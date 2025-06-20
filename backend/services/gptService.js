const { OpenAI } = require('openai');

// OpenAI APIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class GPTService {
  // 学年別の単元内容を正確に定義
  static getGradeUnitMapping() {
    return {
      1: ['数と計算（10までの数）', '数と計算（たし算）', '数と計算（ひき算）', '図形（形）', '測定（長さ、かさ）'],
      2: ['数と計算（100までの数）', '数と計算（かけ算）', '図形（はこの形）', '測定（長さ）', '時刻と時間'],
      3: ['数と計算（1000までの数）', '数と計算（わり算）', '数と計算（小数）', '数と計算（分数）', '図形（二等辺三角形と正三角形）', '測定（重さ）'],
      4: ['数と計算（大きな数）', '数と計算（小数のかけ算・わり算）', '数と計算（分数のたし算・ひき算）', '図形（垂直と平行）', '図形（四角形）', '測定（面積）', '角度'],
      5: ['数と計算（整数）', '数と計算（小数の計算）', '数と計算（分数の計算）', '図形（合同な図形）', '図形（円と正多角形）', '測定（体積）', '割合'],
      6: ['数と計算（分数の計算）', '数と計算（文字と式）', '図形（拡大図と縮図）', '図形（対称な図形）', '測定（円の面積）', '測定（角柱と円柱の体積）', '比例と反比例', '資料の調べ方']
    };
  }

  // 単元が適切な学年かチェック
  static isUnitAppropriateForGrade(unitName, grade) {
    const gradeUnits = this.getGradeUnitMapping();
    const appropriateGrades = [];
    
    for (const [g, units] of Object.entries(gradeUnits)) {
      if (units.some(u => u === unitName)) {
        appropriateGrades.push(parseInt(g));
      }
    }
    
    if (appropriateGrades.length === 0) return true; // 単元が見つからない場合は許可
    return appropriateGrades.includes(grade);
  }

  // 小学生向けの適切な例題を定義
  static getGradeAppropriateExamples(grade, unitName) {
    const examples = {
      1: {
        '数と計算（10までの数）': '1から10までの数を数える、5より大きい数を見つける',
        '数と計算（たし算）': '3 + 2 = 5のような一桁の足し算',
        '数と計算（ひき算）': '7 - 3 = 4のような一桁の引き算',
        '図形（形）': '丸、三角、四角の形を見分ける',
        '測定（長さ、かさ）': 'どちらが長い、どちらが多いを比べる'
      },
      2: {
        '数と計算（100までの数）': '25 + 13 = 38のような2桁の計算',
        '数と計算（かけ算）': '3 × 4 = 12のような九九の計算',
        '図形（はこの形）': '箱の形、正方形、長方形を見分ける',
        '測定（長さ）': 'センチメートルを使った長さの測定',
        '時刻と時間': '3時30分から1時間後は4時30分'
      },
      3: {
        '数と計算（1000までの数）': '123 + 456 = 579のような3桁の計算',
        '数と計算（わり算）': '12 ÷ 3 = 4のような簡単な割り算',
        '数と計算（小数）': '1.5 + 2.3 = 3.8のような小数第一位の計算',
        '数と計算（分数）': '1/2、1/4などの簡単な分数',
        '図形（二等辺三角形と正三角形）': '辺の長さが同じ三角形',
        '測定（重さ）': 'グラム、キログラムを使った重さ'
      },
      4: {
        '数と計算（大きな数）': '1万2千 + 3万4千 = 4万6千のような万の単位の計算',
        '数と計算（小数のかけ算・わり算）': '2.5 × 4 = 10のような計算',
        '数と計算（分数のたし算・ひき算）': '1/3 + 1/3 = 2/3のような同分母の計算',
        '図形（垂直と平行）': '垂直な線、平行な線を見つける',
        '図形（四角形）': '平行四辺形、ひし形、台形の性質',
        '測定（面積）': '縦5cm、横3cmの長方形の面積は15㎠',
        '角度': '直角は90度、鋭角は90度より小さい角'
      },
      5: {
        '数と計算（整数）': '偶数・奇数、倍数・約数',
        '数と計算（小数の計算）': '2.5 × 3 = 7.5のような小数のかけ算',
        '数と計算（分数の計算）': '1/2 + 1/4 = 3/4のような異分母の計算',
        '図形（合同な図形）': '形も大きさも同じ図形',
        '図形（円と正多角形）': '円の性質、正五角形、正六角形',
        '測定（体積）': '縦3cm、横4cm、高さ5cmの直方体の体積は60㎤',
        '割合': '全体が100個のうち30個は30%'
      },
      6: {
        '数と計算（分数の計算）': '2/3 × 3/4 = 1/2のような分数のかけ算',
        '数と計算（文字と式）': 'x + 5 = 12のような文字を使った式',
        '図形（拡大図と縮図）': '2倍に拡大、1/2に縮小',
        '図形（対称な図形）': '線対称、点対称の図形',
        '測定（円の面積）': '半径3cmの円の面積は9π㎠',
        '測定（角柱と円柱の体積）': '底面積×高さで体積を求める',
        '比例と反比例': 'yはxに比例し、x=2のときy=6ならy=3x',
        '資料の調べ方': '平均値、最頻値、度数分布表'
      }
    };
    
    return examples[grade]?.[unitName] || '学年に適した身近な例を使った問題';
  }

  // 学年別の注意事項を定義
  static getGradeGuidelines(grade) {
    const guidelines = {
      1: '数字は1から20まで、身近な物（りんご、えんぴつなど）を使用、ひらがな多め',
      2: '数字は100まで、九九の範囲内、時計や長さの基本単位、カタカナも使用可',
      3: '数字は1000まで、小数第一位まで、基本的な分数（1/2、1/4など）',
      4: '数字は1万まで、小数第二位まで、面積や角度の基本、大きな数の単位（千、万）',
      5: '数字は10万まで、小数の筆算、通分が必要な分数、基本的な割合',
      6: '数字は100万まで、複雑な分数計算、文字式、比例関係'
    };
    
    return guidelines[grade] || '学年に適した範囲の数字と概念を使用';
  }

  // 単元情報からGPTに問題生成を依頼
  static async generateProblem(unit, grade, isAdvanced = false) {
    try {
      // 学年チェック
      if (!this.isUnitAppropriateForGrade(unit.name, grade)) {
        console.warn(`警告: ${unit.name}は${grade}年生には不適切です。適切な問題を生成します。`);
        // 学年に合った代替問題を生成
        return this.generateGradeAppropriateFallback(grade, isAdvanced);
      }

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
      
      // ランダムシードを追加
      const randomSeed = Math.random();
      
      console.log(`問題生成開始: ${unit.name}, 学年: ${grade}, 難易度: ${difficulty}`);
      
      const prompt = `
あなたは小学${grade}年生向けの算数教師です。
以下の単元に関する${difficulty}を1つだけ作成してください。

単元名: ${unit.name}
単元内容: ${unit.description}
学年: ${grade}年生
ランダムシード: ${randomSeed}

【重要】小学${grade}年生レベルの制約:
${guidelines}

この単元の適切な例: ${examples}

【特に重要な注意事項】
${unit.name.includes('合同') ? 
`- 合同な図形とは、形も大きさも完全に同じ図形のことです
- 大きさが違えば合同ではありません
- 向きが違っても、形と大きさが同じなら合同です` : ''}
${unit.name.includes('小数') && grade <= 2 ? 
`- ${grade}年生はまだ小数を習っていません
- 整数のみを使用してください` : ''}
${unit.name.includes('分数') && grade <= 2 ? 
`- ${grade}年生はまだ分数を習っていません
- 整数のみを使用してください` : ''}

問題作成の絶対条件:
1. 小学${grade}年生が理解できる範囲の数字と概念のみ使用
2. 身近で具体的な題材を使用（おかし、文房具、動物、スポーツなど）
3. 会社の売上、株式、複雑な金融概念は絶対に使用しない
4. 問題文には計算に必要な情報をすべて明示
5. 一意の答えが導き出せる問題
6. 単位の表記は一貫して正確（円、個、本、枚など）
7. ${isAdvanced ? '学年レベルより少し難しいが、解ける程度' : '学年の標準的なレベル'}
8. 毎回異なる数値や題材を使用し、前回と同じ問題は作らない
9. 問題と答えが論理的に整合している

次の形式で返してください:
{
  "problem": "小学${grade}年生に適した具体的で身近な問題文",
  "answer": "明確な答え（単位付き）",
  "explanation": "小学生にもわかる解法の手順"
}`;

      // レスポンス生成（temperatureを上げてランダム性を増加）
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `小学校の算数教師として、小学${grade}年生のレベルに完全に適合した問題を作成します。学年に応じた数学概念のみを使用し、その学年でまだ習っていない概念は絶対に使用しません。会社の売上や株式などの複雑な概念は一切使用せず、子どもたちが親しみやすい身近な題材のみを使用します。` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8, // ランダム性を増加
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
            '企業', '経済', '市場', 'ビジネス', '株式', '証券', 'ドル', '$'
          ];
          
          // 学年別の不適切なキーワード
          if (grade <= 2) {
            inappropriateKeywords.push('小数', '0.', '分数', '/', '％', 'パーセント');
          }
          if (grade <= 4) {
            inappropriateKeywords.push('合同', '相似', 'π', '円周率');
          }
          
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

  // 学年に適した代替問題を生成
  static generateGradeAppropriateFallback(grade, isAdvanced) {
    const gradeUnits = this.getGradeUnitMapping()[grade];
    if (gradeUnits && gradeUnits.length > 0) {
      // ランダムに適切な単元を選択
      const randomUnit = gradeUnits[Math.floor(Math.random() * gradeUnits.length)];
      const unit = {
        name: randomUnit,
        description: this.getGradeAppropriateExamples(grade, randomUnit)
      };
      return this.generateFallbackProblem(unit, grade, isAdvanced);
    }
    return this.generateFallbackProblem({ name: '基本計算', description: '基本的な計算' }, grade, isAdvanced);
  }

  // 学年に適したフォールバック問題を生成（ランダム性を追加）
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
        },
        {
          problem: 'あめが7個ありました。3個食べました。残りは何個ですか？',
          answer: '4個',
          explanation: '7個から3個を引くので、7 - 3 = 4 です。残りは4個です。'
        },
        {
          problem: 'おもちゃが2個あります。4個もらいました。全部で何個ですか？',
          answer: '6個',
          explanation: '2個に4個を足すので、2 + 4 = 6 です。全部で6個です。'
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
        },
        {
          problem: 'キャンディーが5個ずつ入った袋が3袋あります。全部で何個ありますか？',
          answer: '15個',
          explanation: '5個ずつ3袋なので、5 × 3 = 15 です。全部で15個です。'
        },
        {
          problem: '本が23冊ありました。17冊読みました。まだ読んでいない本は何冊ですか？',
          answer: '6冊',
          explanation: '23冊から17冊を引くので、23 - 17 = 6 です。まだ6冊読んでいません。'
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
        },
        {
          problem: 'ジュースが1.5リットルありました。0.5リットル飲みました。残りは何リットルですか？',
          answer: '1リットル',
          explanation: '1.5リットルから0.5リットルを引くので、1.5 - 0.5 = 1 です。残りは1リットルです。'
        },
        {
          problem: 'ピザを1枚買いました。その半分（1/2）を食べました。残りはどれだけですか？',
          answer: '1/2（半分）',
          explanation: '1枚の半分を食べたので、残りも半分（1/2）です。'
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
        },
        {
          problem: 'ジュースが2.5リットルありました。0.8リットルずつコップに入れると、何杯分できますか？',
          answer: '3杯（あまり0.1リットル）',
          explanation: '2.5 ÷ 0.8 = 3あまり0.1 です。3杯分できて、0.1リットル余ります。'
        },
        {
          problem: 'ケーキの3/4を食べました。1/4を友達にあげました。残りはどれだけですか？',
          answer: '0（なし）',
          explanation: '3/4 + 1/4 = 4/4 = 1（全部）なので、残りはありません。'
        }
      ],
      5: [
        {
          problem: 'クッキーが30枚ありました。そのうち40%を食べました。食べたクッキーは何枚ですか？',
          answer: '12枚',
          explanation: '30枚の40%は、30 × 0.4 = 12 です。食べたクッキーは12枚です。'
        },
        {
          problem: '2つの正方形があります。どちらも1辺が5cmです。この2つの正方形は合同ですか？',
          answer: '合同です',
          explanation: '形が同じ（正方形）で、大きさも同じ（1辺5cm）なので、合同です。'
        },
        {
          problem: '直方体の縦3cm、横4cm、高さ5cmです。体積を求めましょう。',
          answer: '60㎤',
          explanation: '直方体の体積は 縦 × 横 × 高さ なので、3 × 4 × 5 = 60㎤ です。'
        },
        {
          problem: '12の約数をすべて答えましょう。',
          answer: '1, 2, 3, 4, 6, 12',
          explanation: '12を割り切れる数が約数です。12÷1=12, 12÷2=6, 12÷3=4, 12÷4=3, 12÷6=2, 12÷12=1'
        }
      ],
      6: [
        {
          problem: '半径が5cmの円の面積を求めましょう。（円周率は3.14とします）',
          answer: '78.5㎠',
          explanation: '円の面積は 半径 × 半径 × 円周率 で求められます。5 × 5 × 3.14 = 78.5㎠です。'
        },
        {
          problem: '3/5 × 5/6 を計算しましょう。',
          answer: '1/2',
          explanation: '分数のかけ算は、分子同士、分母同士をかけます。(3×5)/(5×6) = 15/30 = 1/2 です。'
        },
        {
          problem: 'xの値が2倍になると、yの値も2倍になります。x=3のときy=12なら、x=6のときyはいくつ？',
          answer: '24',
          explanation: 'yはxに比例しています。xが2倍（3→6）になったので、yも2倍（12→24）になります。'
        },
        {
          problem: '正方形を2倍に拡大しました。元の正方形の1辺が4cmなら、拡大後の1辺は何cm？',
          answer: '8cm',
          explanation: '2倍に拡大すると、辺の長さも2倍になります。4 × 2 = 8cmです。'
        }
      ]
    };

    const gradeProblems = fallbackProblems[grade] || fallbackProblems[3];
    // ランダムに問題を選択
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
3. 単位の表記の小さな違い（cm・センチメートル・㎝など）は許容してください
4. 生徒の回答が数学的に等価であれば正解としてください
5. 説明は小学生にわかりやすい言葉で行ってください
6. 正解の場合は褒め、不正解の場合は励ましてください

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
6. 年齢に不適切な内容（株式、複雑な金融など）は避けてください
7. その学年でまだ習っていない概念は使わないでください`;

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