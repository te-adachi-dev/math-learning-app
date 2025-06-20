// backend/services/svgGeometryService.js

class SVGGeometryService {
  // 図形問題用のSVG生成（単元名の部分一致に対応）
  static generateGeometryProblem(grade, unitName) {
    console.log(`SVG問題生成チェック - 学年: ${grade}, 単元: ${unitName}`);
    
    // 単元名に特定のキーワードが含まれているかチェック
    const unitLower = unitName.toLowerCase();
    
    // 1年生
    if (grade === 1) {
      if (unitLower.includes('図形') || unitLower.includes('形')) {
        console.log('1年生の形の問題を生成');
        return this.generateBasicShapeProblem();
      }
    }
    
    // 2年生
    if (grade === 2) {
      if (unitLower.includes('図形') || unitLower.includes('はこ') || unitLower.includes('形')) {
        console.log('2年生の図形問題を生成');
        return this.generateShapeIdentification();
      }
    }
    
    // 3年生
    if (grade === 3) {
      if (unitLower.includes('三角形')) {
        console.log('3年生の三角形問題を生成');
        return this.generateTriangleProblem();
      }
    }
    
    // 4年生
    if (grade === 4) {
      if (unitLower.includes('四角形') || unitLower.includes('平行')) {
        console.log('4年生の四角形問題を生成');
        return this.generateQuadrilateralProblem();
      }
      if (unitLower.includes('面積')) {
        console.log('4年生の面積問題を生成');
        return this.generateAreaProblem();
      }
      if (unitLower.includes('角')) {
        console.log('4年生の角度問題を生成');
        return this.generateAngleProblem();
      }
    }
    
    // 5年生
    if (grade === 5) {
      if (unitLower.includes('円') || unitLower.includes('正多角形')) {
        console.log('5年生の円・多角形問題を生成');
        return this.generateCircleProblem();
      }
      if (unitLower.includes('合同')) {
        console.log('5年生の合同問題を生成');
        return this.generateCongruentProblem();
      }
    }
    
    // 6年生
    if (grade === 6) {
      if (unitLower.includes('拡大') || unitLower.includes('縮')) {
        console.log('6年生の拡大縮小問題を生成');
        return this.generateScaleProblem();
      }
      if (unitLower.includes('円') && unitLower.includes('面積')) {
        console.log('6年生の円の面積問題を生成');
        return this.generateCircleAreaProblem();
      }
      if (unitLower.includes('対称')) {
        console.log('6年生の対称問題を生成');
        return this.generateSymmetryProblem();
      }
    }
    
    console.log('SVG問題に該当しない単元');
    return null;
  }

  // 基本的な形の問題（1年生用）
  static generateBasicShapeProblem() {
    const shapes = [
      { name: 'まる', svg: 'circle', color: 'lightblue' },
      { name: 'さんかく', svg: 'triangle', color: 'lightgreen' },
      { name: 'しかく', svg: 'square', color: 'lightyellow' }
    ];
    const selected = shapes[Math.floor(Math.random() * shapes.length)];
    
    let svgContent = '';
    switch(selected.svg) {
      case 'circle':
        svgContent = `<circle cx="150" cy="100" r="50" fill="${selected.color}" stroke="black" stroke-width="2"/>`;
        break;
      case 'triangle':
        svgContent = `<polygon points="150,50 100,150 200,150" fill="${selected.color}" stroke="black" stroke-width="2"/>`;
        break;
      case 'square':
        svgContent = `<rect x="100" y="50" width="100" height="100" fill="${selected.color}" stroke="black" stroke-width="2"/>`;
        break;
    }
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        ${svgContent}
        <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">これはなんのかたち？</text>
      </svg>
    `;
    
    return {
      problem: `したのずけいはなんというかたちですか？`,
      svg: svg,
      answer: selected.name,
      explanation: `これは${selected.name}です。${selected.name}のかたちをおぼえましょう。`
    };
  }

  // 形の識別問題（2年生用）
  static generateShapeIdentification() {
    const shapes = ['正方形', '長方形', '三角形', '円'];
    const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let svg = '';
    let answer = '';
    
    switch(selectedShape) {
      case '正方形':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <rect x="100" y="50" width="100" height="100" 
                  fill="lightblue" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '正方形';
        break;
      case '長方形':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <rect x="75" y="60" width="150" height="80" 
                  fill="lightgreen" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '長方形';
        break;
      case '三角形':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <polygon points="150,50 100,140 200,140" 
                     fill="lightyellow" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '三角形';
        break;
      case '円':
        svg = `
          <svg width="300" height="200" viewBox="0 0 300 200">
            <circle cx="150" cy="95" r="50" 
                    fill="lightcoral" stroke="black" stroke-width="2"/>
            <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この形の名前は？</text>
          </svg>
        `;
        answer = '円';
        break;
    }

    return {
      problem: `下の図形の名前を答えましょう。`,
      svg: svg,
      answer: answer,
      explanation: `この図形は${answer}です。${answer}の特ちょうを覚えておきましょう。`
    };
  }

  // 三角形の問題（3年生用）
  static generateTriangleProblem() {
    const types = [
      { 
        name: '正三角形', 
        points: '150,50 100,140 200,140',
        explanation: '3つの辺の長さがすべて同じ'
      },
      { 
        name: '二等辺三角形', 
        points: '150,50 110,140 190,140',
        explanation: '2つの辺の長さが同じ'
      }
    ];
    const selected = types[Math.floor(Math.random() * types.length)];
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <polygon points="${selected.points}" 
                 fill="lightgreen" stroke="black" stroke-width="2"/>
        <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この三角形の名前は？</text>
      </svg>
    `;
    
    return {
      problem: `下の三角形の種類を答えましょう。`,
      svg: svg,
      answer: selected.name,
      explanation: `この三角形は${selected.name}です。${selected.name}は${selected.explanation}三角形です。`
    };
  }

  // 四角形の問題（4年生用）
  static generateQuadrilateralProblem() {
    const types = [
      { 
        name: '平行四辺形',
        points: '50,100 150,100 180,150 80,150',
        explanation: '向かい合う辺が平行な四角形'
      },
      { 
        name: 'ひし形',
        points: '150,50 200,100 150,150 100,100',
        explanation: '4つの辺がすべて同じ長さの四角形'
      },
      { 
        name: '台形',
        points: '80,120 220,120 180,80 120,80',
        explanation: '1組の向かい合う辺が平行な四角形'
      }
    ];
    
    const selected = types[Math.floor(Math.random() * types.length)];
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <polygon points="${selected.points}" 
                 fill="lightblue" stroke="black" stroke-width="2"/>
        <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">この四角形の名前は？</text>
      </svg>
    `;
    
    return {
      problem: `下の四角形の名前を答えましょう。`,
      svg: svg,
      answer: selected.name,
      explanation: `この四角形は${selected.name}です。${selected.explanation}です。`
    };
  }

  // 長方形の面積問題
  static generateAreaProblem() {
    const width = Math.floor(Math.random() * 8) + 3; // 3-10
    const height = Math.floor(Math.random() * 6) + 2; // 2-7
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <rect x="50" y="50" width="${width * 20}" height="${height * 20}" 
              fill="lightblue" stroke="black" stroke-width="2"/>
        <text x="${50 + width * 10}" y="45" font-size="14" font-family="Arial" text-anchor="middle">${width}cm</text>
        <text x="35" y="${50 + height * 10}" font-size="14" font-family="Arial" text-anchor="middle">${height}cm</text>
        <!-- グリッド線 -->
        ${Array.from({length: width - 1}, (_, i) => 
          `<line x1="${50 + (i + 1) * 20}" y1="50" x2="${50 + (i + 1) * 20}" y2="${50 + height * 20}" stroke="gray" stroke-width="0.5" stroke-dasharray="2,2"/>`
        ).join('')}
        ${Array.from({length: height - 1}, (_, i) => 
          `<line x1="50" y1="${50 + (i + 1) * 20}" x2="${50 + width * 20}" y2="${50 + (i + 1) * 20}" stroke="gray" stroke-width="0.5" stroke-dasharray="2,2"/>`
        ).join('')}
      </svg>
    `;

    return {
      problem: `下の長方形の面積を求めましょう。`,
      svg: svg,
      answer: `${width * height}㎠`,
      explanation: `長方形の面積は たて × よこ で求められます。${height} × ${width} = ${width * height}㎠です。`
    };
  }

  // 角度問題
  static generateAngleProblem() {
    const angle = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
    const angleRad = (angle * Math.PI) / 180;
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <line x1="100" y1="100" x2="200" y2="100" stroke="black" stroke-width="2"/>
        <line x1="100" y1="100" x2="${100 + 80 * Math.cos(angleRad)}" y2="${100 - 80 * Math.sin(angleRad)}" stroke="black" stroke-width="2"/>
        <path d="M 120 100 A 20 20 0 0 0 ${100 + 20 * Math.cos(angleRad)} ${100 - 20 * Math.sin(angleRad)}" 
              fill="none" stroke="red" stroke-width="2"/>
        <text x="125" y="95" font-size="12" font-family="Arial" fill="red">?</text>
      </svg>
    `;

    return {
      problem: `この角度は何度ですか？`,
      svg: svg,
      answer: `${angle}度`,
      explanation: `この角度は${angle}度です。${angle === 90 ? '直角' : angle < 90 ? '鋭角（90度より小さい）' : '鈍角（90度より大きい）'}です。`
    };
  }

  // 合同な図形（5年生用）
  static generateCongruentProblem() {
    const isCongruent = Math.random() > 0.5;
    const size = Math.floor(Math.random() * 3) + 3; // 3-5
    
    let svg = '';
    if (isCongruent) {
      // 合同な場合
      svg = `
        <svg width="400" height="200" viewBox="0 0 400 200">
          <!-- 図形A -->
          <polygon points="50,50 ${50 + size * 20},50 ${50 + size * 10},${50 + size * 15}" 
                   fill="lightblue" stroke="black" stroke-width="2"/>
          <text x="${50 + size * 10}" y="40" font-size="14" font-family="Arial" text-anchor="middle">図形A</text>
          
          <!-- 図形B（合同・向きが違う） -->
          <polygon points="250,150 ${250 + size * 20},150 ${250 + size * 10},${150 - size * 15}" 
                   fill="lightcoral" stroke="black" stroke-width="2"/>
          <text x="${250 + size * 10}" y="180" font-size="14" font-family="Arial" text-anchor="middle">図形B</text>
        </svg>
      `;
    } else {
      // 合同でない場合（大きさが違う）
      svg = `
        <svg width="400" height="200" viewBox="0 0 400 200">
          <!-- 図形A -->
          <polygon points="50,50 ${50 + size * 20},50 ${50 + size * 10},${50 + size * 15}" 
                   fill="lightblue" stroke="black" stroke-width="2"/>
          <text x="${50 + size * 10}" y="40" font-size="14" font-family="Arial" text-anchor="middle">図形A</text>
          
          <!-- 図形B（合同でない・大きさが違う） -->
          <polygon points="250,80 ${250 + size * 15},80 ${250 + size * 7.5},${80 + size * 11}" 
                   fill="lightcoral" stroke="black" stroke-width="2"/>
          <text x="${250 + size * 7.5}" y="180" font-size="14" font-family="Arial" text-anchor="middle">図形B</text>
        </svg>
      `;
    }
    
    return {
      problem: `図形Aと図形Bは合同ですか？`,
      svg: svg,
      answer: isCongruent ? '合同です' : '合同ではありません',
      explanation: isCongruent ? 
        '図形Aと図形Bは形と大きさが同じなので合同です。向きが違っても、ぴったり重ねることができます。' :
        '図形Aと図形Bは形は似ていますが、大きさが違うので合同ではありません。合同な図形は形も大きさも同じでなければなりません。'
    };
  }

  // 円の問題（5年生用）
  static generateCircleProblem() {
    const radius = Math.floor(Math.random() * 5) + 3; // 3-7
    const circumference = Math.round(radius * 2 * 3.14 * 100) / 100;
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <circle cx="150" cy="100" r="${radius * 15}" 
                fill="none" stroke="black" stroke-width="2"/>
        <line x1="150" y1="100" x2="${150 + radius * 15}" y2="100" 
              stroke="red" stroke-width="2"/>
        <text x="${150 + radius * 7}" y="95" font-size="12" font-family="Arial" fill="red">${radius}cm</text>
        <circle cx="150" cy="100" r="2" fill="black"/>
        <text x="150" y="180" font-size="14" font-family="Arial" text-anchor="middle">円周の長さは？</text>
      </svg>
    `;

    return {
      problem: `半径が${radius}cmの円の円周の長さを求めましょう。（円周率は3.14とします）`,
      svg: svg,
      answer: `${circumference}cm`,
      explanation: `円周の長さは 直径 × 円周率 で求められます。直径は半径の2倍なので、${radius} × 2 × 3.14 = ${circumference}cmです。`
    };
  }

  // 円の面積問題
  static generateCircleAreaProblem() {
    const radius = Math.floor(Math.random() * 5) + 3; // 3-7
    const area = Math.round(radius * radius * 3.14 * 100) / 100;
    
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200">
        <circle cx="150" cy="100" r="${radius * 15}" 
                fill="lightgreen" stroke="black" stroke-width="2"/>
        <line x1="150" y1="100" x2="${150 + radius * 15}" y2="100" 
              stroke="red" stroke-width="2"/>
        <text x="${150 + radius * 7}" y="95" font-size="12" font-family="Arial" fill="red">${radius}cm</text>
        <circle cx="150" cy="100" r="2" fill="black"/>
      </svg>
    `;

    return {
      problem: `半径が${radius}cmの円の面積を求めましょう。（円周率は3.14とします）`,
      svg: svg,
      answer: `${area}㎠`,
      explanation: `円の面積は 半径 × 半径 × 円周率 で求められます。${radius} × ${radius} × 3.14 = ${area}㎠です。`
    };
  }

  // 対称な図形（6年生用）
  static generateSymmetryProblem() {
    const symmetryTypes = ['線対称', '点対称'];
    const selected = symmetryTypes[Math.floor(Math.random() * symmetryTypes.length)];
    
    let svg = '';
    if (selected === '線対称') {
      svg = `
        <svg width="300" height="200" viewBox="0 0 300 200">
          <!-- 対称軸 -->
          <line x1="150" y1="30" x2="150" y2="170" stroke="red" stroke-width="2" stroke-dasharray="5,5"/>
          <!-- 線対称な図形 -->
          <polygon points="100,50 150,80 150,120 100,150" fill="lightblue" stroke="black" stroke-width="2"/>
          <polygon points="200,50 150,80 150,120 200,150" fill="lightblue" stroke="black" stroke-width="2"/>
          <text x="150" y="190" font-size="14" font-family="Arial" text-anchor="middle">この図形の対称性は？</text>
        </svg>
      `;
    } else {
      svg = `
        <svg width="300" height="200" viewBox="0 0 300 200">
          <!-- 対称の中心 -->
          <circle cx="150" cy="100" r="3" fill="red"/>
          <!-- 点対称な図形 -->
          <polygon points="120,70 180,70 180,100" fill="lightgreen" stroke="black" stroke-width="2"/>
          <polygon points="180,130 120,130 120,100" fill="lightgreen" stroke="black" stroke-width="2"/>
          <text x="150" y="190" font-size="14" font-family="Arial" text-anchor="middle">この図形の対称性は？</text>
        </svg>
      `;
    }
    
    return {
      problem: `下の図形は線対称ですか、点対称ですか？`,
      svg: svg,
      answer: selected,
      explanation: `この図形は${selected}です。${selected === '線対称' ? '赤い線で折ると、ぴったり重なります。' : '赤い点を中心に180度回転させると、ぴったり重なります。'}`
    };
  }

  // 拡大縮小問題
  static generateScaleProblem() {
    const originalSize = Math.floor(Math.random() * 3) + 2; // 2-4
    const scale = 2;
    const newSize = originalSize * scale;
    
    const svg = `
      <svg width="400" height="200" viewBox="0 0 400 200">
        <!-- 元の図形 -->
        <rect x="50" y="50" width="${originalSize * 20}" height="${originalSize * 20}" 
              fill="lightblue" stroke="black" stroke-width="2"/>
        <text x="60" y="45" font-size="12" font-family="Arial">${originalSize}cm</text>
        <text x="25" y="70" font-size="12" font-family="Arial">${originalSize}cm</text>
        <text x="70" y="140" font-size="12" font-family="Arial">元の正方形</text>
        
        <!-- 矢印 -->
        <text x="150" y="100" font-size="16" font-family="Arial">→ ${scale}倍 →</text>
        
        <!-- 拡大された図形 -->
        <rect x="250" y="30" width="${newSize * 20}" height="${newSize * 20}" 
              fill="lightcoral" stroke="black" stroke-width="2"/>
        <text x="260" y="25" font-size="12" font-family="Arial">?cm</text>
        <text x="220" y="50" font-size="12" font-family="Arial">?cm</text>
        <text x="270" y="170" font-size="12" font-family="Arial">拡大した正方形</text>
      </svg>
    `;

    return {
      problem: `左の正方形を2倍に拡大しました。拡大した正方形の1辺の長さは何cmですか？`,
      svg: svg,
      answer: `${newSize}cm`,
      explanation: `元の長さが${originalSize}cmなので、2倍すると${originalSize} × 2 = ${newSize}cmになります。`
    };
  }
}

module.exports = SVGGeometryService;